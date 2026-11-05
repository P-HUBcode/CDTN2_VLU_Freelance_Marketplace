const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/', authenticateToken, applicationController.applyJob);
router.get('/my', authenticateToken, applicationController.getMyApplications);
router.get('/job/:jobId', authenticateToken, applicationController.getApplicantsForJob);
router.put('/:id/status', authenticateToken, applicationController.updateApplicationStatus);

module.exports = router;
