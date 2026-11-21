const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

// In-memory reviews (mặc định rỗng để kiểm thử từ đầu)
if (!memoryStore.reviews) {
  memoryStore.reviews = [];
}

// 1. Tạo đánh giá và cập nhật điểm uy tín trung bình
exports.createReview = async (req, res) => {
  try {
    const { job_id, reviewee_id, rating_score, comment } = req.body;
    const reviewer_id = req.user.id;

    if (!job_id || !reviewee_id || !rating_score) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã công việc (job_id), người nhận đánh giá (reviewee_id) và số sao (1-5).'
      });
    }

    const score = parseInt(rating_score);
    if (isNaN(score) || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Điểm đánh giá phải là số nguyên từ 1 đến 5 sao.'
      });
    }

    if (reviewer_id === parseInt(reviewee_id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự đánh giá chính mình.'
      });
    }

    if (isMySQLConnected()) {
      const pool = getPool();

      // Kiểm tra trùng lặp
      const [existing] = await pool.query(
        'SELECT id FROM reviews WHERE job_id = ? AND reviewer_id = ? AND reviewee_id = ?',
        [job_id, reviewer_id, reviewee_id]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Bạn đã đánh giá đối tác cho công việc này rồi.'
        });
      }

      // Lưu đánh giá mới
      await pool.query(
        'INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating_score, comment) VALUES (?, ?, ?, ?, ?)',
        [job_id, reviewer_id, reviewee_id, score, comment || '']
      );

      // Tính điểm uy tín trung bình (Business Logic)
      const [[stats]] = await pool.query(
        'SELECT COUNT(*) as total_reviews, ROUND(AVG(rating_score), 1) as rating_avg FROM reviews WHERE reviewee_id = ?',
        [reviewee_id]
      );

      // Cập nhật vào profile tương ứng
      await pool.query(
        'UPDATE student_profiles SET rating_avg = ?, total_reviews = ? WHERE user_id = ?',
        [stats.rating_avg, stats.total_reviews, reviewee_id]
      );
      await pool.query(
        'UPDATE employer_profiles SET rating_avg = ?, total_reviews = ? WHERE user_id = ?',
        [stats.rating_avg, stats.total_reviews, reviewee_id]
      );

      return res.status(201).json({
        success: true,
        message: '✔ Đánh giá thành công! Điểm uy tín của đối tác đã được cập nhật.',
        data: {
          job_id,
          reviewer_id,
          reviewee_id,
          rating_score: score,
          comment,
          updated_rating_avg: stats.rating_avg,
          total_reviews: stats.total_reviews
        }
      });
    } else {
      // Memory fallback
      const exists = memoryStore.reviews.find(
        r => r.job_id === parseInt(job_id) && r.reviewer_id === reviewer_id && r.reviewee_id === parseInt(reviewee_id)
      );
      if (exists) {
        return res.status(409).json({ success: false, message: 'Bạn đã đánh giá đối tác cho công việc này rồi.' });
      }

      const newReview = {
        id: Date.now(),
        job_id: parseInt(job_id),
        reviewer_id,
        reviewer_name: req.user.full_name || 'Người dùng VLU',
        reviewee_id: parseInt(reviewee_id),
        rating_score: score,
        comment: comment || '',
        created_at: new Date().toISOString()
      };

      memoryStore.reviews.push(newReview);

      // Tính điểm uy tín trung bình
      const userReviews = memoryStore.reviews.filter(r => r.reviewee_id === parseInt(reviewee_id));
      const total = userReviews.length;
      const sum = userReviews.reduce((acc, cur) => acc + cur.rating_score, 0);
      const avg = (sum / total).toFixed(1);

      return res.status(201).json({
        success: true,
        message: '✔ Đánh giá thành công! Điểm uy tín trung bình đã được tự động tính toán.',
        data: {
          ...newReview,
          updated_rating_avg: parseFloat(avg),
          total_reviews: total
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi đánh giá:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

// 2. Lấy danh sách đánh giá của một người dùng kèm điểm trung bình
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    if (isMySQLConnected()) {
      const pool = getPool();
      const [reviews] = await pool.query(
        `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
         FROM reviews r
         JOIN users u ON r.reviewer_id = u.id
         WHERE r.reviewee_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );

      const [[stats]] = await pool.query(
        'SELECT COUNT(*) as total_reviews, COALESCE(ROUND(AVG(rating_score), 1), 5.0) as rating_avg FROM reviews WHERE reviewee_id = ?',
        [userId]
      );

      return res.json({
        success: true,
        data: {
          rating_avg: parseFloat(stats.rating_avg),
          total_reviews: stats.total_reviews,
          reviews
        }
      });
    } else {
      const reviews = memoryStore.reviews.filter(r => r.reviewee_id === parseInt(userId));
      const total = reviews.length;
      const avg = total > 0 ? (reviews.reduce((acc, cur) => acc + cur.rating_score, 0) / total).toFixed(1) : 5.0;

      return res.json({
        success: true,
        data: {
          rating_avg: parseFloat(avg),
          total_reviews: total,
          reviews
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};
