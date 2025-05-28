const express = require('express');
const { recommendShoes, createShoe, updateShoe, deleteShoe } = require('../controllers/shoesController');
const router = express.Router();

// POST /shoes/recommend
router.post('/recommend', recommendShoes);

// Add more shoe-related routes here (CRUD)
module.exports = router;