const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Production-ready CORS configuration supporting Vercel deployments
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, postman) or matching allowed origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Rate limiter for public submission endpoints (20 req / 15 min per IP)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Middleware to ensure DB is connected on Vercel Serverless Functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database Connection Error in Middleware:', err);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Root API status endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Rider Tours API is running' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Rider Tours API is running' });
});

// Register routes
app.use('/api/tariffs', require('./routes/tariffs'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', submissionLimiter, require('./routes/bookings'));
app.use('/api/enquiries', submissionLimiter, require('./routes/enquiries'));
app.use('/api/analytics', require('./routes/analytics'));

// Start standalone server when run directly (node server.js / nodemon)
if (require.main === module || process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// Export Express app for Vercel Serverless Function deployment
module.exports = app;
