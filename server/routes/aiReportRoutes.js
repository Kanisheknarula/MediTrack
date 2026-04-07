const express = require('express');
const router = express.Router();
const { getAiReport } = require('../controllers/aiReportController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAiReport);

module.exports = router;
