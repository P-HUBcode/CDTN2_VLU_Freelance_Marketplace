const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/messages', chatController.getConversations);
router.post('/messages', chatController.sendMessage);
router.post('/clear', chatController.clearMock);

module.exports = router;
