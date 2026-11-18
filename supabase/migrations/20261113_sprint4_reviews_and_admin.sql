-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 4: ĐÁNH GIÁ 2 CHIỀU & PHÂN HỆ ADMIN
-- Date: 2026-11-13
-- Description:
-- 1. Bổ sung cột is_active cho bảng profiles (hỗ trợ Admin khóa/mở tài khoản)
-- 2. Cập nhật CHECK constraint cho cột status trên bảng jobs (hỗ trợ 'rejected')
-- 3. Tạo bảng reviews (Đánh giá uy tín 2 chiều giữa Sinh viên & Doanh nghiệp)
-- 4. RPC get_user_rating_summary(): Tính điểm sao trung bình và số lượng đánh giá
-- 5. Thiết lập RLS policies cho bảng reviews
-- ==============================================================================

-- ==============================================================================
-- 1. BỔ SUNG CỘT is_active CHO BẢNG profiles
-- ==============================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;


-- ==============================================================================
-- 2. CẬP NHẬT RÀNG BUỘC STATUS CHO BẢNG jobs (CHO PHÉP 'rejected')
-- ==============================================================================
DO $$
BEGIN
    -- Xóa constraint cũ nếu có
    ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
    
    -- Thêm constraint mới hỗ trợ đầy đủ các trạng thái của tin tuyển dụng
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
    CHECK (status IN ('published', 'active', 'closed', 'draft', 'expired', 'pending_approval', 'rejected'));
EXCEPTION
    WHEN others THEN NULL;
END $$;


-- ==============================================================================
-- 3. TẠO BẢNG reviews: ĐÁNH GIÁ UY TÍN 2 CHIỀU
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating_score INT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_job_reviewer_reviewee UNIQUE(job_id, reviewer_id, reviewee_id),
    CONSTRAINT chk_reviewer_not_reviewee CHECK (reviewer_id <> reviewee_id)
);

-- Index tối ưu hóa truy vấn đánh giá
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id, rating_score);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON public.reviews(job_id);


-- ==============================================================================
-- 4. RPC: TÍNH ĐIỂM SAO TRUNG BÌNH & SỐ LƯỢNG ĐÁNH GIÁ
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_rating_summary(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tot_reviews INT := 0;
    avg_score NUMERIC := 0.0;
    star_dist JSONB;
BEGIN
    SELECT 
        COUNT(*),
        COALESCE(ROUND(AVG(rating_score)::numeric, 1), 0.0)
    INTO tot_reviews, avg_score
    FROM public.reviews
    WHERE reviewee_id = p_user_id;

    SELECT jsonb_build_object(
        'star_5', COUNT(*) FILTER (WHERE rating_score = 5),
        'star_4', COUNT(*) FILTER (WHERE rating_score = 4),
        'star_3', COUNT(*) FILTER (WHERE rating_score = 3),
        'star_2', COUNT(*) FILTER (WHERE rating_score = 2),
        'star_1', COUNT(*) FILTER (WHERE rating_score = 1)
    ) INTO star_dist
    FROM public.reviews
    WHERE reviewee_id = p_user_id;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'total_reviews', tot_reviews,
        'rating_avg', avg_score,
        'stars_distribution', COALESCE(star_dist, '{}'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_rating_summary(UUID) TO authenticated, anon;


-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES CHO BẢNG reviews
-- ==============================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5.1. Quyền SELECT: Mọi người đều có thể đọc đánh giá để tham khảo uy tín đối tác
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

-- 5.2. Quyền INSERT: Chỉ người dùng đã đăng nhập, tự đánh giá cho chính mình
-- VÀ phải có quan hệ làm việc với đối tác (đơn ứng tuyển đạt trạng thái 'accepted')
DROP POLICY IF EXISTS "Users can insert reviews for completed jobs" ON public.reviews;
CREATE POLICY "Users can insert reviews for completed jobs"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id <> reviewee_id
    AND (
        -- Trường hợp 1: Sinh viên đánh giá Nhà tuyển dụng
        EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.job_id = reviews.job_id
              AND ja.student_id = auth.uid()
              AND j.employer_id = reviews.reviewee_id
              AND ja.status = 'accepted'
        )
        -- Trường hợp 2: Nhà tuyển dụng đánh giá Sinh viên
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.job_id = reviews.job_id
              AND j.employer_id = auth.uid()
              AND ja.student_id = reviews.reviewee_id
              AND ja.status = 'accepted'
        )
        -- Trường hợp 3: Admin
        OR public.is_admin()
    )
);

-- 5.3. Quyền UPDATE: Chỉ chính người viết đánh giá mới được cập nhật nhận xét của mình
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id OR public.is_admin());

-- 5.4. Quyền DELETE: Chỉ người viết hoặc Admin mới được xóa đánh giá
DROP POLICY IF EXISTS "Users or admins can delete reviews" ON public.reviews;
CREATE POLICY "Users or admins can delete reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = reviewer_id OR public.is_admin());


-- ==============================================================================
-- 6. CẬP NHẬT TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at TRÊN reviews
-- ==============================================================================
DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
