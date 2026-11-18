import React, { useState } from 'react';
import Modal from './Modal';
import { Star, Check, AlertCircle, Sparkles } from 'lucide-react';
import { createReview } from '../../lib/reviewService';
import { useAuth } from '../../contexts/AuthContext';

export default function ReviewModal({
  isOpen,
  onClose,
  jobId,
  jobTitle = '',
  revieweeId,
  revieweeName = '',
  revieweeRole = 'student', // 'student' hoặc 'employer'
  onSuccess
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableTags = revieweeRole === 'student'
    ? ['Đúng giờ', 'Trách nhiệm cao', 'Sáng tạo', 'Giao tiếp tốt', 'Kỹ năng vững', 'Tích cực']
    : ['Thanh toán đúng hẹn', 'Môi trường thân thiện', 'Hỗ trợ mộc thực tập', 'Hướng dẫn tận tình', 'Lịch làm linh hoạt'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setError('Vui lòng chọn số sao đánh giá (1 - 5 sao).');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng viết đôi lời nhận xét về đối tác.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createReview({
        jobId,
        jobTitle,
        revieweeId,
        revieweeName,
        ratingScore: rating,
        comment,
        tags: selectedTags
      }, user);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
      setError(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đánh giá & Chấm điểm uy tín"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center py-2">
          <p className="text-xs text-slate-500 mb-1">Bạn đang đánh giá cho:</p>
          <h4 className="text-base font-bold text-slate-800">{revieweeName || 'Đối tác'}</h4>
          {jobTitle && <p className="text-xs text-blue-600 font-medium truncate mt-0.5">Dự án: {jobTitle}</p>}

          {/* Interactive 5-Star Picker */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-amber-600 mt-2">
            {rating === 5 && 'Tuyệt vời (5/5) ★★★★★'}
            {rating === 4 && 'Rất tốt (4/5) ★★★★☆'}
            {rating === 3 && 'Hài lòng (3/5) ★★★☆☆'}
            {rating === 2 && 'Cần cải thiện (2/5) ★★☆☆☆'}
            {rating === 1 && 'Kém (1/5) ★☆☆☆☆'}
          </p>
        </div>

        {/* Tags gợi ý */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Điểm nổi bật:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition flex items-center gap-1 ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nhận xét văn bản */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nhận xét chi tiết: <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm làm việc thực tế, thái độ và sự chuyên nghiệp..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
