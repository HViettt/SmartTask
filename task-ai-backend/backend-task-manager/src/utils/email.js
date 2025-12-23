/**
 * Email Utility Module - Centralized Nodemailer Transport
 * Provides robust email sending with connection pooling, timeouts, and error handling.
 * Supports Gmail (default) or custom SMTP via environment variables.
 */
const nodemailer = require('nodemailer');

/** Cached transport instance for connection reuse and pooling */
let cachedTransporter = null;

/**
 * Build and configure the SMTP transporter.
 * Supports Gmail or custom SMTP via environment variables.
 * @returns {object} Nodemailer transporter instance
 */
const buildTransporter = () => {
  const hasExplicitHost = !!process.env.EMAIL_HOST;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || (hasExplicitHost ? 587 : 465));
  const secure = process.env.EMAIL_SECURE
    ? process.env.EMAIL_SECURE === 'true'
    : !hasExplicitHost; // default secure for Gmail when no explicit host

  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };

  const transportOptions = {
    host,
    port,
    secure,
    auth,
    pool: true,
    maxConnections: 3,
    connectionTimeout: 15_000, // ms
    socketTimeout: 15_000, // ms
    tls: {
      // Keep defaults; allow overriding if needed via env later
      // ciphers: 'TLSv1.2',
    },
  };

  // If explicit Gmail service preferred
  if (!hasExplicitHost) {
    transportOptions.service = 'gmail';
  }

  return nodemailer.createTransport(transportOptions);
};

/**
 * Get or initialize the cached transporter.
 * Reuses existing connection pool to reduce overhead.
 * @returns {object} Nodemailer transporter instance
 */
const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }
  return cachedTransporter;
};

/**
 * Send an email with HTML content.
 * Handles dev mode (EMAIL_USER/PASS not set) and production SMTP.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML format
 * @returns {Promise<object>} { success, messageId, error }
 */
const sendEmail = async (to, subject, htmlContent) => {
  const isProd = process.env.NODE_ENV === 'production';
  const hasCreds = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  if (!hasCreds) {
    const msg = 'EMAIL disabled: EMAIL_USER/PASS not set';
    if (isProd) {
      console.error('❌', msg, '- configure SMTP env vars on server');
      return { success: false, messageId: null, error: msg };
    }
    console.warn('⚠️', msg, '- simulating in development');
    return { success: true, messageId: 'dev-simulated-' + Date.now(), error: null };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `SmartTask AI <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId, error: null };
  } catch (error) {
    console.error('❌ Email send error:', error?.message || error);
    return { success: false, messageId: null, error: error?.message || String(error) };
  }
};

module.exports = { sendEmail };
