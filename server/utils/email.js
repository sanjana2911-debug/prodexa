/**
 * Email service for password reset and notifications
 * Uses Nodemailer with configurable SMTP transport
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');
const cfg = require('../config/env');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  // In development/test, use ethereal.email for testing
  if (process.env.NODE_ENV !== 'production') {
    // Create test account dynamically
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        logger.warn('Could not create test email account:', err.message);
        return;
      }
      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      logger.info('Test email transporter created');
    });
    return null; // Will be ready async
  }

  // Production SMTP
  if (cfg.smtp.host && cfg.smtp.user) {
    transporter = nodemailer.createTransport({
      host: cfg.smtp.host,
      port: cfg.smtp.port,
      secure: cfg.smtp.port === 465,
      auth: {
        user: cfg.smtp.user,
        pass: cfg.smtp.pass,
      },
    });
  }

  return transporter;
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetURL = `${cfg.frontendURL}/reset-password?token=${resetToken}`;

  try {
    const t = getTransporter();
    if (!t) {
      logger.info(`[DEV] Password reset link for ${email}: ${resetURL}`);
      return true;
    }

    const info = await t.sendMail({
      from: `"Prodexa" <noreply@prodexa.app>`,
      to: email,
      subject: 'Prodexa - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Prodexa</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetURL}" 
                 style="background: #6366f1; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Or copy this link: <a href="${resetURL}">${resetURL}</a>
            </p>
          </div>
        </div>
      `,
    });

    if (process.env.NODE_ENV === 'development') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    logger.error('Failed to send password reset email:', error.message);
    return false;
  }
};

module.exports = { sendPasswordResetEmail, getTransporter };