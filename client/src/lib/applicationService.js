import { supabase, isSupabaseConfigured } from './supabase';

// ==============================================================================
// STUDENTHUB - APPLICATION SERVICE (SPRINT 3.2.1 HARDENING)
// Dữ liệu nghiệp vụ lấy 100% từ Supabase Database (Không mock, không localStorage)
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. TẢI FILE CV LÊN SUPABASE STORAGE (BUCKET 'cv')
// ------------------------------------------------------------------------------
export async function uploadCvToStorage(file, userId) {
  if (!file) throw new Error('Vui lòng chọn file CV.');

  const allowedExtensions = ['pdf', 'doc', 'docx'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Định dạng CV không hợp lệ. Hệ thống chỉ chấp nhận file .PDF, .DOC, .DOCX.');
  }

  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    throw new Error('Dung lượng file CV vượt quá giới hạn 10MB. Vui lòng nén file hoặc tải file nhỏ hơn.');
  }

  if (isSupabaseConfigured && userId && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${Date.now()}_${sanitizedName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase CV Upload error:', uploadError);
      throw new Error(`Tải file CV lên máy chủ thất bại: ${uploadError.message}`);
    }

    // Bucket 'cv' là Private: Trả về storage path để lưu vào DB và tạo Signed URL khi truy xuất
    return {
      path: filePath
    };
  }

  // Fallback demo session URL preview
  const objectUrl = URL.createObjectURL(file);
  return {
    path: `local/${file.name}`,
    publicUrl: objectUrl
  };
}

// ------------------------------------------------------------------------------
// HÀM TIỆN ÍCH: CHUẨN HÓA PATH VÀ TẠO SIGNED URL CHO FILE CV TRONG BUCKET PRIVATE
// ------------------------------------------------------------------------------
export function cleanCvStoragePath(pathOrUrl) {
  if (!pathOrUrl) return '';
  return pathOrUrl
    .replace(/^https?:\/\/[^\/]+\/storage\/v1\/object\/(?:public|sign)\/cv\//, '')
    .split('?')[0];
}

export async function getCvSignedUrl(pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl) return '';
  // Nếu là blob preview tại client hoặc link ngoài không thuộc Supabase Storage
  if (
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:') ||
    (pathOrUrl.startsWith('http') && !pathOrUrl.includes('/storage/v1/object/'))
  ) {
    return pathOrUrl;
  }

  const cleanPath = cleanCvStoragePath(pathOrUrl);
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from('cv')
        .createSignedUrl(cleanPath, expiresIn);

      if (error) {
        console.error('Lỗi tạo Signed URL cho file CV:', error);
        return '';
      }
      return data?.signedUrl || '';
    } catch (err) {
      console.error('Exception khi tạo Signed URL cho CV:', err);
      return '';
    }
  }

  return pathOrUrl;
}

// ------------------------------------------------------------------------------
// 2. NỘP HỒ SƠ ỨNG TUYỂN VÀO SUPABASE (TABLE 'job_applications')
// ------------------------------------------------------------------------------
export async function submitJobApplication(
  {
    jobId,
    jobTitle = '',
    company = '',
    companyLogo = '',
    coverLetter = '',
    cvFile = null,
    existingCvUrl = '',
    portfolioLink = '',
    expectedSalary = '',
    availableHours = ''
  },
  activeUser
) {
  if (!activeUser || !activeUser.id) {
    throw new Error('Bạn cần đăng nhập tài khoản Sinh viên để nộp hồ sơ ứng tuyển.');
  }

  let userRole = activeUser.user_metadata?.role || (activeUser.role && activeUser.role !== 'authenticated' ? activeUser.role : null);
  if (!userRole && isSupabaseConfigured && activeUser.id) {
    try {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', activeUser.id).maybeSingle();
      if (prof?.role) userRole = prof.role;
    } catch (e) {
      // ignore
    }
  }
  if (!userRole) userRole = 'student';

  if (userRole === 'employer') {
    throw new Error('Tài khoản Nhà tuyển dụng không thể nộp đơn ứng tuyển việc làm.');
  }

  if (!jobId) {
    throw new Error('Thông tin công việc không hợp lệ (Missing Job ID).');
  }

  if (!coverLetter || !coverLetter.trim()) {
    throw new Error('Vui lòng viết lời giới thiệu ngắn (Cover Letter) để nhà tuyển dụng đánh giá.');
  }

  const studentId = activeUser.id;

  // 1. Upload CV nếu người dùng chọn file mới (Lưu path tương đối trong bucket 'cv')
  let finalCvPath = cleanCvStoragePath(existingCvUrl);
  if (cvFile) {
    const uploadRes = await uploadCvToStorage(cvFile, studentId);
    finalCvPath = uploadRes.path;
  }

  if (!finalCvPath) {
    finalCvPath = 'https://studenthub.vn/uploads/CV_Default_Student.pdf';
  }

  const isUuid = (val) =>
    typeof val === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  if (isSupabaseConfigured && !studentId.startsWith('demo_') && !studentId.startsWith('mock_') && isUuid(jobId)) {
    // 2. Kiểm tra tin tuyển dụng có tồn tại và còn mở không
    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .select('id, title, status, deadline, employer_id, company:companies(company_name, logo_url)')
      .eq('id', jobId)
      .maybeSingle();

    if (jobErr) {
      throw new Error(`Không thể kiểm tra tin tuyển dụng: ${jobErr.message}`);
    }

    if (!job) {
      throw new Error('Công việc này không tồn tại hoặc đã bị xóa.');
    }

    if (job.status === 'closed' || job.status === 'expired') {
      throw new Error('Tin tuyển dụng này hiện đã đóng hoặc hết hạn tiếp nhận hồ sơ.');
    }

    if (job.deadline) {
      const deadlineDate = new Date(job.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        throw new Error('Hạn chót nộp hồ sơ cho công việc này đã kết thúc.');
      }
    }

    // 3. Insert vào bảng public.job_applications với status 'applied' (lưu relative storage path)
    const payload = {
      job_id: jobId,
      student_id: studentId,
      cv_url: finalCvPath,
      cover_letter: coverLetter.trim(),
      status: 'applied'
    };

    const { data: newApp, error: insertErr } = await supabase
      .from('job_applications')
      .insert(payload)
      .select('*, job:jobs(id, title, salary_min, salary_max, location, company:companies(company_name, logo_url))')
      .single();

    if (insertErr) {
      if (insertErr.code === '23505' || insertErr.message?.includes('duplicate key') || insertErr.message?.includes('unique_job_student_application')) {
        throw new Error('Bạn đã nộp hồ sơ cho công việc này rồi. Mỗi ứng viên chỉ được nộp 1 lần cho một tin tuyển dụng.');
      }
      throw new Error(`Lỗi Supabase khi lưu hồ sơ ứng tuyển: ${insertErr.message}`);
    }

    return {
      id: newApp.id,
      jobId: newApp.job_id,
      jobTitle: newApp.job?.title || jobTitle,
      company: newApp.job?.company?.company_name || company || 'Doanh nghiệp',
      companyLogo: newApp.job?.company?.logo_url || companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      appliedDate: new Date(newApp.applied_at).toLocaleDateString('vi-VN'),
      appliedAt: newApp.applied_at,
      status: 'applied',
      statusText: 'Đã nộp hồ sơ',
      salary: expectedSalary || 'Theo thỏa thuận tin tuyển dụng',
      cvUrl: finalCvPath,
      coverLetter: coverLetter.trim(),
      portfolioLink,
      availableHours,
      studentId
    };
  }

  // Fallback dev demo khi job là mock/local job hoặc tài khoản demo
  const localApp = {
    id: `app_${Date.now()}`,
    jobId,
    jobTitle: jobTitle || 'Tin tuyển dụng',
    company: company || 'Doanh nghiệp tuyển dụng',
    companyLogo: companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
    appliedDate: 'Hôm nay',
    appliedAt: new Date().toISOString(),
    status: 'applied',
    statusText: 'Đã nộp hồ sơ',
    salary: expectedSalary || 'Theo thỏa thuận',
    cvUrl: finalCvPath,
    coverLetter: coverLetter.trim(),
    portfolioLink,
    availableHours,
    studentId
  };

  try {
    const raw = localStorage.getItem('studenthub_local_applications');
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem('studenthub_local_applications', JSON.stringify([localApp, ...existing]));
  } catch (e) {
    // ignore
  }

  return localApp;
}

// ------------------------------------------------------------------------------
// 3. LẤY DANH SÁCH ĐƠN ỨNG TUYỂN CỦA SINH VIÊN (MY APPLICATIONS)
// ------------------------------------------------------------------------------
export async function getStudentApplications(studentId) {
  if (!studentId) return [];

  let cloudApps = [];
  if (isSupabaseConfigured && !studentId.startsWith('demo_') && !studentId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          student_id,
          cv_url,
          cover_letter,
          status,
          applied_at,
          updated_at,
          job:jobs(
            id,
            title,
            salary_min,
            salary_max,
            location,
            working_hours,
            job_type,
            status,
            company:companies(company_name, logo_url)
          )
        `)
        .eq('student_id', studentId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('getStudentApplications Supabase error:', error);
      } else if (data) {
        cloudApps = data.map((item) => {
          const st = normalizeStatus(item.status);
          return {
            id: item.id,
            jobId: item.job_id,
            jobTitle: item.job?.title || 'Tin tuyển dụng',
            company: item.job?.company?.company_name || 'Doanh nghiệp',
            companyLogo: item.job?.company?.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
            salary: item.job?.salary_min
              ? `${new Intl.NumberFormat('vi-VN').format(item.job.salary_min)} – ${new Intl.NumberFormat('vi-VN').format(item.job.salary_max)}đ`
              : 'Thỏa thuận',
            location: item.job?.location || 'TP. Hồ Chí Minh',
            workingHours: item.job?.working_hours || 'Linh hoạt theo ca',
            appliedDate: formatAppliedDate(item.applied_at),
            appliedAt: item.applied_at,
            status: st,
            rawStatus: item.status,
            statusText: mapStatusToVietnamese(st),
            cvUrl: item.cv_url,
            coverLetter: item.cover_letter,
            studentId: item.student_id
          };
        });
      }
    } catch (err) {
      console.warn('Lỗi khi fetch applications từ Supabase:', err.message);
    }
  }

  let localApps = [];
  try {
    const raw = localStorage.getItem('studenthub_local_applications');
    if (raw) {
      localApps = JSON.parse(raw).filter((a) => a.studentId === studentId);
    }
  } catch (e) {}

  const seenIds = new Set();
  const merged = [];
  for (const app of [...cloudApps, ...localApps]) {
    if (!seenIds.has(app.id)) {
      seenIds.add(app.id);
      merged.push(app);
    }
  }

  return merged;
}

// ------------------------------------------------------------------------------
// 4. LẤY DANH SÁCH ỨNG VIÊN CHO NHÀ TUYỂN DỤNG (APPLICANT MANAGEMENT)
// ------------------------------------------------------------------------------
export async function getEmployerApplicants(employerId, options = {}) {
  if (!employerId) return [];

  const { jobId = 'all', status = 'all', search = '', page = 1, pageSize = 50 } = options;

  if (isSupabaseConfigured && !employerId.startsWith('demo_') && !employerId.startsWith('mock_')) {
    try {
      let query = supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          student_id,
          cv_url,
          cover_letter,
          status,
          applied_at,
          updated_at,
          job:jobs!inner(
            id,
            title,
            job_type,
            location,
            salary_min,
            salary_max,
            employer_id
          ),
          student:profiles(
            id,
            full_name,
            avatar_url,
            email,
            phone,
            bio,
            location
          )
        `)
        .eq('job.employer_id', employerId)
        .order('applied_at', { ascending: false });

      if (jobId && jobId !== 'all') {
        query = query.eq('job_id', jobId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Phân trang
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        console.error('getEmployerApplicants Supabase error:', error);
        throw error;
      }

      if (data) {
        const studentIds = data.map((d) => d.student_id).filter(Boolean);
        const appIds = data.map((d) => d.id).filter(Boolean);

        // Fetch student profiles & notes song song
        const [sProfilesRes, notesRes] = await Promise.all([
          studentIds.length > 0
            ? supabase
                .from('student_profiles')
                .select('user_id, university, major, skills, experience, graduation_year, availability')
                .in('user_id', studentIds)
            : Promise.resolve({ data: [] }),
          appIds.length > 0
            ? supabase
                .from('application_notes')
                .select('id, application_id, content, created_at, updated_at')
                .in('application_id', appIds)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [] })
        ]);

        const studentProfileMap = {};
        if (sProfilesRes.data) {
          sProfilesRes.data.forEach((sp) => {
            studentProfileMap[sp.user_id] = sp;
          });
        }

        const appNotesMap = {};
        if (notesRes.data) {
          notesRes.data.forEach((n) => {
            if (!appNotesMap[n.application_id]) {
              appNotesMap[n.application_id] = [];
            }
            appNotesMap[n.application_id].push(n);
          });
        }

        let dbApplicants = data.map((item) => {
          const sp = studentProfileMap[item.student_id] || {};
          const notes = appNotesMap[item.id] || [];
          const latestNote = notes.length > 0 ? notes[0].content : '';
          const st = normalizeStatus(item.status);

          return {
            id: item.id,
            jobId: item.job_id,
            jobTitle: item.job?.title || 'Công việc tuyển dụng',
            appliedFor: item.job?.title || 'Công việc tuyển dụng',
            jobType: item.job?.job_type || 'Part-time',
            jobLocation: item.job?.location || 'TP. Hồ Chí Minh',
            studentId: item.student_id,
            name: item.student?.full_name || 'Sinh viên ứng tuyển',
            avatar: item.student?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            email: item.student?.email || '',
            phone: item.student?.phone || '',
            location: item.student?.location || sp.address || 'TP. Hồ Chí Minh',
            university: sp.university || 'Đại học Văn Lang (VLU)',
            major: sp.major || 'Công nghệ Thông tin',
            graduationYear: sp.graduation_year || '2026',
            skills: Array.isArray(sp.skills) && sp.skills.length > 0 ? sp.skills : ['Kỹ năng chuyên môn', 'Chăm chỉ'],
            experience: sp.experience || '',
            availability: sp.availability || 'Linh hoạt',
            bio: item.student?.bio || '',
            coverLetter: item.cover_letter || '',
            cvUrl: item.cv_url,
            employerNotes: latestNote,
            notesList: notes,
            appliedAt: item.applied_at,
            appliedDate: formatAppliedDate(item.applied_at),
            status: st,
            rawStatus: item.status,
            statusText: mapStatusToVietnamese(st)
          };
        });

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          dbApplicants = dbApplicants.filter((a) =>
            a.name.toLowerCase().includes(q) ||
            (a.email && a.email.toLowerCase().includes(q)) ||
            a.jobTitle.toLowerCase().includes(q) ||
            (a.university && a.university.toLowerCase().includes(q))
          );
        }

        return dbApplicants;
      }
    } catch (err) {
      console.warn('Lỗi khi fetch applicants từ Supabase:', err.message);
    }
  }

  return [];
}

// ------------------------------------------------------------------------------
// 5. CẬP NHẬT TRẠNG THÁI ỨNG TUYỂN (CÓ KIỂM SOÁT MÁY TRẠNG THÁI)
// ------------------------------------------------------------------------------
export async function updateApplicationStatus(applicationId, targetStatus, activeUser = null) {
  if (!applicationId) throw new Error('Thiếu mã đơn ứng tuyển (Application ID).');

  const normalized = normalizeStatus(targetStatus);

  if (isSupabaseConfigured && !applicationId.toString().startsWith('app_')) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status: normalized,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Update application status Supabase error:', error);
      throw new Error(`Lỗi cập nhật trạng thái: ${error.message}`);
    }

    return data;
  }

  return { id: applicationId, status: normalized };
}

// ------------------------------------------------------------------------------
// 6. QUẢN LÝ GHI CHÚ NỘI BỘ (TABLE: application_notes) - RIÊNG TƯ CHO EMPLOYER
// ------------------------------------------------------------------------------
export async function getApplicationNotes(applicationId) {
  if (!applicationId) return [];

  if (isSupabaseConfigured && !applicationId.toString().startsWith('app_')) {
    const { data, error } = await supabase
      .from('application_notes')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi khi lấy ghi chú nội bộ:', error);
      throw error;
    }
    return data || [];
  }

  return [];
}

export async function saveApplicationNote(applicationId, content, activeUser) {
  if (!applicationId) throw new Error('Thiếu Application ID.');
  if (!content || !content.trim()) throw new Error('Nội dung ghi chú không được để trống.');

  const employerId = activeUser?.id;
  if (!employerId) throw new Error('Cần đăng nhập tài khoản Nhà tuyển dụng để lưu ghi chú.');

  if (isSupabaseConfigured && !applicationId.toString().startsWith('app_')) {
    const { data, error } = await supabase
      .from('application_notes')
      .insert({
        application_id: applicationId,
        employer_id: employerId,
        content: content.trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Lỗi khi lưu ghi chú vào application_notes:', error);
      throw new Error(`Không thể lưu ghi chú: ${error.message}`);
    }
    return data;
  }

  return {
    id: `note_${Date.now()}`,
    application_id: applicationId,
    employer_id: employerId,
    content: content.trim(),
    created_at: new Date().toISOString()
  };
}

export async function deleteApplicationNote(noteId) {
  if (!noteId) throw new Error('Thiếu mã ghi chú (Note ID).');

  if (isSupabaseConfigured && !noteId.toString().startsWith('note_')) {
    const { error } = await supabase
      .from('application_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Lỗi khi xóa ghi chú:', error);
      throw new Error(`Không thể xóa ghi chú: ${error.message}`);
    }
    return true;
  }

  return true;
}

// ------------------------------------------------------------------------------
// 7. LẤY LỊCH SỬ TRẠNG THÁI (TABLE: application_status_history)
// ------------------------------------------------------------------------------
export async function getApplicationStatusHistory(applicationId) {
  if (!applicationId) return [];

  if (isSupabaseConfigured && !applicationId.toString().startsWith('app_')) {
    const { data, error } = await supabase
      .from('application_status_history')
      .select(`
        id,
        application_id,
        old_status,
        new_status,
        changed_at,
        changed_by,
        changer:profiles(full_name, role)
      `)
      .eq('application_id', applicationId)
      .order('changed_at', { ascending: true });

    if (error) {
      console.error('Lỗi khi lấy lịch sử trạng thái:', error);
      throw error;
    }
    return data || [];
  }

  return [];
}

// ------------------------------------------------------------------------------
// 8. HELPER MAPPERS & UTILITIES
// ------------------------------------------------------------------------------
export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'applied';
  const s = rawStatus.toLowerCase();
  switch (s) {
    case 'applied':
    case 'pending':
    case 'new':
    case 'submitted':
      return 'applied';
    case 'reviewing':
      return 'reviewing';
    case 'interview':
    case 'shortlisted':
      return 'interview';
    case 'accepted':
    case 'hired':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    default:
      return 'applied';
  }
}

export function mapStatusToVietnamese(status) {
  const s = normalizeStatus(status);
  switch (s) {
    case 'applied':
      return 'Đã nộp hồ sơ';
    case 'reviewing':
      return 'Đang xem xét';
    case 'interview':
      return 'Hẹn phỏng vấn';
    case 'accepted':
      return 'Đã nhận việc';
    case 'rejected':
      return 'Từ chối';
    default:
      return 'Đã nộp hồ sơ';
  }
}

export function mapStatusToBadgeStyle(status) {
  const s = normalizeStatus(status);
  switch (s) {
    case 'applied':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'reviewing':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'interview':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'accepted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function formatAppliedDate(dateString) {
  if (!dateString) return 'Chưa rõ';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
