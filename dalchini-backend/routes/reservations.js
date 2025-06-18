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

const getVerificationEmailTemplate = (name, date, startTime, endTime, persons, phone, verificationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Booking Your Reservation</h1>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
          Dear ${name},
        </p>
        <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
          We've successfully received your table booking request. Your reservation details have been forwarded to the restaurant team. Once your request is reviewed and confirmed, you will receive a confirmation email at the same email address you provided
        </p>
      </div>

      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #d4af37;">
        <h2 style="color: #2c3e50; margin-top: 0; font-size: 20px;">Your Booking Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Date:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(date).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}</td>
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

    

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">What happens next?</h3>
        <ul style="color: #666; padding-left: 20px;">
          <li>Click the verification button above to confirm your email address</li>
          <li>Your reservation details will be forwarded to our restaurant team</li>
          <li>Once reviewed and confirmed, you'll receive a confirmation email</li>
          <li>We'll contact you if we need any additional information</li>
        </ul>
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Important:</strong> This verification link will expire in 24 hours. 
          If you don't verify your email within this time, please submit a new reservation request.
        </p>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <p style="color: #2c3e50; font-size: 16px; line-height: 1.6;">
          We're excited to host you and look forward to offering a delightful dining experience.
        </p>
        <p style="color: #666; font-size: 14px;">
          If you have any questions or need to make changes to your request, feel free to contact us.
        </p>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0; color: #666;">Thank you once again for your interest. We'll keep you updated!</p>
        <p style="margin: 10px 0 0 0; font-weight: bold;">Warm regards</p>
        <p style="margin: 5px 0; font-weight: bold;">Dalchini Tomintoul Team</p>
        <p style="margin: 5px 0; color: #666;">
          Phone: +44 1807 580 777<br>
          Email: reservations@dalchinitomintoul.com<br>
          Website: <a href="https://dalchini.devanddeploy.cloud/" style="color: #d4af37;">https://dalchini.devanddeploy.cloud/</a>
        </p>
      </div>
    </div>
  `;
};

// =======================
// SPECIFIC ROUTES FIRST (BEFORE PARAMETERIZED ROUTES)
// =======================

// Test SMTP connection - MOVED TO TOP
router.get('/test-smtp-connection', async (req, res) => {
  console.log('=== SMTP CONNECTION TEST ===');
  
  try {
    if (!req.transporter) {
      return res.status(500).json({ error: 'Transporter not available' });
    }

    console.log('🔍 Verifying SMTP connection...');
    const verified = await req.transporter.verify();
    
    console.log('✅ SMTP connection verified:', verified);
    
    res.json({
      success: true,
      message: 'SMTP connection is working',
      verified: verified,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        from: process.env.SMTP_FROM_EMAIL
      }
    });

  } catch (error) {
    console.error('❌ SMTP verification failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
});

// Test email endpoint - MOVED TO TOP
router.post('/test-email', async (req, res) => {
  console.log('=== EMAIL TEST ENDPOINT HIT ===');
  
  try {
    const { email = 'test@example.com' } = req.body;
    
    console.log('🧪 Testing email to:', email);

    if (!req.sendEmail) {
      console.error('❌ No email helper available');
      return res.status(500).json({ error: 'Email helper not available' });
    }

    // Test simple email
    const testEmailData = {
      to: email,
      subject: 'Test Email from Dalchini Tomintoul',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #d4af37;">Test Email</h2>
          <p>This is a test email to verify SMTP configuration.</p>
          <p>If you receive this, email sending is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };

    console.log('📤 Sending test email...');
    const result = await req.sendEmail(testEmailData);
    
    console.log('✅ Test email sent successfully:', {
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: {
        messageId: result.messageId,
        response: result.response
      }
    });

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
});

// Email verification route - SPECIFIC ROUTE
router.post('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const reservation = await Reservation.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!reservation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Update reservation status
    reservation.status = 'confirmed';
    reservation.verified = true;
    reservation.verificationToken = undefined;
    reservation.verificationExpires = undefined;
    await reservation.save();

    // Send confirmation email
    const formattedDate = new Date(reservation.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = getConfirmationEmailTemplate(
      reservation.name,
      formattedDate,
      reservation.startTime,
      reservation.endTime,
      reservation.persons,
      reservation.phone
    );

    await req.sendEmail({
      to: reservation.email,
      subject: 'Your Dalchini Tomintoul Reservation is Confirmed',
      html: emailHtml
    });

    res.json({
      success: true,
      message: 'Reservation verified and confirmed'
    });

  } catch (error) {
    console.error('Error verifying reservation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get reservations by date range - SPECIFIC ROUTE
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

// =======================
// GENERAL ROUTES
// =======================

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, date, startTime, endTime, persons } = req.body;

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create reservation
        const reservation = new Reservation({
            name,
            email,
            phone,
            date,
            startTime,
            endTime,
            persons,
            verificationToken,
            verificationExpires,
            status: 'pending'
        });

        await reservation.save();
        console.log('New reservation created:', reservation._id);

        // Send verification email
        const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
        const emailHtml = getVerificationEmailTemplate(
            name,
            date,
            startTime,
            endTime,
            persons,
            phone,
            verificationLink
        );

        try {
            await req.sendEmail({
                to: email,
                subject: 'Verify Your Dalchini Tomintoul Reservation',
                html: emailHtml
            });
            console.log('Verification email sent to:', email);
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Reservation request received',
            verificationToken
        });

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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

// Update reservation status
router.patch('/:id/status', async (req, res) => {
  console.log('=== STATUS UPDATE ROUTE HIT ===');
  console.log('Request ID:', req.params.id);
  console.log('Request Body:', req.body);
  console.log('Transporter available:', !!req.transporter);

  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'confirmed', 'rejected', 'cancelled'].includes(status)) {
      console.log('❌ Invalid status:', status);
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find reservation by ID
    console.log('🔍 Finding reservation with ID:', req.params.id);
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      console.log('❌ Reservation not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Reservation not found' });
    }

    console.log('✅ Found reservation:', {
      id: reservation._id,
      name: reservation.name,
      email: reservation.email,
      currentStatus: reservation.status,
      newStatus: status
    });

    // Update status
    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save();
    
    console.log('✅ Status updated from', oldStatus, 'to', status);

    // Send confirmation email if status changed to confirmed
    if (status === 'confirmed') {
      console.log('🚀 Status is confirmed, attempting to send email...');
      
      // Check environment variables
      console.log('📧 SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM_EMAIL,
        hasTransporter: !!req.transporter
      });

      if (!req.transporter) {
        console.error('❌ No email transporter available');
        return res.status(500).json({ 
          error: 'Email service not configured',
          reservation: reservation 
        });
      }

      try {
        // Format date
        const formattedDate = new Date(reservation.date).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        console.log('📅 Formatted date:', formattedDate);

        // Prepare email content
        const emailData = {
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
        };

        console.log('📧 Email being sent to:', reservation.email);
        console.log('📧 Email subject:', emailData.subject);
        
        // Send email
        const emailResult = await req.transporter.sendMail(emailData);
        
        console.log('✅ Email sent successfully!', {
          messageId: emailResult.messageId,
          response: emailResult.response,
          accepted: emailResult.accepted,
          rejected: emailResult.rejected
        });

        return res.json({
          ...reservation.toObject(),
          emailSent: true,
          emailDetails: {
            messageId: emailResult.messageId,
            accepted: emailResult.accepted
          },
          message: 'Status updated and confirmation email sent successfully'
        });

      } catch (emailError) {
        console.error('❌ Email Error Details:', {
          message: emailError.message,
          code: emailError.code,
          command: emailError.command,
          response: emailError.response,
          responseCode: emailError.responseCode,
          stack: emailError.stack
        });
        
        // Still return success for status update, but note email failure
        return res.json({
          ...reservation.toObject(),
          emailSent: false,
          emailError: {
            message: emailError.message,
            code: emailError.code,
            response: emailError.response
          },
          message: 'Status updated but email failed to send'
        });
      }
    }

    // For non-confirmed status updates
    console.log('✅ Status update completed (no email required)');
    res.json({
      ...reservation.toObject(),
      message: 'Status updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Route Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// =======================
// PARAMETERIZED ROUTES (MUST BE LAST)
// =======================

// Middleware to validate MongoDB ID
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid reservation ID' });
  }
  next();
};

// Apply to all parameterized routes
router.use('/:id', validateObjectId);

// Get reservation by ID - MOVED TO BOTTOM
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

// Update reservation by ID - MOVED TO BOTTOM
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

// Delete reservation - MOVED TO BOTTOM
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