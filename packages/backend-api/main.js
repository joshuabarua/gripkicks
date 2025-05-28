const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const betterAuthMiddleware = require('./middleware/better-auth');

const authRoutes = require('./routes/auth');
const shoeRoutes = require('./routes/shoes');
const userRoutes = require('./routes/users');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use(betterAuthMiddleware);
app.use('/shoes', shoeRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});