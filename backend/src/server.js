const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');
const { initLicenseExpiryCron } = require('./jobs/licenseExpiryCron');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // 1. Verify Database Connection
    const client = await pool.connect();
    logger.info('Database connection verified successfully.');
    client.release();

    // 2. Initialize Cron Jobs
    initLicenseExpiryCron();

    // 3. Start Listening
    app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
