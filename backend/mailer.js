import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure Outlook / Office 365 or custom domain SMTP transporter
 */
export function getTransporter() {
  const user = process.env.OUTLOOK_EMAIL || process.env.SMTP_USER;
  const pass = process.env.OUTLOOK_PASSWORD || process.env.SMTP_PASS;
  const host = process.env.OUTLOOK_HOST || process.env.SMTP_HOST || 'smtp.office365.com';
  const port = parseInt(process.env.OUTLOOK_PORT || process.env.SMTP_PORT || '587', 10);

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });
}

/**
 * Send an email notification when a customer books a botanist consultation slot
 */
export async function sendBookingEmails(booking) {
  const {
    bookingId,
    customerName,
    customerEmail,
    customerPhone,
    slotDate,
    slotTime,
    plantType,
    plantIssue,
    createdAt
  } = booking;

  const senderEmail = process.env.OUTLOOK_EMAIL || process.env.SMTP_USER;
  const adminRecipient = process.env.NOTIFICATION_EMAIL || senderEmail || 'info@plantme.in';

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[SMTP Notice] Outlook credentials not yet configured in .env. Booking #${bookingId} saved in database.`);
    return {
      success: true,
      delivered: false,
      reason: 'Outlook credentials pending configuration'
    };
  }

  // 1. Email HTML for Admin / PlantMe Team
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
        .card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #1b4332; color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; }
        .content { padding: 24px; }
        .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 10px; borderRadius: 8px; margin-bottom: 16px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; }
        .table td.label { font-weight: 700; color: #64748b; width: 35%; }
        .table td.value { font-weight: 600; color: #0f172a; }
        .issue-box { background: #f8fafc; border-left: 4px solid #16a34a; padding: 14px; margin: 18px 0; border-radius: 6px; font-size: 13.5px; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🌿 New Botanist Consultation Slot Booked</h1>
          <p>PlantMe.in Virtual Plant Doctor Service</p>
        </div>
        <div class="content">
          <div class="badge">Booking ID: ${bookingId}</div>
          
          <table class="table">
            <tr>
              <td class="label">Customer Name</td>
              <td class="value"><strong>${customerName}</strong></td>
            </tr>
            <tr>
              <td class="label">Phone / WhatsApp</td>
              <td class="value"><a href="tel:${customerPhone}" style="color: #1b4332; font-weight: 700;">${customerPhone}</a></td>
            </tr>
            <tr>
              <td class="label">Customer Email</td>
              <td class="value"><a href="mailto:${customerEmail}" style="color: #1b4332;">${customerEmail}</a></td>
            </tr>
            <tr>
              <td class="label">Scheduled Date</td>
              <td class="value" style="color: #166534; font-weight: 800;">${slotDate}</td>
            </tr>
            <tr>
              <td class="label">Scheduled Time</td>
              <td class="value" style="color: #166534; font-weight: 800;">${slotTime}</td>
            </tr>
            <tr>
              <td class="label">Plant / Specimen</td>
              <td class="value">${plantType || 'Not specified'}</td>
            </tr>
          </table>

          <div style="margin-top: 18px; font-weight: 700; font-size: 13px; color: #334155;">Reported Symptoms / Issues:</div>
          <div class="issue-box">
            "${plantIssue || 'Customer requested live visual checkup for general health & potting advice.'}"
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
            Please ensure a Senior Horticulturist is available on the video desk at the scheduled slot.
          </p>
        </div>
        <div class="footer">
          PlantMe.in Hyperlocal Botanical Operations • Automated Slot System
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. Email HTML for Customer Confirmation
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
        .card { background: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #1b4332; color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; }
        .content { padding: 24px; }
        .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; text-align: center; }
        .highlight-date { font-size: 18px; font-weight: 800; color: #166534; }
        .highlight-time { font-size: 15px; font-weight: 700; color: #1b4332; margin-top: 4px; }
        .instructions { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🌿 Consultation Confirmed!</h1>
          <p>Your PlantMe Plant Doctor appointment is locked in</p>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p style="font-size: 13.5px; color: #475569;">
            We have reserved your dedicated 1-on-1 virtual plant consultation slot with our certified plant pathology expert.
          </p>

          <div class="highlight-box">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #16a34a; letter-spacing: 0.5px;">YOUR RESERVED SLOT</div>
            <div class="highlight-date">${slotDate}</div>
            <div class="highlight-time">⏰ ${slotTime}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Booking Ref: #${bookingId}</div>
          </div>

          <div class="instructions">
            <strong>📋 How to prepare for your consultation:</strong>
            <ul style="padding-left: 20px; margin: 8px 0 0 0;">
              <li>Keep your plant in a well-lit area so stems and soil can be seen clearly on video.</li>
              <li>Have details ready on your watering frequency and recent fertilizer use.</li>
              <li>Our botanist will diagnose yellowing, root vitality, and send you a certified written recovery plan.</li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Need to reschedule? Reply to this email or message us on WhatsApp at <strong>+91 88856 00899</strong>.
          </p>
        </div>
        <div class="footer">
          Happy Gardening! 🌿 Team PlantMe.in
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // 1. Send notification to admin / team
    const adminResult = await transporter.sendMail({
      from: `"PlantMe Plant Doctor" <${senderEmail}>`,
      to: adminRecipient,
      subject: `🌿 New Botanist Slot Booked: ${customerName} (${slotDate} at ${slotTime})`,
      html: adminHtml
    });
    console.log(`[SMTP Success] Sent admin booking notification email. MessageId: ${adminResult.messageId}`);

    // 2. Send confirmation to customer if valid email provided
    if (customerEmail && customerEmail.includes('@')) {
      try {
        await transporter.sendMail({
          from: `"PlantMe.in Care Desk" <${senderEmail}>`,
          to: customerEmail,
          subject: `🌿 Confirmed: Your Plant Doctor Consultation on ${slotDate} (${slotTime})`,
          html: customerHtml
        });
        console.log(`[SMTP Success] Sent customer confirmation email to ${customerEmail}`);
      } catch (custErr) {
        console.warn(`[SMTP Warning] Customer confirmation email failed: ${custErr.message}`);
      }
    }

    return { success: true, delivered: true, messageId: adminResult.messageId };
  } catch (error) {
    console.error(`[SMTP Error] Failed to send email via Outlook:`, error);
    return { success: true, delivered: false, error: error.message };
  }
}
