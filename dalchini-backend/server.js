require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const crypto = require('crypto');

// Check required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRE', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS origins from environment or defaults
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'https://api.dalchiniscotland.com', 'https://booking.dalchiniscotland.com', 'https://admin.dalchiniscotland.com'];

// Middleware
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());


// Add this middleware in your server.js
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// FIXED: SMTP Transporter setup - moved before middleware that uses it
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
      console.error('SMTP Connection Error:', {
        error: error.message,
        stack: error.stack,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE
      });
    } else {
      console.log('SMTP Server is ready to take our messages');
    }
});

// Simple email sending helper function
const sendEmail = async (options) => {
    const mailOptions = {
        from: `"Dalchini Tomintoul" <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Attach both transporter and sendEmail helper to request object
app.use((req, res, next) => {
    req.transporter = transporter;
    req.sendEmail = sendEmail;
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    if (process.env.LOG_LEVEL === 'debug') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('Body:', req.body);
        }
    }
    next();
});


// Health check endpoint - BEFORE other routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        corsOrigins: corsOrigins
    });
});

// Import and use calendar routes
try {
    const calendarRoutes = require('./routes/calendar');
    app.use('/api/calendar', calendarRoutes);
    console.log('✅ Calendar routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading calendar routes:', error.message);
    // Create fallback route
    app.get('/api/calendar', (req, res) => {
        res.status(500).json({ error: 'Calendar routes failed to load', details: error.message });
    });
}

// Import and use reservation routes
try {
    const reservationRoutes = require('./routes/reservations');
    app.use('/api/reservations', reservationRoutes);
    console.log('✅ Reservation routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading reservation routes:', error.message);
    // Create fallback route
    app.get('/api/reservations', (req, res) => {
        res.status(500).json({ error: 'Reservation routes failed to load', details: error.message });
    });
}

// Import and use auth routes
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Authentication routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading authentication routes:', error.message);
    // Create fallback route
    app.get('/api/auth', (req, res) => {
        res.status(500).json({ error: 'Authentication routes failed to load', details: error.message });
    });
}

// 404 handler for undefined routes
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: ['/health', '/api/test', '/api/calendar', '/api/reservations']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('🔄 Connecting to MongoDB...');

        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
            console.log(`📅 Calendar API: http://localhost:${PORT}/api/calendar`);
            console.log(`📝 Reservations API: http://localhost:${PORT}/api/reservations`);
            console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

startServer();