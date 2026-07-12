const nodemailer = require('nodemailer');
const env = require('./env');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 * @returns {Promise}
 */
const sendMail = async (to, subject, html) => {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn('SMTP not configured — skipping email send');
    return null;
  }

  return transporter.sendMail({
    from: `"TransitOps Support" <${env.MAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

module.exports = { transporter, sendMail };
