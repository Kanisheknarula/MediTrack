const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Admin Routes - Strictly protected!
router.get('/dashboard', protect, authorize('Admin'), getDashboardStats);

module.exports = router;