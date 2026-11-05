const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/stats', authenticateToken, adminController.getStats);
router.get('/jobs/pending', authenticateToken, adminController.getPendingJobs);
router.put('/jobs/:id/moderate', authenticateToken, adminController.moderateJob);

module.exports = router;
