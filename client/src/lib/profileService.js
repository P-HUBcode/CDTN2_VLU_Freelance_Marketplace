import { supabase, isSupabaseConfigured } from './supabase';

// ==============================================================================
// STUDENTHUB - PROFILE & PORTFOLIO SERVICE (SUPABASE POSTGRESQL + STORAGE)
// ==============================================================================

const LOCAL_STORAGE_PROFILE_KEY = 'studenthub_local_profile_';
const LOCAL_STORAGE_PROJECTS_KEY = 'studenthub_local_projects_';
const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));

// Dữ liệu mẫu chuẩn mực khi người dùng mới tạo hồ sơ
export const defaultStudentProfile = {
  full_name: 'Nguyễn Minh Anh',
  email: 'minhanh.nguyen@student.vlu.edu.vn',
  phone: '0908 123 456',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  cover_url: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80',
  bio: 'Sinh viên năm 3 ngành Công nghệ Thông tin & Thiết kế Truyền thông. Đam mê thiết kế UI/UX, lập trình web frontend và sáng tạo nội dung đa nền tảng.',
  location: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
  university: 'Đại học Văn Lang (VLU)',
  major: 'Công nghệ Thông tin & Thiết kế Đồ họa',
  graduation_year: '2026',
  birth_date: '2004-05-15',
  experience: '1 năm kinh nghiệm làm freelancer thiết kế banner, xây dựng landing page ReactJS cho các dự án khởi nghiệp và câu lạc bộ sinh viên.',
  availability: '15 - 20 giờ/tuần (Linh hoạt theo lịch học)',
  career_goals: 'Trở thành Senior Frontend Developer / Product Designer trong vòng 3 năm tới, chuyên sâu về thiết kế trải nghiệm người dùng và hệ thống Design System.',
  skills: ['ReactJS', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'Canva', 'JavaScript', 'HTML/CSS', 'Git'],
  foreign_languages: [
    { language: 'Tiếng Anh', level: 'IELTS 6.5 (Giao tiếp tốt & đọc hiểu tài liệu chuyên ngành)' },
    { language: 'Tiếng Hàn', level: 'Sơ cấp TOPIK 1' }
  ],
  certifications: [
    { name: 'Google UX Design Professional Certificate', issuer: 'Coursera / Google', year: '2025' },
    { name: 'Meta Front-End Developer Specialization', issuer: 'Meta', year: '2025' }
  ],
  academic_achievements: 'Học bổng khuyến khích học tập xuất sắc học kỳ 1 năm học 2025-2026. Giải Nhì cuộc thi Web Design Hackathon Sinh viên 2025.',
  address: 'Ký túc xá Đại học Văn Lang, Cơ sở chính, TP. Hồ Chí Minh',
  is_public: true
};

// Dữ liệu mẫu dự án Portfolio
export const defaultStudentProjects = [
  {
    id: 'proj_01',
    title: 'StudentHub — Nền tảng Freelance & Marketplace cho Sinh viên',
    description: 'Nền tảng kết nối sinh viên tìm việc làm part-time và dự án freelance ngắn hạn với nhà tuyển dụng doanh nghiệp. Tích hợp bộ lọc tìm kiếm tức thì, nộp đơn 1-chạm và tải CV lên Cloud.',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    technologies: ['React 19', 'Tailwind CSS', 'Supabase', 'Node.js', 'PostgreSQL'],
    role: 'Lead Frontend Developer & UI/UX Designer',
    github_url: 'https://github.com/studenthub-vlu/studenthub',
    demo_url: 'http://localhost:5173',
    start_date: '09/2025',
    end_date: '11/2026'
  },
  {
    id: 'proj_02',
    title: 'UniCoffee — Ứng dụng đặt đồ uống trực tuyến cho sinh viên',
    description: 'Thiết kế hệ sinh thái UI/UX và xây dựng web app đặt cà phê mang đi tại các căn tin trường đại học, hỗ trợ thanh toán mã QR và theo dõi trạng thái đơn hàng thời gian thực.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    technologies: ['Figma', 'React', 'CSS Modules', 'Express.js'],
    role: 'UI Designer & Web Developer',
    github_url: 'https://github.com/studenthub-vlu/unicoffee',
    demo_url: 'https://unicoffee.demo.vn',
    start_date: '03/2025',
    end_date: '06/2025'
  }
];

// Helper: Lưu local storage an toàn
function getLocalProfile(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveLocalProfile(userId, data) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_KEY}${userId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Lỗi lưu local profile:', e);
  }
}

function getLocalProjects(userId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PROJECTS_KEY}${userId}`);
    if (raw) return JSON.parse(raw);
    return defaultStudentProjects;
  } catch (e) {
    return defaultStudentProjects;
  }
}

function saveLocalProjects(userId, list) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PROJECTS_KEY}${userId}`, JSON.stringify(list));
  } catch (e) {
    console.warn('Lỗi lưu local projects:', e);
  }
}

// ------------------------------------------------------------------------------
// 1. LẤY HỒ SƠ SINH VIÊN (PROFILES + STUDENT_PROFILES)
// ------------------------------------------------------------------------------
export async function getStudentProfile(userId) {
  if (!userId) return defaultStudentProfile;

  const cached = getLocalProfile(userId) || {};

  // 1. Thử lấy từ Supabase nếu đã cấu hình và userId là UUID hợp lệ
  if (isSupabaseConfigured && isUuid(userId)) {
    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: sProf, error: sProfErr } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (prof) {
        const merged = {
          ...defaultStudentProfile,
          ...cached,
          full_name: prof.full_name || cached.full_name || defaultStudentProfile.full_name,
          email: prof.email || cached.email || defaultStudentProfile.email,
          phone: prof.phone || cached.phone || defaultStudentProfile.phone,
          avatar_url: prof.avatar_url || cached.avatar_url || defaultStudentProfile.avatar_url,
          cover_url: prof.cover_url || sProf?.cover_url || cached.cover_url || defaultStudentProfile.cover_url,
          bio: prof.bio || cached.bio || defaultStudentProfile.bio,
          location: prof.location || cached.location || defaultStudentProfile.location,
          university: sProf?.university || cached.university || defaultStudentProfile.university,
          major: sProf?.major || cached.major || defaultStudentProfile.major,
          graduation_year: sProf?.graduation_year || cached.graduation_year || defaultStudentProfile.graduation_year,
          birth_date: sProf?.birth_date || cached.birth_date || defaultStudentProfile.birth_date,
          experience: sProf?.experience || cached.experience || defaultStudentProfile.experience,
          availability: sProf?.availability || cached.availability || defaultStudentProfile.availability,
          career_goals: sProf?.career_goals || cached.career_goals || defaultStudentProfile.career_goals,
          skills: (Array.isArray(sProf?.skills) && sProf.skills.length > 0) ? sProf.skills : (cached.skills?.length ? cached.skills : defaultStudentProfile.skills),
          foreign_languages: Array.isArray(sProf?.foreign_languages) ? sProf.foreign_languages : (cached.foreign_languages || defaultStudentProfile.foreign_languages),
          certifications: Array.isArray(sProf?.certifications) ? sProf.certifications : (cached.certifications || defaultStudentProfile.certifications),
          academic_achievements: sProf?.academic_achievements || cached.academic_achievements || defaultStudentProfile.academic_achievements,
          address: sProf?.address || cached.address || defaultStudentProfile.address,
          is_public: sProf?.is_public !== undefined ? sProf.is_public : (cached.is_public !== undefined ? cached.is_public : true)
        };
        saveLocalProfile(userId, merged);
        return merged;
      }
    } catch (err) {
      console.warn('Lỗi khi fetch profile từ Supabase, chuyển sang cache cục bộ:', err);
    }
  }

  // 2. Fallback: Lấy từ cache local storage hoặc dữ liệu mặc định
  return Object.keys(cached).length > 0 ? cached : { ...defaultStudentProfile, id: userId };
}

// ------------------------------------------------------------------------------
// 2. CẬP NHẬT HỒ SƠ SINH VIÊN (UPDATE PROFILES & STUDENT_PROFILES)
// ------------------------------------------------------------------------------
export async function updateStudentProfile(userId, updates) {
  if (!userId) throw new Error('Không tìm thấy mã người dùng để cập nhật.');

  // Luôn lưu vào local cache ngay lập tức để F5 không bao giờ bị mất
  const existingCached = getLocalProfile(userId) || {};
  const mergedPayload = { ...existingCached, ...updates };
  saveLocalProfile(userId, mergedPayload);

  if (isSupabaseConfigured && isUuid(userId)) {
    try {
      // 1. Cập nhật bảng profiles
      const profileFields = {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        cover_url: updates.cover_url,
        phone: updates.phone,
        bio: updates.bio,
        location: updates.location,
        updated_at: new Date().toISOString()
      };

      const { error: pErr } = await supabase
        .from('profiles')
        .update(profileFields)
        .eq('id', userId);

      if (pErr) console.warn('Lỗi update profiles:', pErr.message);

      // 2. Cập nhật bảng student_profiles
      const studentFields = {
        user_id: userId,
        university: updates.university,
        major: updates.major,
        graduation_year: updates.graduation_year,
        birth_date: updates.birth_date || null,
        experience: updates.experience,
        availability: updates.availability,
        career_goals: updates.career_goals,
        skills: updates.skills || [],
        foreign_languages: updates.foreign_languages || [],
        certifications: updates.certifications || [],
        academic_achievements: updates.academic_achievements,
        address: updates.address,
        is_public: updates.is_public !== undefined ? updates.is_public : true,
        updated_at: new Date().toISOString()
      };

      const { error: sErr } = await supabase
        .from('student_profiles')
        .upsert(studentFields, { onConflict: 'user_id' });

      if (sErr) console.warn('Lỗi upsert student_profiles:', sErr.message);

      return { success: true, data: mergedPayload };
    } catch (err) {
      console.error('Lỗi Supabase khi lưu hồ sơ:', err);
      return { success: true, data: mergedPayload, warning: err.message };
    }
  }

  return { success: true, data: mergedPayload };
}

// ------------------------------------------------------------------------------
// 3. QUẢN LÝ DỰ ÁN PORTFOLIO (CRUD STUDENT_PROJECTS)
// ------------------------------------------------------------------------------

// 3.1. Lấy danh sách dự án
export async function getStudentProjects(studentId) {
  if (!studentId) return defaultStudentProjects;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        saveLocalProjects(studentId, data);
        return data;
      }
    } catch (err) {
      console.warn('Lỗi fetch student_projects từ Supabase:', err);
    }
  }

  return getLocalProjects(studentId);
}

// 3.2. Thêm dự án mới vào Portfolio
export async function createStudentProject(studentId, projectData) {
  if (!studentId) throw new Error('Cần đăng nhập để thêm dự án Portfolio.');

  const newProj = {
    id: `proj_${Date.now()}`,
    student_id: studentId,
    title: projectData.title || 'Dự án mới',
    description: projectData.description || '',
    image_url: projectData.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
    role: projectData.role || 'Thành viên dự án',
    github_url: projectData.github_url || '',
    demo_url: projectData.demo_url || '',
    start_date: projectData.start_date || '',
    end_date: projectData.end_date || 'Hiện tại',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('student_projects')
        .insert([{
          student_id: studentId,
          title: newProj.title,
          description: newProj.description,
          image_url: newProj.image_url,
          technologies: newProj.technologies,
          role: newProj.role,
          github_url: newProj.github_url,
          demo_url: newProj.demo_url,
          start_date: newProj.start_date,
          end_date: newProj.end_date
        }])
        .select()
        .single();

      if (!error && data) {
        newProj.id = data.id;
      }
    } catch (err) {
      console.warn('Lỗi insert student_projects vào Supabase:', err);
    }
  }

  // Cập nhật persistent cache
  const existing = getLocalProjects(studentId);
  const updated = [newProj, ...existing];
  saveLocalProjects(studentId, updated);

  return newProj;
}

// 3.3. Cập nhật dự án Portfolio
export async function updateStudentProject(studentId, projectId, updates) {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('student_projects')
        .update({
          title: updates.title,
          description: updates.description,
          image_url: updates.image_url,
          technologies: updates.technologies,
          role: updates.role,
          github_url: updates.github_url,
          demo_url: updates.demo_url,
          start_date: updates.start_date,
          end_date: updates.end_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
    } catch (err) {
      console.warn('Lỗi update student_projects trên Supabase:', err);
    }
  }

  // Cập nhật local storage
  const existing = getLocalProjects(studentId);
  const updated = existing.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
  saveLocalProjects(studentId, updated);

  return updated.find((p) => p.id === projectId);
}

// 3.4. Xóa dự án Portfolio
export async function deleteStudentProject(studentId, projectId) {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('student_projects')
        .delete()
        .eq('id', projectId);
    } catch (err) {
      console.warn('Lỗi xóa student_projects trên Supabase:', err);
    }
  }

  const existing = getLocalProjects(studentId);
  const updated = existing.filter((p) => p.id !== projectId);
  saveLocalProjects(studentId, updated);

  return true;
}

// ------------------------------------------------------------------------------
// 4. TẢI ẢNH (AVATAR / COVER / DỰ ÁN) LÊN SUPABASE STORAGE (BUCKET 'portfolios')
// ------------------------------------------------------------------------------
export async function uploadPortfolioImage(file, userId, folder = 'avatars') {
  if (!file) throw new Error('Vui lòng chọn file hình ảnh.');

  // Validate định dạng ảnh
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Định dạng ảnh không hợp lệ. Vui lòng tải lên JPG, PNG, WEBP hoặc GIF.');
  }

  // Validate dung lượng <= 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Dung lượng hình ảnh vượt quá giới hạn 10MB.');
  }

  // 1. Upload lên Supabase Storage nếu đã cấu hình
  if (isSupabaseConfigured && userId) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${userId}/${folder}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('portfolios')
          .getPublicUrl(fileName);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Lỗi upload ảnh lên Supabase Storage, chuyển sang Base64 DataURL:', err);
    }
  }

  // 2. Fallback: Đọc file sang Base64 Data URL để hiển thị ngay tức thì
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(new Error('Lỗi khi đọc file ảnh: ' + err.message));
    reader.readAsDataURL(file);
  });
}
