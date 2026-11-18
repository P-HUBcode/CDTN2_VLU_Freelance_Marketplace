const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { postLimiter } = require('../middlewares/rateLimiter');

// POST /api/upload - Tải lên file CV (PDF) hoặc Avatar (Ảnh) lên Cloudinary Storage
router.post('/', authenticateToken, postLimiter, upload.single('file'), uploadFile);

module.exports = router;
