const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/hire', projectController.hireService);
router.post('/', projectController.hireService); // Alias
router.put('/:id', projectController.updateProject);

module.exports = router;
