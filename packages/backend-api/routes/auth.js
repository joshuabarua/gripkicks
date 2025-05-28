const express = require('express');
const router = express.Router();
const { login, googleLogin, session } = require('../controllers/authController');

// Public auth routes
router.post('/login', login);
router.post('/login/google', googleLogin);
router.get('/session', session);

module.exports = router;
