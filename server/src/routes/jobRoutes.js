const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { optionalAuthenticateToken } = require('../middlewares/authMiddleware');

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/', optionalAuthenticateToken, jobController.createJob);

module.exports = router;
