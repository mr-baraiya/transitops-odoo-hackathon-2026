const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const rootRoutes = require('./routes/root.routes');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./utils/apiResponse');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api/', limiter);
}

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root/Health check routes
app.use('/', rootRoutes);

// API Routes
app.use('/api', routes);

// 404 Route handler
app.use((req, res) => {
  return notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
