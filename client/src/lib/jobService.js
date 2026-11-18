import { supabase, isSupabaseConfigured } from './supabase';
import { initialJobs } from '../data/mockData';

// Helper: Format tiền tệ VNĐ hiển thị
export function formatSalary(min, max) {
  if (!min && !max) return 'Thỏa thuận';
  if (min && !max) return `Từ ${new Intl.NumberFormat('vi-VN').format(min)}đ`;
  if (!min && max) return `Đến ${new Intl.NumberFormat('vi-VN').format(max)}đ`;
  return `${new Intl.NumberFormat('vi-VN').format(min)} – ${new Intl.NumberFormat('vi-VN').format(max)}đ`;
}

// ------------------------------------------------------------------------------
// 1. LẤY DANH SÁCH VIỆC LÀM CHO MARKETPLACE (SEARCH + FILTER + SORT + PAGINATION)
// Hỗ trợ đồng thời: Supabase Cloud DB + Persistent Local Storage + Mock Fallback
// ------------------------------------------------------------------------------
export async function getMarketplaceJobs({
  keyword = '',
  location = '',
  jobTypes = [],
  salaryRanges = [],
  skills = [],
  category = '',
  experience = '',
  sortBy = 'newest',
  page = 1,
  pageSize = 6
}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const todayStr = new Date().toISOString().split('T')[0];

  let dbJobs = [];

  // 1. Truy vấn từ Supabase PostgreSQL nếu đã cấu hình
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('jobs')
        .select('*, company:companies(company_name, logo_url, location)', { count: 'exact' })
        .in('status', ['published', 'active'])
        .or(`deadline.is.null,deadline.gte.${todayStr}`);

      const { data, error } = await query;
      if (!error && data) {
        dbJobs = data.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company?.company_name || 'Doanh nghiệp',
          companyLogo: j.company?.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
          type: j.job_type,
          workMode: j.job_type === 'Remote' ? 'Remote' : 'Onsite',
          salary: formatSalary(j.salary_min, j.salary_max),
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          location: j.location,
          workingHours: j.working_hours || 'Linh hoạt theo lịch học',
          skills: j.skills || [],
          postedTime: new Date(j.created_at).toLocaleDateString('vi-VN'),
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn',
          verified: true,
          status: j.status,
          employerId: j.employer_id,
          description: j.description,
          responsibilities: j.requirements || [],
          requirements: j.requirements || [],
          benefits: j.benefits || ['Ký quỹ thù lao minh bạch', 'Hỗ trợ mộc thực tập sinh viên']
        }));
      }
    } catch (err) {
      console.warn('Lỗi query Supabase jobs:', err.message);
    }
  }

  // 1b. Lấy việc làm từ Backend Express Server (http://localhost:5000/api/jobs)
  // Đây là cầu nối giúp Edge <-> Cốc Cốc <-> Chrome đồng bộ tức thời mọi bài đăng tuyển dụng
  let serverJobs = [];
  try {
    const res = await fetch('http://localhost:5000/api/jobs');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverJobs = json.data.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company || 'Doanh nghiệp VLU',
          companyLogo: j.companyLogo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
          type: j.type || j.job_type || 'Part-time',
          workMode: j.workMode || ((j.job_type || '').toLowerCase().includes('freelance') || (j.job_type || '').toLowerCase().includes('remote') ? 'Remote' : 'Onsite'),
          salary: j.salary || formatSalary(j.salary_min || j.salary_amount, j.salary_max || j.salary_amount),
          salaryMin: j.salaryMin || j.salary_min || j.salary_amount,
          salaryMax: j.salaryMax || j.salary_max || j.salary_amount,
          location: j.location || (j.district ? `${j.district}, TP. Hồ Chí Minh` : 'TP. Hồ Chí Minh'),
          workingHours: j.workingHours || j.shift_time || 'Linh hoạt theo lịch học',
          skills: Array.isArray(j.skills) ? j.skills : typeof j.skills === 'string' ? j.skills.split(',').map((s) => s.trim()).filter(Boolean) : ['Linh hoạt'],
          postedTime: j.postedTime || 'Vừa xong',
          deadline: j.deadline || '2026-12-30',
          verified: true,
          status: j.status || 'published',
          employerId: j.employer_id,
          description: j.description || '',
          responsibilities: Array.isArray(j.requirements) ? j.requirements : [j.description || ''],
          requirements: Array.isArray(j.requirements) ? j.requirements : [j.description || ''],
          benefits: Array.isArray(j.benefits) ? j.benefits : ['Ký quỹ thù lao minh bạch', 'Hỗ trợ mộc thực tập sinh viên']
        }));
      }
    }
  } catch (err) {}

  // 2. Lấy danh sách tin tuyển dụng từ bộ nhớ lưu trữ bền vững (Persistent Local Storage)
  // Các tin nhà tuyển dụng vừa đăng sẽ luôn được ưu tiên hiển thị ở vị trí đầu tiên
  const localSaved = getLocalSavedJobs().filter((j) => !j.status || j.status === 'published' || j.status === 'active');

  // 3. Hợp nhất: Tin từ Backend Server (mới nhất từ mọi trình duyệt) -> Tin lưu cục bộ -> Tin từ Supabase -> Tin mẫu ban đầu
  let combinedJobs = [...serverJobs, ...localSaved, ...dbJobs, ...initialJobs];

  // Khử trùng lặp theo ID (ưu tiên bản ghi mới nhất)
  let filtered = Array.from(new Map(combinedJobs.map((item) => [String(item.id), item])).values());

  // 4. Lọc theo từ khóa tìm kiếm (Tiêu đề, Tên công ty, Kỹ năng, Mô tả, Yêu cầu)
  if (keyword && keyword.trim()) {
    const q = keyword.trim().toLowerCase();
    filtered = filtered.filter((j) => {
      const matchTitle = j.title?.toLowerCase().includes(q);
      const matchCompany = j.company?.toLowerCase().includes(q);
      const matchDesc = j.description?.toLowerCase().includes(q);
      const matchSkills = Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q));
      const matchReqs = Array.isArray(j.requirements) && j.requirements.some((r) => r.toLowerCase().includes(q));
      return matchTitle || matchCompany || matchDesc || matchSkills || matchReqs;
    });
  }

  // 5. Lọc theo địa điểm (thông minh, linh hoạt)
  if (location && location.trim() && location.trim() !== 'Tất cả' && location.trim() !== 'Tất cả địa điểm') {
    const qLoc = location.trim().toLowerCase();
    filtered = filtered.filter((j) => {
      const loc = (j.location || '').toLowerCase();
      const locGroup = (j.locationGroup || '').toLowerCase();
      const district = (j.district || '').toLowerCase();

      // Nếu tìm kiếm TP.HCM, match cả các quận nội thành và việc làm Online
      if (qLoc.includes('hồ chí minh') || qLoc.includes('hcm') || qLoc.includes('sài gòn')) {
        return (
          loc.includes('hồ chí minh') ||
          loc.includes('hcm') ||
          loc.includes('bình thạnh') ||
          loc.includes('quận') ||
          loc.includes('thủ đức') ||
          loc.includes('online') ||
          locGroup.includes('hcm')
        );
      }

      return loc.includes(qLoc) || locGroup.includes(qLoc) || district.includes(qLoc);
    });
  }

  // 6. Lọc theo loại công việc (Part-time, Freelance, Internship, Remote...)
  if (jobTypes && jobTypes.length > 0) {
    filtered = filtered.filter((j) =>
      jobTypes.some((t) => (j.type || '').toLowerCase() === t.toLowerCase())
    );
  }

  // 7. Lọc theo nhóm kỹ năng sinh viên (không phân biệt chữ hoa/thường)
  if (skills && skills.length > 0) {
    filtered = filtered.filter((j) => {
      if (!Array.isArray(j.skills)) return false;
      return skills.some((targetSkill) =>
        j.skills.some((s) => s.toLowerCase().includes(targetSkill.toLowerCase()))
      );
    });
  }

  // 8. Lọc theo khoảng mức lương
  if (salaryRanges && salaryRanges.length > 0) {
    filtered = filtered.filter((j) => {
      const min = j.salaryMin || 0;
      const max = j.salaryMax || j.salaryMin || 0;
      return salaryRanges.some((range) => {
        if (range === 'under_2m' || range === 'under_3m') return min < 3000000 || max <= 3000000;
        if (range === '2_to_5m' || range === '3_to_5m') return (min >= 2000000 && min <= 5000000) || (max >= 2000000 && max <= 5000000);
        if (range === '5_to_10m') return (min >= 5000000 && min <= 10000000) || (max >= 5000000 && max <= 10000000);
        if (range === 'over_10m') return max >= 10000000 || min >= 10000000;
        return true;
      });
    });
  }

  // 8b. Lọc theo Ngành nghề (TopCV category / industry filter)
  if (category && category !== 'all' && category !== 'Tất cả') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((j) => {
      const title = (j.title || '').toLowerCase();
      const desc = (j.description || '').toLowerCase();
      const reqs = Array.isArray(j.requirements) ? j.requirements.join(' ').toLowerCase() : '';
      const skillsStr = Array.isArray(j.skills) ? j.skills.join(' ').toLowerCase() : '';
      const text = `${title} ${desc} ${reqs} ${skillsStr}`;

      if (catLower === 'it' || catLower.includes('cntt') || catLower.includes('phần mềm')) {
        return text.includes('developer') || text.includes('lập trình') || text.includes('react') || text.includes('it') || text.includes('cntt') || text.includes('frontend') || text.includes('backend') || text.includes('tester') || text.includes('web');
      }
      if (catLower === 'marketing' || catLower.includes('marketing') || catLower.includes('truyền thông')) {
        return text.includes('marketing') || text.includes('tiktok') || text.includes('content') || text.includes('social') || text.includes('seo') || text.includes('media') || text.includes('copywriting') || text.includes('ads');
      }
      if (catLower === 'design' || catLower.includes('thiết kế') || catLower.includes('đồ họa')) {
        return text.includes('thiết kế') || text.includes('design') || text.includes('canva') || text.includes('figma') || text.includes('photoshop') || text.includes('video') || text.includes('capcut') || text.includes('editor');
      }
      if (catLower === 'sales' || catLower.includes('bán hàng') || catLower.includes('f&b')) {
        return text.includes('bán hàng') || text.includes('sales') || text.includes('cskh') || text.includes('telesale') || text.includes('phục vụ') || text.includes('thu ngân') || text.includes('pha chế') || text.includes('f&b') || text.includes('tư vấn');
      }
      if (catLower === 'admin' || catLower.includes('nhân sự') || catLower.includes('hành chính')) {
        return text.includes('nhân sự') || text.includes('hr') || text.includes('hành chính') || text.includes('admin') || text.includes('trợ lý') || text.includes('tuyển dụng');
      }
      if (catLower === 'finance' || catLower.includes('kế toán') || catLower.includes('tài chính')) {
        return text.includes('kế toán') || text.includes('kiểm toán') || text.includes('tài chính') || text.includes('thuế') || text.includes('thu chi') || text.includes('hóa đơn');
      }
      if (catLower === 'education' || catLower.includes('gia sư') || catLower.includes('giáo dục')) {
        return text.includes('gia sư') || text.includes('dạy kèm') || text.includes('tiếng anh') || text.includes('trợ giảng') || text.includes('giáo dục');
      }
      return text.includes(catLower);
    });
  }

  // 8c. Lọc theo Kinh nghiệm (TopCV experience filter)
  if (experience && experience !== 'all' && experience !== 'Tất cả') {
    const expLower = experience.toLowerCase();
    filtered = filtered.filter((j) => {
      const text = `${j.title || ''} ${j.description || ''} ${Array.isArray(j.requirements) ? j.requirements.join(' ') : ''}`.toLowerCase();
      if (expLower === 'none' || expLower.includes('chưa có') || expLower.includes('không yêu cầu')) {
        return text.includes('không yêu cầu') || text.includes('chưa có') || text.includes('được đào tạo') || text.includes('sinh viên') || !text.includes('năm kinh nghiệm');
      }
      if (expLower === 'intern' || expLower.includes('thực tập')) {
        return text.includes('thực tập') || text.includes('intern') || (j.type || '').toLowerCase().includes('intern');
      }
      if (expLower === 'under_1y' || expLower.includes('dưới 1 năm')) {
        return text.includes('dưới 1 năm') || text.includes('chưa có kinh nghiệm') || text.includes('không yêu cầu') || text.includes('sinh viên');
      }
      if (expLower === '1_to_2y' || expLower.includes('1 - 2 năm')) {
        return text.includes('1 năm') || text.includes('2 năm');
      }
      return true;
    });
  }

  // 9. Sắp xếp kết quả
  if (sortBy === 'salary_high') {
    filtered.sort((a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0));
  } else if (sortBy === 'salary_low') {
    filtered.sort((a, b) => (a.salaryMin || a.salaryMax || 0) - (b.salaryMin || b.salaryMax || 0));
  } else if (sortBy === 'oldest') {
    filtered.reverse();
  }
  // Mặc định 'newest': Các việc làm mới đăng trong localSaved đã ở trên cùng

  const total = filtered.length;
  const pagedJobs = filtered.slice(from, to + 1);

  return {
    jobs: pagedJobs,
    total,
    page,
    totalPages: Math.ceil(total / pageSize) || 1
  };
}

// ------------------------------------------------------------------------------
// 2. CHI TIẾT CÔNG VIỆC THEO ID
// ------------------------------------------------------------------------------
export async function getJobById(jobId) {
  if (!jobId) return null;

  // 1. Kiểm tra trong bộ nhớ Persistent Local Storage (các job mới đăng của nhà tuyển dụng)
  const localSaved = getLocalSavedJobs();
  const localJob = localSaved.find((j) => String(j.id) === String(jobId));
  if (localJob) {
    return {
      ...localJob,
      benefits: localJob.benefits?.length ? localJob.benefits : ['Ký quỹ thù lao an toàn qua StudentHub Escrow', 'Hỗ trợ mộc thực tập tốt nghiệp']
    };
  }

  // 2. Kiểm tra trên Supabase PostgreSQL nếu đã kết nối
  if (isSupabaseConfigured && !String(jobId).startsWith('job_')) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:companies(company_name, logo_url, description, website, location)')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          title: data.title,
          company: data.company?.company_name || 'Doanh nghiệp',
          companyLogo: data.company?.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
          type: data.job_type,
          workMode: data.job_type === 'Remote' ? 'Remote' : 'Onsite',
          salary: formatSalary(data.salary_min, data.salary_max),
          salaryMin: data.salary_min,
          salaryMax: data.salary_max,
          location: data.location,
          workingHours: data.working_hours || 'Linh hoạt theo ca',
          skills: data.skills || [],
          deadline: data.deadline ? new Date(data.deadline).toLocaleDateString('vi-VN') : 'Đang mở',
          postedTime: new Date(data.created_at).toLocaleDateString('vi-VN'),
          status: data.status,
          employerId: data.employer_id,
          description: data.description,
          responsibilities: data.requirements || [],
          requirements: data.requirements || [],
          benefits: data.benefits || ['Ký quỹ thù lao an toàn qua StudentHub', 'Hỗ trợ mộc thực tập'],
          verified: true
        };
      }
    } catch (e) {
      console.warn('Lỗi getJobById Supabase:', e.message);
    }
  }

  // 3. Fallback danh sách dữ liệu mẫu
  return initialJobs.find((j) => String(j.id) === String(jobId)) || null;
}

// Helper lưu trữ bền vững (Persistent Storage) cho chế độ Local / Demo
const LOCAL_STORAGE_JOBS_KEY = 'studenthub_local_saved_jobs';

export function getLocalSavedJobs() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalJob(job) {
  try {
    const existing = getLocalSavedJobs();
    const updated = [job, ...existing.filter((j) => j.id !== job.id)];
    localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Lỗi lưu local job:', e);
  }
}

// ------------------------------------------------------------------------------
// 3. EMPLOYER: LẤY DANH SÁCH JOB CỦA CHỦ DOANH NGHIỆP HIỆN TẠI (SUPABASE + LOCAL)
// ------------------------------------------------------------------------------
export async function getEmployerJobs(employerId) {
  if (!employerId) return [];

  let dbJobs = [];
  if (isSupabaseConfigured && !employerId.startsWith('demo_') && !employerId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:companies(company_name, logo_url)')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getEmployerJobs Supabase error:', error);
      } else if (data) {
        dbJobs = data.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company?.company_name || 'Doanh nghiệp',
          companyLogo: j.company?.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
          type: j.job_type,
          status: j.status,
          salary: formatSalary(j.salary_min, j.salary_max),
          salaryMin: j.salary_min,
          salaryMax: j.salary_max,
          location: j.location,
          workingHours: j.working_hours,
          deadline: j.deadline,
          skills: j.skills || [],
          description: j.description,
          requirements: j.requirements || [],
          benefits: j.benefits || [],
          created_at: j.created_at
        }));
      }
    } catch (e) {
      console.warn('Lỗi khi fetch jobs của employer từ Supabase:', e.message);
    }
  }

  // Lấy các job từ bộ nhớ bền vững (persistent local storage)
  const localJobs = getLocalSavedJobs().filter((j) => {
    return j.employerId === employerId || employerId.includes('employer');
  });

  const combined = [...localJobs, ...dbJobs];
  const uniqueJobs = Array.from(new Map(combined.map((item) => [item.id, item])).values());

  if (uniqueJobs.length > 0) {
    return uniqueJobs;
  }

  // Fallback danh sách việc làm mẫu nếu chưa có tin đăng nào
  return initialJobs.slice(0, 3).map((j) => ({
    ...j,
    status: 'published'
  }));
}

// ------------------------------------------------------------------------------
// 4. EMPLOYER: ĐĂNG TIN TUYỂN DỤNG MỚI (VALIDATION + SUPABASE/LOCAL INSERT)
// ------------------------------------------------------------------------------
export async function createEmployerJob(jobForm, activeUser = null) {
  // 1. Xác thực tài khoản người dùng
  let user = activeUser;
  if (!user && isSupabaseConfigured) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) user = authUser;
    } catch (e) {
      // ignore
    }
  }

  if (!user) {
    throw new Error('Bạn cần đăng nhập để đăng tin tuyển dụng.');
  }

  // 2. Kiểm tra Role (ưu tiên user_metadata.role và profiles.role vì Supabase Auth user.role mặc định là 'authenticated')
  let userRole = user.user_metadata?.role || (user.role && user.role !== 'authenticated' ? user.role : null);
  if (!userRole && isSupabaseConfigured && user.id) {
    try {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (prof?.role) userRole = prof.role;
    } catch (e) {
      // ignore
    }
  }
  if (!userRole) userRole = 'employer';

  if (userRole !== 'employer' && userRole !== 'admin') {
    throw new Error('Chỉ tài khoản Nhà tuyển dụng mới có quyền đăng tin tuyển dụng.');
  }

  const employerId = user.id || 'demo_employer_01';

  // 3. Validation bắt buộc
  if (!jobForm.title?.trim()) throw new Error('Tiêu đề công việc là bắt buộc.');
  if (!jobForm.description?.trim()) throw new Error('Mô tả chi tiết công việc là bắt buộc.');
  if (!jobForm.job_type?.trim()) throw new Error('Vui lòng chọn loại công việc.');
  if (!jobForm.location?.trim()) throw new Error('Địa điểm làm việc là bắt buộc.');
  if (!jobForm.deadline) throw new Error('Hạn chót nộp hồ sơ là bắt buộc.');

  const minSalary = Number(jobForm.salary_min) || 0;
  const maxSalary = Number(jobForm.salary_max) || 0;
  if (minSalary > maxSalary && maxSalary > 0) {
    throw new Error('Mức lương tối thiểu không được lớn hơn mức lương tối đa.');
  }

  // Chuẩn hóa định dạng ngày deadline sang chuẩn PostgreSQL DATE (YYYY-MM-DD)
  let formattedDeadline = jobForm.deadline;
  if (formattedDeadline && formattedDeadline.includes('/')) {
    const parts = formattedDeadline.split('/');
    if (parts.length === 3) {
      formattedDeadline = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const deadlineDate = new Date(formattedDeadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(deadlineDate.getTime()) || deadlineDate < today) {
    throw new Error('Hạn chót nộp hồ sơ không hợp lệ hoặc nằm trong quá khứ.');
  }

  // 4. Khi kết nối Supabase Cloud thực tế với UUID hợp lệ
  const isRealSupabaseUser = isSupabaseConfigured && user.id && !user.id.startsWith('demo_') && !user.id.startsWith('mock_');
  if (isRealSupabaseUser) {
    let companyId = null;
    try {
      const { data: comp } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', employerId)
        .maybeSingle();

      if (comp?.id) {
        companyId = comp.id;
      } else if (jobForm.company_name?.trim()) {
        const { data: newComp, error: compErr } = await supabase
          .from('companies')
          .insert({
            owner_id: employerId,
            company_name: jobForm.company_name.trim(),
            location: jobForm.location.trim()
          })
          .select('id')
          .maybeSingle();

        if (!compErr && newComp?.id) {
          companyId = newComp.id;
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra company Supabase:', e.message);
    }

    const payload = {
      employer_id: employerId,
      company_id: companyId,
      title: jobForm.title.trim(),
      description: jobForm.description.trim(),
      job_type: jobForm.job_type,
      location: jobForm.location.trim(),
      salary_min: minSalary,
      salary_max: maxSalary,
      skills: Array.isArray(jobForm.skills) ? jobForm.skills : [],
      requirements: Array.isArray(jobForm.requirements) ? jobForm.requirements : [jobForm.description.trim()],
      benefits: Array.isArray(jobForm.benefits) ? jobForm.benefits : [],
      working_hours: jobForm.working_hours || 'Linh hoạt theo ca',
      deadline: formattedDeadline,
      status: 'published'
    };

    const { data: newJob, error: jobErr } = await supabase
      .from('jobs')
      .insert(payload)
      .select()
      .single();

    if (jobErr) {
      console.error('Create job error:', jobErr);
      throw new Error(`Lỗi Supabase khi lưu tin: ${jobErr.message}`);
    }

    saveLocalJob({
      ...newJob,
      company: jobForm.company_name || 'Doanh nghiệp',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
      type: newJob.job_type,
      salary: formatSalary(minSalary, maxSalary),
      salaryMin: minSalary,
      salaryMax: maxSalary,
      employerId
    });

    return newJob;
  }

  // 5. Chế độ Local / Demo Session (như Chị Mai - HR ABC Media)
  const newCreatedJob = {
    id: `job_${Date.now()}`,
    title: jobForm.title.trim(),
    company: jobForm.company_name || user.full_name || 'ABC Media Studio',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
    type: jobForm.job_type,
    workMode: jobForm.job_type === 'Remote' ? 'Remote' : 'Onsite',
    salary: formatSalary(minSalary, maxSalary),
    salaryMin: minSalary,
    salaryMax: maxSalary,
    location: jobForm.location.trim(),
    workingHours: jobForm.working_hours || 'Linh hoạt theo lịch học',
    skills: Array.isArray(jobForm.skills) ? jobForm.skills : [],
    requirements: Array.isArray(jobForm.requirements) ? jobForm.requirements : [jobForm.description.trim()],
    benefits: Array.isArray(jobForm.benefits) ? jobForm.benefits : [],
    deadline: formattedDeadline,
    postedTime: 'Vừa xong',
    status: 'published',
    employerId: employerId,
    description: jobForm.description.trim(),
    created_at: new Date().toISOString(),
    verified: true
  };

  // Lưu vĩnh viễn vào bộ nhớ Persistent Local Storage
  saveLocalJob(newCreatedJob);

  // Đồng thời gửi tới Backend Express API (http://localhost:5000/api/jobs) nếu đang chạy
  try {
    fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newCreatedJob.title,
        company: newCreatedJob.company,
        salary_amount: maxSalary || minSalary || 2000000,
        job_type: newCreatedJob.type.toLowerCase().includes('freelance') ? 'freelance' : 'part-time',
        district: newCreatedJob.location,
        description: newCreatedJob.description,
        skills: newCreatedJob.skills,
        requirements: newCreatedJob.requirements.join('; '),
        benefits: newCreatedJob.benefits.join('; '),
        status: 'published'
      })
    }).catch(() => {});
  } catch (e) {
    // ignore
  }

  return newCreatedJob;
}

// ------------------------------------------------------------------------------
// 5. EMPLOYER: CHỈNH SỬA JOB (UPDATE JOB)
// ------------------------------------------------------------------------------
export async function updateEmployerJob(jobId, jobForm, employerId) {
  // Cập nhật persistent local storage
  const localJobs = getLocalSavedJobs();
  const updated = localJobs.map((j) => (j.id === jobId ? { ...j, ...jobForm } : j));
  localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && !jobId.toString().startsWith('job_')) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: jobForm.title,
          description: jobForm.description,
          job_type: jobForm.job_type,
          location: jobForm.location,
          salary_min: Number(jobForm.salary_min) || 0,
          salary_max: Number(jobForm.salary_max) || 0,
          skills: Array.isArray(jobForm.skills) ? jobForm.skills : [],
          requirements: Array.isArray(jobForm.requirements) ? jobForm.requirements : [],
          benefits: Array.isArray(jobForm.benefits) ? jobForm.benefits : [],
          working_hours: jobForm.working_hours,
          deadline: jobForm.deadline
        })
        .eq('id', jobId)
        .select()
        .single();

      if (!error) return data;
    } catch (e) {
      console.warn('updateEmployerJob Supabase error:', e);
    }
  }

  return { id: jobId, ...jobForm };
}

// ------------------------------------------------------------------------------
// 6. EMPLOYER: CẬP NHẬT TRẠNG THÁI JOB (PUBLISHED, CLOSED, DRAFT)
// ------------------------------------------------------------------------------
export async function setJobStatus(jobId, newStatus, employerId) {
  // Cập nhật persistent local storage
  const localJobs = getLocalSavedJobs();
  const updated = localJobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j));
  localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && !jobId.toString().startsWith('job_')) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId)
        .select()
        .single();

      if (!error) return data;
    } catch (e) {
      console.warn('setJobStatus Supabase error:', e);
    }
  }

  return { id: jobId, status: newStatus };
}

// ------------------------------------------------------------------------------
// 7. EMPLOYER: XÓA TIN TUYỂN DỤNG
// ------------------------------------------------------------------------------
export async function deleteEmployerJob(jobId, employerId) {
  // Xóa khỏi persistent local storage
  const localJobs = getLocalSavedJobs();
  const updated = localJobs.filter((j) => j.id !== jobId);
  localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && !jobId.toString().startsWith('job_')) {
    try {
      await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
    } catch (e) {
      console.warn('deleteEmployerJob Supabase error:', e);
    }
  }

  return true;
}

// ------------------------------------------------------------------------------
// 8. STUDENT: QUẢN LÝ TIN VIỆC LÀM ĐÃ LƯU (SAVED JOBS)
// ------------------------------------------------------------------------------
export async function getSavedJobIds(userId) {
  if (!userId) return new Set();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) return new Set(data.map((item) => item.job_id));
    } catch (e) {
      console.warn('Lỗi getSavedJobIds:', e.message);
    }
  }

  // Fallback từ localStorage
  const saved = localStorage.getItem(`saved_jobs_${userId}`);
  if (saved) {
    try {
      return new Set(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }
  return new Set(['job_01', 'job_03']);
}

export async function toggleSavedJob(userId, jobId) {
  if (!userId) throw new Error('Vui lòng đăng nhập để lưu công việc.');

  if (isSupabaseConfigured && !jobId.startsWith('job_')) {
    try {
      // Kiểm tra xem đã lưu chưa
      const { data: existing } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (existing) {
        // Đã lưu -> Xóa (Unsave)
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', userId)
          .eq('job_id', jobId);
        return { isSaved: false };
      } else {
        // Chưa lưu -> Thêm (Save)
        await supabase
          .from('saved_jobs')
          .insert({ user_id: userId, job_id: jobId });
        return { isSaved: true };
      }
    } catch (e) {
      console.warn('Lỗi toggleSavedJob Supabase:', e.message);
    }
  }

  // LocalStorage fallback
  const savedSet = await getSavedJobIds(userId);
  let isSaved = false;
  if (savedSet.has(jobId)) {
    savedSet.delete(jobId);
    isSaved = false;
  } else {
    savedSet.add(jobId);
    isSaved = true;
  }
  localStorage.setItem(`saved_jobs_${userId}`, JSON.stringify([...savedSet]));
  return { isSaved };
}
