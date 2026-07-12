const cron = require('node-cron');
const LicenseReminderService = require('../services/licenseReminder.service');
const logger = require('../utils/logger');

const initLicenseExpiryCron = () => {
  // Run daily at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled license expiry check...');
    try {
      const result = await LicenseReminderService.sendReminders();
      logger.info(`Scheduled license check completed. Total alerts: ${result.total}, Reminders sent: ${result.sent}, Errors: ${result.errors}`);
    } catch (err) {
      logger.error(`Scheduled license check failed: ${err.message}`);
    }
  });

  logger.info('License expiry cron job scheduled (daily at midnight).');
};

module.exports = { initLicenseExpiryCron };
