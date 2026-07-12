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
            ? `License Expired — ${alert.first_name} ${alert.last_name}`
            : `License Expiring Soon — ${alert.first_name} ${alert.last_name}`;

        const html = `
          <h2>License ${alert.license_status}</h2>
          <p>Dear ${alert.first_name} ${alert.last_name},</p>
          <p>Your driver's license <strong>${alert.license_number}</strong>
             ${alert.license_status === 'Expired' ? 'has expired' : 'is expiring soon'}
             on <strong>${alert.license_expiry}</strong>.</p>
          <p>Please renew your license to continue driving assignments.</p>
          <br>
          <p>— TransitOps Fleet Management</p>
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
