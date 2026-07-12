const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

const logger = {
  info: (message) => {
    const line = formatMessage('INFO', message);
    console.log(line);
    logStream.write(line + '\n');
  },
  warn: (message) => {
    const line = formatMessage('WARN', message);
    console.warn(line);
    logStream.write(line + '\n');
  },
  error: (message) => {
    const line = formatMessage('ERROR', message);
    console.error(line);
    logStream.write(line + '\n');
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const line = formatMessage('DEBUG', message);
      console.debug(line);
      logStream.write(line + '\n');
    }
  },
};

module.exports = logger;
