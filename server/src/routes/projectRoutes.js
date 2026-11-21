const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { optionalAuthenticateToken, authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', optionalAuthenticateToken, projectController.getProjects);
router.get('/:id', optionalAuthenticateToken, projectController.getProjectById);
router.post('/hire', optionalAuthenticateToken, projectController.hireService);
router.post('/', optionalAuthenticateToken, projectController.hireService); // Alias
router.put('/:id', optionalAuthenticateToken, projectController.updateProject);

module.exports = router;
