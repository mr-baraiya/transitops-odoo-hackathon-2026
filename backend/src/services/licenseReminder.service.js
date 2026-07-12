const DriversModel = require('../models/drivers.model');
const { sendMail } = require('../config/mailer');
const logger = require('../utils/logger');

const LicenseReminderService = {
  /**
   * Get drivers with expired/expiring licenses
   */
  getAlerts: () => DriversModel.licenseAlerts(),

  /**
   * Send reminder emails to drivers with expiring/expired licenses
   * @returns {Promise<{ sent: number, errors: number }>}
   */
  sendReminders: async () => {
    const result = await DriversModel.licenseAlerts();
    const alerts = result.rows;

    let sent = 0;
    let errors = 0;

    for (const alert of alerts) {
      try {
        const subject =
          alert.license_status === 'Expired'
            ? `TransitOps Compliance Alert: Driver License EXPIRED — ${alert.first_name} ${alert.last_name}`
            : `TransitOps Compliance Alert: Driver License EXPIRING SOON — ${alert.first_name} ${alert.last_name}`;

        const isExpired = alert.license_status === 'Expired';
        const accentColor = isExpired ? '#ef4444' : '#f59e0b';
        const badgeBg = isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)';
        const dateStr = new Date(alert.license_expiry).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
              .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
              .header-bar { height: 6px; background-color: ${accentColor}; }
              .content { padding: 32px; }
              .logo { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.025em; }
              h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.025em; }
              p { font-size: 0.95rem; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }
              .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
              .detail-table td { padding: 12px 16px; font-size: 0.9rem; border-bottom: 1px solid #e2e8f0; }
              .detail-table tr:last-child td { border-bottom: none; }
              .label { color: #64748b; font-weight: 500; width: 35%; }
              .value { color: #0f172a; font-weight: 600; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background-color: ${badgeBg}; color: ${accentColor}; }
              .action-area { text-align: center; margin: 28px 0; }
              .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 12px 24px; font-size: 0.9rem; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .footer { padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; line-height: 1.5; }
              .footer a { color: #64748b; text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header-bar"></div>
              <div class="content">
                <div class="logo">TransitOps</div>
                <h1>Action Required: Driver License ${alert.license_status}</h1>
                <p>Hello ${alert.first_name},</p>
                <p>This is an automated compliance notification regarding your driver's license. To comply with commercial fleet regulations, please review the status of your credentials below:</p>
                
                <table class="detail-table">
                  <tr>
                    <td class="label">Driver Name</td>
                    <td class="value">${alert.first_name} ${alert.last_name}</td>
                  </tr>
                  <tr>
                    <td class="label">License Number</td>
                    <td class="value">${alert.license_number}</td>
                  </tr>
                  <tr>
                    <td class="label">Expiration Date</td>
                    <td class="value">${dateStr}</td>
                  </tr>
                  <tr>
                    <td class="label">Current Status</td>
                    <td class="value"><span class="badge">${alert.license_status}</span></td>
                  </tr>
                </table>

                <p>Please upload a copy of your renewed permit to the driver dashboard immediately. Failure to submit updated credentials will result in automatic dispatch suspension.</p>
                
                <div class="action-area">
                  <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/compliance" class="btn">Update License Credentials</a>
                </div>
              </div>
              <div class="footer">
                This is a mandatory system notification regarding your fleet compliance status. Please do not reply directly to this email. For help, contact the safety office at <a href="mailto:safety@transitops.com">safety@transitops.com</a>.
              </div>
            </div>
          </body>
          </html>
        `;

        // We need the driver's email — query it
        const { query } = require('../config/db');
        const userResult = await query(
          `SELECT u.email FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.id = $1`,
          [alert.driver_id]
        );

        if (userResult.rows.length > 0) {
          await sendMail(userResult.rows[0].email, subject, html);
          sent++;
          logger.info(`License reminder sent to ${userResult.rows[0].email}`);
        }
      } catch (err) {
        errors++;
        logger.error(`Failed to send license reminder: ${err.message}`);
      }
    }

    return { sent, errors, total: alerts.length };
  },
};

module.exports = LicenseReminderService;
