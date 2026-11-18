-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.4: DASHBOARD THỐNG KÊ (DASHBOARD ANALYTICS)
-- Date: 2026-11-13
-- Description:
-- 1. Index tối ưu hóa truy vấn thống kê, phễu tuyển dụng & timeline
-- 2. RPC get_student_dashboard_stats(): Thống kê sinh viên (đơn nộp, phân bổ trạng thái, thông báo chưa đọc)
-- 3. RPC get_employer_dashboard_stats(p_days): Thống kê tuyển dụng (Job, ứng viên, phễu chuyển đổi, timeline 7/30/90 ngày)
-- 4. RPC get_admin_dashboard_stats(): Thống kê quản trị (chỉ Admin, kiểm tra bằng is_admin())
-- ==============================================================================

-- ==============================================================================
-- 1. TẠO INDEXES TỐI ƯU HÓA TRUY VẤN THỐNG KÊ
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at 
ON public.job_applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_applied 
ON public.job_applications(job_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_status 
ON public.jobs(employer_id, status);

CREATE INDEX IF NOT EXISTS idx_status_history_app_new_status 
ON public.application_status_history(application_id, new_status);


-- ==============================================================================
-- 2. RPC: get_student_dashboard_stats()
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_student_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
    total_apps INT := 0;
    unread_notifs INT := 0;
    st_dist JSONB;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu đăng nhập để xem thống kê sinh viên.';
    END IF;

    -- Tổng đơn sinh viên đã nộp
    SELECT COUNT(*) INTO total_apps
    FROM public.job_applications
    WHERE student_id = uid;

    -- Phân bổ 5 trạng thái
    SELECT jsonb_build_object(
        'applied', COUNT(*) FILTER (WHERE status = 'applied'),
        'reviewing', COUNT(*) FILTER (WHERE status = 'reviewing'),
        'interview', COUNT(*) FILTER (WHERE status = 'interview'),
        'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    ) INTO st_dist
    FROM public.job_applications
    WHERE student_id = uid;

    -- Số thông báo chưa đọc
    SELECT COUNT(*) INTO unread_notifs
    FROM public.notifications
    WHERE user_id = uid AND is_read = false;

    RETURN jsonb_build_object(
        'total_applications', total_apps,
        'status_distribution', COALESCE(st_dist, '{}'::jsonb),
        'unread_notifications', unread_notifs
    );
END;
$$;


-- ==============================================================================
-- 3. RPC: get_employer_dashboard_stats(p_days INT DEFAULT 7)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_employer_dashboard_stats(p_days INT DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
    tot_jobs INT := 0;
    act_jobs INT := 0;
    tot_applicants INT := 0;
    new_applicants_7d INT := 0;
    st_dist JSONB;
    funnel_data JSONB;
    timeline_data JSONB;
    
    -- Các mốc phễu chuyển đổi
    cnt_applied INT := 0;
    cnt_reviewing INT := 0;
    cnt_interview INT := 0;
    cnt_accepted INT := 0;
    cnt_rejected INT := 0;
    
    rate_app_rev NUMERIC := 0.0;
    rate_rev_int NUMERIC := 0.0;
    rate_int_acc NUMERIC := 0.0;
    rate_overall NUMERIC := 0.0;
    days_limit INT := 7;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu đăng nhập để xem thống kê nhà tuyển dụng.';
    END IF;

    -- Chuẩn hóa số ngày (mặc định 7, cho phép 7, 30, 90)
    days_limit := CASE WHEN p_days IN (7, 30, 90) THEN p_days ELSE 7 END;

    -- 1. Tổng tin tuyển dụng và tin đang mở (published)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'published')
    INTO tot_jobs, act_jobs
    FROM public.jobs
    WHERE employer_id = uid;

    -- 2. Tổng ứng viên và Ứng viên mới trong 7 ngày
    SELECT 
        COUNT(ja.id),
        COUNT(ja.id) FILTER (WHERE ja.applied_at >= (NOW() - INTERVAL '7 days'))
    INTO tot_applicants, new_applicants_7d
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    -- 3. Phân bổ theo trạng thái hiện tại
    SELECT jsonb_build_object(
        'applied', COUNT(*) FILTER (WHERE ja.status = 'applied'),
        'reviewing', COUNT(*) FILTER (WHERE ja.status = 'reviewing'),
        'interview', COUNT(*) FILTER (WHERE ja.status = 'interview'),
        'accepted', COUNT(*) FILTER (WHERE ja.status = 'accepted'),
        'rejected', COUNT(*) FILTER (WHERE ja.status = 'rejected')
    ) INTO st_dist
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    -- 4. Phễu chuyển đổi (Dựa trên application_status_history)
    -- Đếm số đơn TỪNG ĐẠT mỗi giai đoạn (Applied -> Reviewing -> Interview -> Accepted)
    -- Giai đoạn 1: Đã nộp (applied)
    SELECT COUNT(DISTINCT ja.id) INTO cnt_applied
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    -- Giai đoạn 2: Từng đạt Đang xem xét (reviewing)
    SELECT COUNT(DISTINCT ja.id) INTO cnt_reviewing
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status IN ('reviewing', 'interview', 'accepted')
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'reviewing'
          )
      );

    -- Giai đoạn 3: Từng đạt Hẹn phỏng vấn (interview)
    SELECT COUNT(DISTINCT ja.id) INTO cnt_interview
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status IN ('interview', 'accepted')
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'interview'
          )
      );

    -- Giai đoạn 4: Đã nhận việc (accepted)
    SELECT COUNT(DISTINCT ja.id) INTO cnt_accepted
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status = 'accepted'
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'accepted'
          )
      );

    -- Đơn Rejected (hiển thị riêng, không nằm trong phễu thuận)
    SELECT COUNT(DISTINCT ja.id) INTO cnt_rejected
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND ja.status = 'rejected';

    -- Tính tỷ lệ chuyển đổi (%)
    IF cnt_applied > 0 THEN
        rate_app_rev := ROUND((cnt_reviewing::numeric / cnt_applied::numeric) * 100, 1);
        rate_overall := ROUND((cnt_accepted::numeric / cnt_applied::numeric) * 100, 1);
    END IF;

    IF cnt_reviewing > 0 THEN
        rate_rev_int := ROUND((cnt_interview::numeric / cnt_reviewing::numeric) * 100, 1);
    END IF;

    IF cnt_interview > 0 THEN
        rate_int_acc := ROUND((cnt_accepted::numeric / cnt_interview::numeric) * 100, 1);
    END IF;

    funnel_data := jsonb_build_object(
        'applied', cnt_applied,
        'reviewing', cnt_reviewing,
        'interview', cnt_interview,
        'accepted', cnt_accepted,
        'rejected', cnt_rejected,
        'rates', jsonb_build_object(
            'applied_to_reviewing', rate_app_rev,
            'reviewing_to_interview', rate_rev_int,
            'interview_to_accepted', rate_int_acc,
            'overall', rate_overall
        )
    );

    -- 5. Biểu đồ số đơn theo ngày (Timeline)
    SELECT jsonb_agg(
        jsonb_build_object(
            'date', to_char(d.day, 'YYYY-MM-DD'),
            'label', to_char(d.day, 'DD/MM'),
            'count', COALESCE(cnt.c, 0)
        ) ORDER BY d.day ASC
    ) INTO timeline_data
    FROM (
        SELECT generate_series(
            CURRENT_DATE - (days_limit - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::date AS day
    ) d
    LEFT JOIN (
        SELECT 
            ja.applied_at::date AS app_date,
            COUNT(*) AS c
        FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE j.employer_id = uid
        GROUP BY ja.applied_at::date
    ) cnt ON cnt.app_date = d.day;

    RETURN jsonb_build_object(
        'total_jobs', tot_jobs,
        'active_jobs', act_jobs,
        'total_applicants', tot_applicants,
        'new_applicants_7d', new_applicants_7d,
        'status_distribution', COALESCE(st_dist, '{}'::jsonb),
        'funnel', funnel_data,
        'timeline', COALESCE(timeline_data, '[]'::jsonb)
    );
END;
$$;


-- ==============================================================================
-- 4. RPC: get_admin_dashboard_stats() (CHỈ ADMIN)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Chỉ Quản trị viên (Admin) mới có quyền truy cập thống kê hệ thống.';
    END IF;

    RETURN jsonb_build_object(
        'total_students', (SELECT COUNT(*) FROM public.profiles WHERE role = 'student'),
        'total_employers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'employer'),
        'total_jobs', (SELECT COUNT(*) FROM public.jobs),
        'total_applications', (SELECT COUNT(*) FROM public.job_applications)
    );
END;
$$;


-- ==============================================================================
-- 5. PHÂN QUYỀN THỰC THI (GRANTS)
-- ==============================================================================
GRANT EXECUTE ON FUNCTION public.get_student_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employer_dashboard_stats(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;
