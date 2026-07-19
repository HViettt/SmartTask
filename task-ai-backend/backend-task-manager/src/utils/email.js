/**
 * Email Utility Module - Centralized Nodemailer Transport
 * Provides robust email sending with connection pooling, timeouts, and error handling.
 * Supports Gmail (default) or custom SMTP via environment variables.
 */
const nodemailer = require('nodemailer');

// HTTP provider senders (Resend, SendGrid) using native fetch in Node >=18
const sendViaResend = async (to, subject, htmlContent) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, messageId: null, error: 'RESEND_API_KEY not set' };
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html: htmlContent }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return { success: false, messageId: null, error: data?.message || `HTTP ${resp.status}` };
    }
    return { success: true, messageId: data?.id || null, error: null };
  } catch (err) {
    return { success: false, messageId: null, error: err?.message || String(err) };
  }
};

const sendViaSendGrid = async (to, subject, htmlContent) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return { success: false, messageId: null, error: 'SENDGRID_API_KEY not set' };
  const fromEmail = (process.env.EMAIL_FROM || process.env.EMAIL_USER || '').replace(/^.*<|>$/g, '') || process.env.EMAIL_USER;
  try {
    const payload = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail },
      subject,
      content: [{ type: 'text/html', value: htmlContent }],
    };
    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (resp.status === 202) {
      return { success: true, messageId: null, error: null };
    }
    const body = await resp.text();
    return { success: false, messageId: null, error: `HTTP ${resp.status}: ${body}` };
  } catch (err) {
    return { success: false, messageId: null, error: err?.message || String(err) };
  }
};

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
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 20_000), // ms
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 20_000), // ms
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 10_000), // ms
    requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true' || false,
    ignoreTLS: process.env.EMAIL_IGNORE_TLS === 'true' || false,
    logger: process.env.EMAIL_DEBUG === 'true',
    debug: process.env.EMAIL_DEBUG === 'true',
    tls: {
      // Keep defaults; allow overriding if needed via env later
      // ciphers: 'TLSv1.2',
      // Allow overriding strictness if needed (NOT recommended in production)
      rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true,
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
  const httpProvider = (process.env.EMAIL_PROVIDER || process.env.EMAIL_HTTP_PROVIDER || '').toLowerCase();

  // Prefer HTTP providers when configured (bypasses SMTP port blocks)
  if (httpProvider === 'resend') {
    return await sendViaResend(to, subject, htmlContent);
  }
  if (httpProvider === 'sendgrid') {
    return await sendViaSendGrid(to, subject, htmlContent);
  }

  if (!hasCreds) {
    const msg = 'EMAIL disabled: EMAIL_USER/PASS not set';
    if (isProd) {
      return { success: false, messageId: null, error: msg };
    }
    console.warn(msg, '- simulating in development');
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
    console.error('Email send error:', error?.message || error);
    return { success: false, messageId: null, error: error?.message || String(error) };
  }
};

module.exports = { sendEmail };
