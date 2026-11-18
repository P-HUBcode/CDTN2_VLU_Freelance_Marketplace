const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { postLimiter } = require('../middlewares/rateLimiter');

// POST /api/reviews - Gửi đánh giá đối tác (Yêu cầu JWT)
router.post('/', authenticateToken, postLimiter, reviewController.createReview);

// GET /api/reviews/user/:userId - Lấy danh sách đánh giá và điểm uy tín trung bình của User
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
