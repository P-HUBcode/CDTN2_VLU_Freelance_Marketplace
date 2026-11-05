const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/', authenticateToken, jobController.createJob);

module.exports = router;
