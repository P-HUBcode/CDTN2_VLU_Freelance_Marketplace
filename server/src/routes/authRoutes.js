const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.get('/user-passwords', authController.getUserPasswords);
router.post('/update-password', authController.updateUserPassword);

module.exports = router;
