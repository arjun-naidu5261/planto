import dotenv from 'dotenv';
dotenv.config();

// In-memory OTP storage: phone -> { otp, expiresAt, type, name, email, lastSentAt, attempts }
const otpStore = new Map();

// Helper to normalize phone number to standard international format (digits only, e.g. 919885600899)
export const normalizePhone = (rawPhone) => {
  if (!rawPhone) return { valid: false, phone: '', display: '' };
  
  // Strip all non-digit characters
  const digits = rawPhone.toString().replace(/\D/g, '');
  
  let standardized = digits;
  // If 10 digits (e.g., Indian mobile 9885600899), prefix 91
  if (digits.length === 10) {
    standardized = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // 09885600899 -> 919885600899
    standardized = '91' + digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith('91')) {
    standardized = digits;
  }

  if (standardized.length < 10 || standardized.length > 15) {
    return { valid: false, phone: '', display: '' };
  }

  // Format nicely for display: e.g. +91 98856 00899
  const display = standardized.startsWith('91') && standardized.length === 12
    ? `+91 ${standardized.slice(2, 7)} ${standardized.slice(7)}`
    : `+${standardized}`;

  return {
    valid: true,
    phone: standardized,
    display
  };
};

/**
 * Send WhatsApp text message via OpenWA Gateway API
 */
export const sendWhatsAppMessage = async (phone, text) => {
  const baseUrl = process.env.OPENWA_BASE_URL || 'http://localhost:2785';
  const apiKey = process.env.OPENWA_API_KEY || 'owa_k1_efe78fef70b13d678b55129eaea5eb216aec86a5c5c74ba609af7fd8a7f3e9dd';
  const sessionId = process.env.OPENWA_SESSION_ID || '94c1468e-4d28-432e-803a-aae9adba6af4';

  const { valid, phone: normalizedPhone } = normalizePhone(phone);
  if (!valid) {
    throw new Error('Invalid phone number format. Please provide a valid 10-digit mobile number.');
  }

  const chatId = `${normalizedPhone}@c.us`;
  const endpoint = `${baseUrl}/api/sessions/${sessionId}/messages/send-text`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        chatId,
        text
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.warn(`[OpenWA API Warning] Status: ${response.status}`, data);
      throw new Error(data.message || `Failed to send WhatsApp message (Status: ${response.status})`);
    }

    return { success: true, data };
  } catch (error) {
    console.error(`[OpenWA Error sending to ${chatId}]:`, error.message);
    throw error;
  }
};

/**
 * Generate and send 6-digit WhatsApp OTP
 */
export const sendWhatsAppOtp = async ({ phone, type = 'login', name = '' }) => {
  const { valid, phone: normalizedPhone, display } = normalizePhone(phone);
  if (!valid) {
    return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
  }

  // Rate limiting / cooldown check (30 seconds)
  const existing = otpStore.get(normalizedPhone);
  const now = Date.now();
  if (existing && now - existing.lastSentAt < 30000) {
    const waitSec = Math.ceil((30000 - (now - existing.lastSentAt)) / 1000);
    return { 
      success: false, 
      message: `Please wait ${waitSec}s before requesting a new WhatsApp OTP.` 
    };
  }

  // Generate 6-digit cryptographic-style OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes TTL

  otpStore.set(normalizedPhone, {
    otp,
    expiresAt,
    type,
    name: name ? name.trim() : (existing?.name || ''),
    lastSentAt: now,
    attempts: 0
  });

  const actionText = type === 'signup' ? 'Planto Account Registration' : 'Planto Login';
  const greeting = name ? `Hello ${name}!` : 'Hello!';

  const messageText = 
`🌿 *Planto - Plant Nursery & Care* 🌿

${greeting} 👋
Your WhatsApp verification code for *${actionText}* is:

👉  *${otp}*  👈

⏱️ This code is valid for 5 minutes.
🔒 Please do not share this code with anyone.

Happy Planting! 🪴💚
— Team Planto`;

  console.log(`\n========================================`);
  console.log(`[WHATSAPP OTP DISPATCH] To: ${display} (${normalizedPhone})`);
  console.log(`[OTP CODE]: ${otp} (Type: ${type})`);
  console.log(`========================================\n`);

  try {
    await sendWhatsAppMessage(normalizedPhone, messageText);
    return {
      success: true,
      message: `Verification code sent to WhatsApp (${display})`,
      displayPhone: display,
      phone: normalizedPhone
    };
  } catch (err) {
    // Return friendly error with fallback information
    console.error('[sendWhatsAppOtp Failed]:', err.message);
    return {
      success: false,
      message: `Failed to deliver WhatsApp message: ${err.message}`,
      fallbackOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  }
};

/**
 * Verify WhatsApp OTP
 */
export const verifyWhatsAppOtp = ({ phone, otp }) => {
  const { valid, phone: normalizedPhone } = normalizePhone(phone);
  if (!valid) {
    return { success: false, message: 'Invalid phone number.' };
  }

  const record = otpStore.get(normalizedPhone);
  if (!record) {
    return { success: false, message: 'No OTP requested for this number or OTP has expired. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedPhone);
    return { success: false, message: 'OTP has expired. Please request a new OTP.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalizedPhone);
    return { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otp.trim() !== otp.toString().trim()) {
    record.attempts += 1;
    return { success: false, message: 'Incorrect OTP. Please enter the valid 6-digit code received on WhatsApp.' };
  }

  // OTP verified successfully -> cleanup
  otpStore.delete(normalizedPhone);
  return {
    success: true,
    data: record,
    phone: normalizedPhone
  };
};
