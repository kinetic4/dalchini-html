const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar');

// Middleware to check if Calendar model is loaded
const checkCalendarModel = (req, res, next) => {
  if (!Calendar) {
    console.error('Calendar model not loaded');
    return res.status(500).json({ error: 'Calendar model not loaded' });
  }
  next();
};

// Apply middleware to all routes
router.use(checkCalendarModel);

// Get all dates
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all calendar dates');
    const dates = await Calendar.find();
    console.log('Found dates:', dates);
    res.json(dates);
  } catch (error) {
    console.error('Error fetching dates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific date status
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Fetching date:', date);
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const calendarDate = await Calendar.findOne({ date });
    console.log('Found date:', calendarDate);
    res.json(calendarDate || { date, status: 'available', note: '' });
  } catch (error) {
    console.error('Error fetching date:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update date status (POST)
router.post('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { status, note } = req.body;
    console.log('Updating date:', date, 'with status:', status, 'note:', note);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Validate status
    if (!['available', 'unavailable'].includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ error: 'Invalid status. Use "available" or "unavailable"' });
    }

    // Log the collection name being used
    console.log('Using collection:', Calendar.collection.name);

    const calendarDate = await Calendar.findOneAndUpdate(
      { date },
      { date, status, note },
      { upsert: true, new: true }
    );
    console.log('Updated date:', calendarDate);
    res.json(calendarDate);
  } catch (error) {
    console.error('Error updating date:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update date status (PUT)
router.put('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { status, note } = req.body;
    console.log('Updating date:', date, 'with status:', status, 'note:', note);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Validate status
    if (!['available', 'unavailable'].includes(status)) {
      console.error('Invalid status:', status);
      return res.status(400).json({ error: 'Invalid status. Use "available" or "unavailable"' });
    }

    const calendarDate = await Calendar.findOneAndUpdate(
      { date },
      { date, status, note },
      { upsert: true, new: true }
    );
    console.log('Updated date:', calendarDate);
    res.json(calendarDate);
  } catch (error) {
    console.error('Error updating date:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a date
router.delete('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log('Deleting date:', date);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Invalid date format:', date);
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const result = await Calendar.deleteOne({ date });
    console.log('Delete result:', result);
    res.json({ message: 'Date deleted successfully' });
  } catch (error) {
    console.error('Error deleting date:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;