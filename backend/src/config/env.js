const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const optional = {
  PORT: 5000,
  NODE_ENV: 'development',
  JWT_EXPIRES_IN: '7d',
  SMTP_HOST: '',
  SMTP_PORT: 587,
  SMTP_USER: '',
  SMTP_PASS: '',
  MAIL_FROM: 'noreply@transitops.com',
  FRONTEND_URL: 'http://localhost:3000',
};

// Validate required vars
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

// Build config object
const env = {};

for (const key of required) {
  env[key] = process.env[key];
}

for (const [key, fallback] of Object.entries(optional)) {
  env[key] = process.env[key] || fallback;
}

// Coerce types
env.PORT = parseInt(env.PORT, 10);
env.SMTP_PORT = parseInt(env.SMTP_PORT, 10);

module.exports = env;
