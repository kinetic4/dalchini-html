const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const crypto = require('crypto');

// Middleware to check if Reservation model is loaded
const checkReservationModel = (req, res, next) => {
    if (!Reservation) {
        console.error('Reservation model not loaded');
        return res.status(500).json({ error: 'Reservation model not loaded' });
    }
    next();
};

// Apply middleware to all routes
router.use(checkReservationModel);

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            persons,
            date,
            startTime,
            endTime
        } = req.body;

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const reservation = new Reservation({
            name,
            phone,
            email,
            persons,
            date,
            startTime,
            endTime,
            verificationToken,
            status: 'pending'
        });

        await reservation.save();
        console.log('New reservation created:', reservation);

        // Send verification email
        try {
            const verificationLink = `${process.env.BACKEND_URL}/api/reservations/verify/${verificationToken}`;

            await req.transporter.sendMail({
                from: process.env.SMTP_FROM_EMAIL,
                to: email,
                subject: 'Verify your Dalchini Tomintoul Reservation Email',
                html: `
          <p>Dear ${name},</p>
          <p>Thank you for your reservation request at Dalchini Tomintoul.</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationLink}">Verify Email Address</a></p>
          <p>Your Reservation Details:</p>
          <ul>
            <li>Name: ${name}</li>
            <li>Date: ${date}</li>
            <li>Time: ${startTime} - ${endTime}</li>
            <li>Guests: ${persons}</li>
            <li>Phone: ${phone}</li>
          </ul>
          <p>Best regards,<br/>Dalchini Tomintoul Team</p>
        `,
            });
            console.log('Verification email sent to:', email);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Optionally, handle this error differently, maybe log to a file or send a notification
            // The reservation is already saved, so we might still proceed with the response
        }

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation,
            verificationToken
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update reservation status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.json(reservation);
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update reservation by ID
router.patch('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.json(reservation);
    } catch (error) {
        console.error('Error updating reservation by ID:', error);
        res.status(400).json({ error: error.message });
    }
});

// Verify reservation
router.post('/verify/:token', async (req, res) => {
    try {
        const reservation = await Reservation.findOne({ verificationToken: req.params.token });

        if (!reservation) {
            return res.status(404).json({ error: 'Invalid verification token' });
        }

        if (reservation.isVerified) {
            return res.status(400).json({ error: 'Reservation already verified' });
        }

        reservation.isVerified = true;
        reservation.verificationToken = null;
        await reservation.save();

        res.json({
            message: 'Reservation verified successfully',
            reservation
        });
    } catch (error) {
        console.error('Error verifying reservation:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get reservations by date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
    try {
        const { startDate, endDate } = req.params;

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const reservations = await Reservation.findByDateRange(startDate, endDate);
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching reservations by date range:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 