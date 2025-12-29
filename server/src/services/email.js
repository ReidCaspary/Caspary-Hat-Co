import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Use Resend if API key is set, otherwise fall back to nodemailer
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Create nodemailer transporter (fallback)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email using Resend or Nodemailer
const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Caspary Hat Co. <noreply@casparyhats.com>';

  if (resend) {
    // Use Resend
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html
    });
    if (error) throw error;
    return true;
  } else {
    // Use Nodemailer
    const transporter = createTransporter();
    await transporter.sendMail({ from, to, subject, html });
    return true;
  }
};

// Send contact form confirmation to customer
export const sendContactConfirmation = async (inquiry) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B4513;">Thank You, ${inquiry.name}!</h1>
      <p>We've received your inquiry and will get back to you within 24-48 hours.</p>

      <h3>Your Inquiry Details:</h3>
      <ul>
        ${inquiry.event_type ? `<li><strong>Event Type:</strong> ${inquiry.event_type}</li>` : ''}
        ${inquiry.quantity ? `<li><strong>Quantity:</strong> ${inquiry.quantity}</li>` : ''}
        ${inquiry.budget ? `<li><strong>Budget:</strong> ${inquiry.budget}</li>` : ''}
      </ul>

      ${inquiry.message ? `<p><strong>Your Message:</strong><br>${inquiry.message}</p>` : ''}

      <hr style="border: 1px solid #eee; margin: 20px 0;">

      <p>If you have any immediate questions, feel free to reply to this email or call us.</p>

      <p>Best regards,<br>
      <strong>The Caspary Hat Co. Team</strong></p>
    </div>
  `;

  try {
    await sendEmail({
      to: inquiry.email,
      subject: 'Thank You for Contacting Caspary Hat Co.',
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send contact confirmation:', error);
    return false;
  }
};

// Send notification to admin about new inquiry
export const sendAdminNotification = async (inquiry) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('No admin email configured for notifications');
    return false;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B4513;">New Contact Inquiry</h1>

      <h3>Contact Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${inquiry.name}</li>
        <li><strong>Email:</strong> ${inquiry.email}</li>
        ${inquiry.phone ? `<li><strong>Phone:</strong> ${inquiry.phone}</li>` : ''}
      </ul>

      <h3>Event Details:</h3>
      <ul>
        ${inquiry.event_type ? `<li><strong>Event Type:</strong> ${inquiry.event_type}</li>` : ''}
        ${inquiry.event_date ? `<li><strong>Event Date:</strong> ${inquiry.event_date}</li>` : ''}
        ${inquiry.quantity ? `<li><strong>Quantity:</strong> ${inquiry.quantity}</li>` : ''}
        ${inquiry.budget ? `<li><strong>Budget:</strong> ${inquiry.budget}</li>` : ''}
      </ul>

      ${inquiry.message ? `<h3>Message:</h3><p>${inquiry.message}</p>` : ''}

      ${inquiry.whiteboard_image_url ? `<p><a href="${inquiry.whiteboard_image_url}">View Whiteboard Drawing</a></p>` : ''}
      ${inquiry.file_url ? `<p><a href="${inquiry.file_url}">View Attached File</a></p>` : ''}

      <hr style="border: 1px solid #eee; margin: 20px 0;">

      <p><a href="${process.env.FRONTEND_URL}/admin/inquiries">View in Admin Dashboard</a></p>
    </div>
  `;

  try {
    await sendEmail({
      to: adminEmail,
      subject: `New Inquiry from ${inquiry.name}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
};

// Send newsletter welcome email
export const sendNewsletterWelcome = async (email) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8B4513;">Welcome to Our Newsletter!</h1>

      <p>Thank you for subscribing to the Caspary Hat Co. newsletter!</p>

      <p>You'll be the first to know about:</p>
      <ul>
        <li>New hat styles and designs</li>
        <li>Special promotions and discounts</li>
        <li>Behind-the-scenes looks at our craft</li>
        <li>Tips for choosing the perfect custom hats</li>
      </ul>

      <hr style="border: 1px solid #eee; margin: 20px 0;">

      <p style="font-size: 12px; color: #666;">
        If you didn't subscribe to this newsletter, you can safely ignore this email.
      </p>

      <p>Best regards,<br>
      <strong>The Caspary Hat Co. Team</strong></p>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to the Caspary Hat Co. Newsletter!',
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send newsletter welcome:', error);
    return false;
  }
};

export default {
  sendContactConfirmation,
  sendAdminNotification,
  sendNewsletterWelcome
};
