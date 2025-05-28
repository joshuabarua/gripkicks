const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');

// Protected user routes
router.get('/', getAllUsers);

module.exports = router;
