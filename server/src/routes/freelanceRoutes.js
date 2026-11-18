const express = require('express');
const router = express.Router();
const freelanceController = require('../controllers/freelanceController');

router.get('/', freelanceController.getServices);
router.post('/', freelanceController.createService);
router.delete('/:id', freelanceController.deleteService);

module.exports = router;
