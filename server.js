const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('../routes/index');
const path = require('path');
const xssClean = require('xss-clean');
require('dotenv').config();

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for frontend
}));
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser + limit payload
app.use(xssClean()); // Prevent XSS

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after an hour'
});
app.use('/api', limiter);

// API Routes
app.use('/api', apiRoutes);

// In Vercel, public files are served automatically.
// For local dev with `node api/index.js`, we'll serve public folder manually:
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
}

const PORT = process.env.PORT || 3000;

// Export for serverless
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
