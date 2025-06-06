const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Middleware to check if Reservation model is loaded
const checkReservationModel = (req, res, next) => {
  if (!Reservation) {
      console.error('Reservation model not loaded');
      return res.status(500).json({ error: 'Reservation model not loaded' });
  }
  next();
};

// Will generate: http://localhost:5060/api/reservations/verify/abc123...

console.log('Verification link:', verificationLink);

// Apply middleware to all routes
router.use(checkReservationModel);

const getConfirmationEmailTemplate = (name, formattedDate, startTime, endTime, persons, phone) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Reservation Confirmed!</h1>
              <p style="color: #666; margin-top: 10px;">Your table is reserved and ready for you</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #d4af37;">
              <h2 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Reservation Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                      <td style="padding: 8px 0; color: #666;">Date:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0; color: #666;">Time:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${startTime} - ${endTime}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0; color: #666;">Number of Guests:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${persons}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px 0; color: #666;">Phone:</td>
                      <td style="padding: 8px 0; font-weight: bold;">${phone}</td>
                  </tr>
              </table>
          </div>

          <div style="margin: 30px 0; text-align: center;">
              <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
                  We are delighted to confirm your reservation at Dalchini Tomintoul. 
                  Our team is looking forward to providing you with an exceptional dining experience.
              </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Important Information</h3>
              <ul style="color: #666; padding-left: 20px;">
                  <li>Please arrive 5-10 minutes before your reservation time</li>
                  <li>If you need to make any changes, please contact us at least 24 hours in advance</li>
                  <li>For parties of 6 or more, a cancellation fee may apply</li>
              </ul>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; color: #666;">We look forward to welcoming you!</p>
              <p style="margin: 10px 0 0 0; font-weight: bold;">Dalchini Tomintoul Team</p>
              <p style="margin: 5px 0; color: #666;">
                  Phone: +44 1807 580 777<br>
                  Email: reservations@dalchinitomintoul.com
              </p>
          </div>
      </div>
  `;
};

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
          <p>We’ve successfully received your table booking request. Your reservation details have been forwarded to the restaurant team. Once your request is reviewed and confirmed, you will receive a confirmation email at the same email address you provided: </p>
          <p> Booking Summary::</p>
          <ul>
            <li>Name: ${name}</li>
            <li>Date: ${date}</li>
            <li>Date & Time: ${startTime} - ${endTime}</li>
            <li>Number of Guests: ${persons}</li>
            <li>Phone: ${phone}</li>
            <li>Special Requests (if any)</li>
          </ul>
          <p>We’re excited to host you and look forward to offering a delightful dining experience.</p>
          <p>If you have any questions or need to make changes to your request, feel free to contact us at [restaurant email or phone number].</p>
            <p>Thank you once again for your interest. We’ll keep you updated!</p>
               <p>Warm regards</p>
               <ul>
                <p>Dalchini Tomintoul Team</p>
                <p>https://dalchini.devanddeploy.cloud/</p>
               </ul>
          
        `,
            });
            console.log('Verification email sent to:', email);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
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




// Send confirmation email
router.post('/:id/send-confirmation', async (req, res) => {
  try {
      const { email, name, date, startTime, endTime, persons, phone } = req.body;

      // Format the date for display
      const formattedDate = new Date(date).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });

      // Send confirmation email
      await req.transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: email,
          subject: 'Your Dalchini Tomintoul Reservation is Confirmed!',
          html: getConfirmationEmailTemplate(name, formattedDate, startTime, endTime, persons, phone)
      });

      res.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
      console.error('Error sending confirmation email:', error);
      res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

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

router.get('/verify/:token', async (req, res) => {
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

      // Send a simple HTML response for better user experience
      res.send(`
          <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h2 style="color: #d4af37;">Email Verified Successfully!</h2>
                  <p>Your reservation has been verified. You will receive a confirmation email once your reservation is approved.</p>
                  <p>Thank you for choosing Dalchini Tomintoul!</p>
              </body>
          </html>
      `);
  } catch (error) {
      console.error('Error verifying reservation:', error);
      res.status(500).send(`
          <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                  <h2 style="color: #dc3545;">Verification Failed</h2>
                  <p>An error occurred while verifying your reservation. Please contact us directly.</p>
              </body>
          </html>
      `);
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

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find reservation by ID
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Update status
    reservation.status = status;
    await reservation.save();

    // Send confirmation email if status changed to confirmed
    if (status === 'confirmed') {
      try {
        const formattedDate = new Date(reservation.date).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email using the transporter
        await req.transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL,
          to: reservation.email,
          subject: 'Your Dalchini Tomintoul Reservation is Confirmed!',
          html: getConfirmationEmailTemplate(
            reservation.name, 
            formattedDate, 
            reservation.startTime, 
            reservation.endTime, 
            reservation.persons, 
            reservation.phone
          )
        });
        
        console.log('Confirmation email sent to:', reservation.email);
      } catch (emailError) {
        console.error('Error sending confirmation email:', {
          error: emailError.message,
          stack: emailError.stack,
          reservationId: reservation._id,
          email: reservation.email
        });
        // Don't fail the request if email fails
      }
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
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