require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize express app
const app = express();

// CORS origins from environment or defaults
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:52600'];

// Middleware
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// 404 handler for undefined routes
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: ['/health', '/api/test', '/api/calendar']
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