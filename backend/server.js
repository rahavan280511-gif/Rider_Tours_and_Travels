const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
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

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Rider Tours API is running' });
});

app.use('/api/tariffs', require('./routes/tariffs'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', submissionLimiter, require('./routes/bookings'));
app.use('/api/enquiries', submissionLimiter, require('./routes/enquiries'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
