import { supabase, isSupabaseConfigured } from './supabase';

// ==============================================================================
// STUDENTHUB - REVIEW SERVICE (SPRINT 4: ĐÁNH GIÁ 2 CHIỀU)
// ==============================================================================

const LOCAL_STORAGE_REVIEWS_KEY = 'studenthub_reviews_store';

// Dữ liệu mẫu khởi tạo ban đầu cho chế độ local
const INITIAL_MOCK_REVIEWS = [
  {
    id: 'rev-001',
    job_id: 'job-001',
    job_title: 'Social Media Content Creator',
    reviewer_id: 'b0000000-0000-0000-0000-000000000002',
    reviewer_name: 'ABC Media Studio (HR Mai)',
    reviewer_role: 'employer',
    reviewer_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    reviewee_id: 'a0000000-0000-0000-0000-000000000001',
    rating_score: 5,
    comment: 'Minh Anh làm việc rất có trách nhiệm, thiết kế ấn phẩm Canva bắt mắt, đúng hạn và chủ động đưa ý tưởng video!',
    tags: ['Đúng giờ', 'Sáng tạo cao', 'Giao tiếp tốt'],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'rev-002',
    job_id: 'job-001',
    job_title: 'Social Media Content Creator',
    reviewer_id: 'a0000000-0000-0000-0000-000000000001',
    reviewer_name: 'Nguyễn Minh Anh',
    reviewer_role: 'student',
    reviewer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    reviewee_id: 'b0000000-0000-0000-0000-000000000002',
    rating_score: 5,
    comment: 'Doanh nghiệp hỗ trợ sinh viên rất tận tình, thanh toán thù lao chuẩn xác và tạo điều kiện làm việc linh hoạt.',
    tags: ['Thanh toán đúng hẹn', 'Môi trường thân thiện', 'Hỗ trợ mộc thực tập'],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(INITIAL_MOCK_REVIEWS));
      return INITIAL_MOCK_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_REVIEWS;
  }
}

function saveStoredReviews(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Lưu reviews vào localStorage thất bại:', err);
  }
}

// ------------------------------------------------------------------------------
// 1. TẠO ĐÁNH GIÁ MỚI
// ------------------------------------------------------------------------------
export async function createReview(
  {
    jobId,
    jobTitle = '',
    revieweeId,
    revieweeName = '',
    ratingScore,
    comment = '',
    tags = []
  },
  currentUser
) {
  if (!currentUser || !currentUser.id) {
    throw new Error('Vui lòng đăng nhập để gửi đánh giá.');
  }

  const score = parseInt(ratingScore, 10);
  if (isNaN(score) || score < 1 || score > 5) {
    throw new Error('Điểm đánh giá phải là số sao từ 1 đến 5.');
  }

  if (currentUser.id === revieweeId) {
    throw new Error('Bạn không thể tự đánh giá chính mình.');
  }

  if (isSupabaseConfigured && !currentUser.id.startsWith('demo_') && !currentUser.id.startsWith('mock_')) {
    // 1. Kiểm tra xem đã từng đánh giá công việc này chưa
    const { data: existing, error: checkErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('job_id', jobId)
      .eq('reviewer_id', currentUser.id)
      .eq('reviewee_id', revieweeId)
      .maybeSingle();

    if (checkErr) {
      console.warn('Lỗi kiểm tra review cũ:', checkErr);
    }
    if (existing) {
      throw new Error('Bạn đã gửi đánh giá cho đối tác trong công việc này rồi.');
    }

    // 2. Insert vào Supabase
    const { data: newReview, error: insertErr } = await supabase
      .from('reviews')
      .insert({
        job_id: jobId,
        reviewer_id: currentUser.id,
        reviewee_id: revieweeId,
        rating_score: score,
        comment: comment.trim(),
        tags: tags || []
      })
      .select('*, reviewer:profiles!reviewer_id(full_name, avatar_url, role)')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505') {
        throw new Error('Bạn đã đánh giá đối tác này rồi.');
      }
      throw new Error(`Gửi đánh giá thất bại: ${insertErr.message}`);
    }

    return {
      id: newReview.id,
      jobId: newReview.job_id,
      reviewerId: newReview.reviewer_id,
      reviewerName: newReview.reviewer?.full_name || currentUser.full_name || 'Người dùng',
      reviewerAvatar: newReview.reviewer?.avatar_url || currentUser.avatar_url || '',
      ratingScore: newReview.rating_score,
      comment: newReview.comment,
      tags: newReview.tags,
      createdAt: newReview.created_at
    };
  }

  // Chế độ Local Fallback
  const list = getStoredReviews();
  const already = list.find(
    r => String(r.job_id) === String(jobId) &&
         String(r.reviewer_id) === String(currentUser.id) &&
         String(r.reviewee_id) === String(revieweeId)
  );

  if (already) {
    throw new Error('Bạn đã gửi đánh giá cho công việc này rồi (Local).');
  }

  const mockItem = {
    id: `rev-${Date.now()}`,
    job_id: jobId,
    job_title: jobTitle,
    reviewer_id: currentUser.id,
    reviewer_name: currentUser.full_name || currentUser.email?.split('@')[0] || 'Người dùng',
    reviewer_role: currentUser.user_metadata?.role || (currentUser.role && currentUser.role !== 'authenticated' ? currentUser.role : null) || 'student',
    reviewer_avatar: currentUser.avatar_url || '',
    reviewee_id: revieweeId,
    reviewee_name: revieweeName,
    rating_score: score,
    comment: comment.trim(),
    tags: tags || [],
    created_at: new Date().toISOString()
  };

  list.unshift(mockItem);
  saveStoredReviews(list);
  return mockItem;
}

// ------------------------------------------------------------------------------
// 2. LẤY TẤT CẢ ĐÁNH GIÁ CỦA MỘT NGƯỜI DÙNG (REVIEWEE)
// ------------------------------------------------------------------------------
export async function getReviewsForUser(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          job_id,
          rating_score,
          comment,
          tags,
          created_at,
          job:jobs(title),
          reviewer:profiles!reviewer_id(id, full_name, avatar_url, role)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Lỗi Supabase getReviewsForUser:', error);
        return [];
      }

      return (data || []).map(r => ({
        id: r.id,
        jobId: r.job_id,
        jobTitle: r.job?.title || 'Công việc',
        reviewerId: r.reviewer?.id,
        reviewerName: r.reviewer?.full_name || 'Người đánh giá',
        reviewerRole: r.reviewer?.role || 'user',
        reviewerAvatar: r.reviewer?.avatar_url || '',
        ratingScore: r.rating_score,
        comment: r.comment,
        tags: r.tags || [],
        createdAt: r.created_at
      }));
    } catch (err) {
      console.error('Exception getReviewsForUser:', err);
    }
  }

  // Fallback từ Local Storage
  const list = getStoredReviews();
  return list.filter(r => String(r.reviewee_id) === String(userId));
}

// ------------------------------------------------------------------------------
// 3. TÍNH TỔNG KẾT SAO TRUNG BÌNH & SỐ LƯỢT ĐÁNH GIÁ
// ------------------------------------------------------------------------------
export async function getUserRatingSummary(userId) {
  if (!userId) {
    return { totalReviews: 0, ratingAvg: 0.0, starsDistribution: {} };
  }

  if (isSupabaseConfigured && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase.rpc('get_user_rating_summary', { p_user_id: userId });
      if (!error && data) {
        return {
          totalReviews: data.total_reviews || 0,
          ratingAvg: Number(data.rating_avg) || 0.0,
          starsDistribution: data.stars_distribution || {}
        };
      }
    } catch (err) {
      console.warn('Lỗi gọi RPC get_user_rating_summary, chuyển sang tính client-side:', err);
    }
  }

  // Tính client-side từ danh sách đánh giá
  const reviews = await getReviewsForUser(userId);
  if (!reviews || reviews.length === 0) {
    return { totalReviews: 0, ratingAvg: 0.0, starsDistribution: {} };
  }

  const total = reviews.length;
  const sum = reviews.reduce((acc, curr) => acc + (Number(curr.ratingScore) || 0), 0);
  const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0.0;

  const starsDistribution = {
    star_5: reviews.filter(r => r.ratingScore === 5).length,
    star_4: reviews.filter(r => r.ratingScore === 4).length,
    star_3: reviews.filter(r => r.ratingScore === 3).length,
    star_2: reviews.filter(r => r.ratingScore === 2).length,
    star_1: reviews.filter(r => r.ratingScore === 1).length
  };

  return {
    totalReviews: total,
    ratingAvg: avg,
    starsDistribution
  };
}

// ------------------------------------------------------------------------------
// 4. KIỂM TRA XEM USER ĐÃ ĐÁNH GIÁ CÔNG VIỆC CHƯA
// ------------------------------------------------------------------------------
export async function checkUserReviewed(jobId, reviewerId, revieweeId) {
  if (!jobId || !reviewerId || !revieweeId) return false;

  if (isSupabaseConfigured && !reviewerId.startsWith('demo_') && !reviewerId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('job_id', jobId)
        .eq('reviewer_id', reviewerId)
        .eq('reviewee_id', revieweeId)
        .maybeSingle();

      return Boolean(!error && data);
    } catch {
      return false;
    }
  }

  const list = getStoredReviews();
  return list.some(
    r => String(r.job_id) === String(jobId) &&
         String(r.reviewer_id) === String(reviewerId) &&
         String(r.reviewee_id) === String(revieweeId)
  );
}
