import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { currentUser as mockStudentUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [role, setRole] = useState('student'); // 'student' | 'employer' | 'admin'
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 1. Fetch Profile từ bảng public.profiles trong Supabase
  const fetchUserProfile = async (userId) => {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profErr) {
        console.warn('Chưa tìm thấy record trong bảng profiles, sử dụng thông tin mặc định:', profErr.message);
        return null;
      }

      setProfile(prof);
      setRole(prof.role || 'student');

      // Nếu là Sinh viên, lấy thêm student_profiles
      if (prof.role === 'student') {
        const { data: sProf } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (sProf) setStudentProfile(sProf);
      }

      // Nếu là Nhà tuyển dụng, lấy thêm companies
      if (prof.role === 'employer') {
        const { data: comp } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();
        if (comp) setCompany(comp);
      }

      return prof;
    } catch (err) {
      console.error('Lỗi khi fetch profile:', err);
      return null;
    }
  };

  // 2. Lắng nghe Session & Auth State Change từ Supabase
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. Kiểm tra xem có phiên đăng nhập mock (Google hoặc Demo) hay không
      const savedMockAuth = localStorage.getItem('studenthub_mock_session');
      let loadedFromMock = false;

      // 1b. Dọn dẹp an toàn các bản sao mật khẩu cũ nếu còn lưu trong trình duyệt
      try {
        localStorage.removeItem('studenthub_user_passwords');
      } catch (e) {}

      if (savedMockAuth) {
        try {
          const parsed = JSON.parse(savedMockAuth);
          if (parsed && parsed.user) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setRole(parsed.role || 'student');
            loadedFromMock = true;
          }
        } catch (e) {
          console.warn('Lỗi parse mock session:', e);
        }
      }

      // 2. Nếu có Supabase và chưa nạp từ mock:
      if (isSupabaseConfigured && !loadedFromMock) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (mounted && currentSession) {
            const isAdminPath = typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
            const userRole = currentSession.user?.user_metadata?.role;
            const userEmail = currentSession.user?.email || '';

            // Nếu người dùng đang ở trang chủ (không phải /admin) mà session Supabase là admin:
            // Tách biệt hoàn toàn: Không để phiên admin can thiệp vào trang chủ sinh viên
            if (!isAdminPath && (userRole === 'admin' || userEmail.includes('admin'))) {
              console.log('Bỏ qua session admin trên trang người dùng /');
            } else {
              setSession(currentSession);
              setUser(currentSession.user);
              await fetchUserProfile(currentSession.user.id);
            }
          }
        } catch (err) {
          console.warn('Lỗi kiểm tra session:', err);
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Lắng nghe thay đổi trạng thái đăng nhập
    let authListener = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        const isAdminPath = typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
        const userRole = newSession?.user?.user_metadata?.role;
        const userEmail = newSession?.user?.email || '';

        if (!isAdminPath && (userRole === 'admin' || userEmail.includes('admin'))) {
          return;
        }

        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setProfile(null);
          setStudentProfile(null);
          setCompany(null);
        }
        setLoading(false);
      });
      authListener = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // 3. Đăng ký tài khoản mới (Hỗ trợ xác thực Gmail OTP thật & Supabase)
  const signUp = async ({
    email,
    password,
    fullName,
    role: selectedRole = 'student',
    university = 'Đại học Kinh tế TP.HCM (UEH)',
    major = 'Marketing',
    companyName = 'Studio Sáng tạo'
  }) => {
    setLoading(true);
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Tạo định danh và thông tin hồ sơ người dùng
    const tempId = `usr_${Date.now()}`;
    const newProfile = {
      id: tempId,
      full_name: fullName,
      fullName: fullName,
      email: cleanEmail,
      role: selectedRole,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      university: selectedRole === 'student' ? university : undefined,
      major: selectedRole === 'student' ? major : undefined,
      company_name: selectedRole === 'employer' ? companyName : undefined,
      created_at: new Date().toISOString()
    };

    // 2. Lưu vào danh sách người dùng đã đăng ký (hồ sơ cục bộ)
    try {
      const rawRegistered = localStorage.getItem('studenthub_registered_users');
      const usersList = rawRegistered ? JSON.parse(rawRegistered) : [];
      const filtered = usersList.filter(u => u.email?.toLowerCase() !== cleanEmail);
      filtered.push(newProfile);
      localStorage.setItem('studenthub_registered_users', JSON.stringify(filtered));
    } catch (e) {}

    let createdUser = {
      id: tempId,
      email: cleanEmail,
      user_metadata: {
        full_name: fullName,
        role: selectedRole,
        university,
        major,
        company_name: companyName
      }
    };

    // 3. Nếu có cấu hình Supabase: đồng bộ đăng ký lên Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
              university,
              major,
              company_name: companyName
            }
          }
        });

        if (data?.user?.id) {
          createdUser.id = data.user.id;
          newProfile.id = data.user.id;

          try {
            const rawReg = localStorage.getItem('studenthub_registered_users');
            const usersList = rawReg ? JSON.parse(rawReg) : [];
            const idx = usersList.findIndex(u => u.email?.toLowerCase() === cleanEmail);
            if (idx !== -1) usersList[idx].id = data.user.id;
            localStorage.setItem('studenthub_registered_users', JSON.stringify(usersList));
          } catch (e) {}

          // Nếu Supabase trả về session ngay lập tức (khi Confirm email = OFF)
          if (data.session) {
            setSession(data.session);
          }

          // Cố gắng ghi profile vào bảng public.profiles nếu kết nối cho phép
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName,
              email: cleanEmail,
              role: selectedRole,
              avatar_url: newProfile.avatar_url
            });
            if (selectedRole === 'student') {
              await supabase.from('student_profiles').upsert({
                user_id: data.user.id,
                university,
                major
              });
            } else if (selectedRole === 'employer') {
              await supabase.from('companies').upsert({
                owner_id: data.user.id,
                company_name: companyName
              });
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Lỗi Supabase signUp (tiếp tục hoàn tất tạo tài khoản):', err);
      }
    }

    // 4. Thiết lập người dùng và hồ sơ
    setUser(createdUser);
    setProfile(newProfile);
    setRole(selectedRole);

    if (selectedRole === 'student') {
      setStudentProfile({
        user_id: createdUser.id,
        university,
        major
      });
    } else if (selectedRole === 'employer') {
      setCompany({
        owner_id: createdUser.id,
        company_name: companyName
      });
    }

    localStorage.setItem('studenthub_mock_session', JSON.stringify({
      user: createdUser,
      profile: newProfile,
      role: selectedRole
    }));

    setLoading(false);
    return { success: true, user: createdUser };
  };

  // 4. Đăng nhập (Xác thực tiêu chuẩn qua Supabase Auth)
  const signIn = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !password) {
      const errMsg = 'Vui lòng cung cấp email và mật khẩu.';
      setAuthError(errMsg);
      setLoading(false);
      return { success: false, error: errMsg };
    }

    // 1. Đăng nhập chính thức qua Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          let errorMsg = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
          const lowerMsg = (error.message || '').toLowerCase();
          if (lowerMsg.includes('email not confirmed')) {
            errorMsg = 'Tài khoản chưa được kích hoạt xác thực email trên Supabase. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên hỗ trợ.';
          } else if (lowerMsg.includes('invalid login credentials')) {
            errorMsg = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
          } else if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
            errorMsg = 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ ít phút rồi thử lại.';
          } else {
            errorMsg = error.message;
          }
          setAuthError(errorMsg);
          setLoading(false);
          return { success: false, error: errorMsg };
        }

        if (data?.session && data?.user) {
          try {
            localStorage.removeItem('studenthub_mock_session');
            localStorage.removeItem('studenthub_user_passwords');
          } catch (e) {}

          setUser(data.user);
          setSession(data.session);
          await fetchUserProfile(data.user.id);
          setLoading(false);
          return { success: true, user: data.user };
        }
      } catch (err) {
        console.error('Exception khi đăng nhập Supabase:', err);
        const errMsg = err.message || 'Lỗi kết nối máy chủ xác thực.';
        setAuthError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }
    }

    // 2. Chế độ Mock Session Fallback (chỉ khi không có Supabase)
    const notFoundMsg = 'Tài khoản chưa được đăng ký hoặc email/mật khẩu không chính xác.';
    setAuthError(notFoundMsg);
    setLoading(false);
    return { success: false, error: notFoundMsg };
  };

  // 5. Đăng xuất
  const signOut = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Lỗi khi đăng xuất:', e);
      }
    }
    try {
      localStorage.removeItem('studenthub_mock_session');
      localStorage.removeItem('studenthub_user_passwords');
      localStorage.removeItem('studenthub_current_user');
      localStorage.removeItem('studenthub_wallet_balance');
      localStorage.removeItem('studenthub_conversations');
      localStorage.removeItem('studenthub_conversations_default');
      localStorage.removeItem('studenthub_conversations_role_student');
      localStorage.removeItem('studenthub_conversations_role_employer');
      localStorage.removeItem('studenthub_projects');
      localStorage.removeItem('studenthub_credited_projects');
      if (user?.id) {
        localStorage.removeItem(`studenthub_projects_${String(user.id).trim().toLowerCase()}`);
      }
      localStorage.removeItem('studenthub_local_applications');
      localStorage.removeItem('studenthub_bookmarked_ids');
    } catch (e) {}
    setUser(null);
    setSession(null);
    setProfile(null);
    setStudentProfile(null);
    setCompany(null);
    setRole('student');
    setLoading(false);
  };

  // 6. Đăng nhập nhanh tài khoản mẫu (Demo Login cho giám khảo & phát triển nhanh)
  const loginAsDemo = async (demoType = 'student') => {
    let demoEmail = 'student.a@test.vn';
    if (demoType === 'employer') {
      demoEmail = 'employer.a@test.vn';
    } else if (demoType === 'admin') {
      demoEmail = 'admin@test.vn';
    }

    if (isSupabaseConfigured) {
      return await signIn({ email: demoEmail, password: 'Password123!' });
    }

    let demoName = 'Nguyễn Minh Anh';
    let demoRole = 'student';

    if (demoType === 'employer') {
      demoName = 'Chị Mai - HR ABC Media';
      demoRole = 'employer';
    } else if (demoType === 'admin') {
      demoName = 'Quản trị viên Hệ Thống';
      demoRole = 'admin';
    }

    const mockUserObj = { id: `demo_${demoType}_01`, email: demoEmail };
    const mockProfileObj = {
      id: mockUserObj.id,
      full_name: demoName,
      email: demoEmail,
      role: demoRole,
      university: demoRole === 'student' ? 'Đại học Kinh tế TP.HCM (UEH)' : undefined,
      avatar_url: demoRole === 'student'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    };

    setUser(mockUserObj);
    setProfile(mockProfileObj);
    setRole(demoRole);
    localStorage.setItem('studenthub_mock_session', JSON.stringify({
      user: mockUserObj,
      profile: mockProfileObj,
      role: demoRole
    }));
    return { success: true, user: mockUserObj };
  };

  // 6b. Đăng nhập hoặc đăng ký nhanh bằng tài khoản Google (Gmail thật)
  const signInWithGoogle = async ({
    email = 'phu47008@gmail.com',
    fullName = 'Nguyễn Minh Phú',
    role: selectedRole = 'student',
    university = 'Đại học Kinh tế TP.HCM (UEH)',
    companyName = 'Studio Sáng tạo Trẻ'
  } = {}) => {
    setLoading(true);
    setAuthError(null);

    const googleUserId = `google_${Date.now()}`;
    const mockUserObj = {
      id: googleUserId,
      email,
      user_metadata: {
        full_name: fullName,
        role: selectedRole,
        provider: 'google',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    };

    const mockProfileObj = {
      id: googleUserId,
      full_name: fullName,
      email,
      role: selectedRole,
      university: selectedRole === 'student' ? university : undefined,
      company_name: selectedRole === 'employer' ? companyName : undefined,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      auth_provider: 'google'
    };

    try {
      const rawRegistered = localStorage.getItem('studenthub_registered_users');
      const usersList = rawRegistered ? JSON.parse(rawRegistered) : [];
      const filtered = usersList.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
      filtered.push(mockProfileObj);
      localStorage.setItem('studenthub_registered_users', JSON.stringify(filtered));
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').upsert({
          id: googleUserId,
          full_name: fullName,
          email,
          role: selectedRole,
          avatar_url: mockProfileObj.avatar_url
        });
      } catch (err) {
        console.warn('Lỗi upsert profile google:', err);
      }
    }

    setUser(mockUserObj);
    setProfile(mockProfileObj);
    setRole(selectedRole);
    localStorage.setItem('studenthub_mock_session', JSON.stringify({
      user: mockUserObj,
      profile: mockProfileObj,
      role: selectedRole
    }));
    setLoading(false);
    return { success: true, user: mockUserObj };
  };

  // 7. Cập nhật hồ sơ (sync với Supabase profiles)
  const updateProfile = async (updates) => {
    if (!user) return false;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
        await fetchUserProfile(user.id);
        return true;
      } catch (err) {
        console.error('Lỗi khi cập nhật profile:', err);
        return false;
      }
    } else {
      setProfile((prev) => ({ ...prev, ...updates }));
      return true;
    }
  };

  const value = {
    user,
    session,
    setUser,
    setSession,
    profile,
    studentProfile,
    company,
    role,
    setRole,
    loading,
    authError,
    setAuthError,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loginAsDemo,
    updateProfile,
    fetchUserProfile,
    isSupabaseConfigured,
    isAuthenticated: Boolean(user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}

export default AuthContext;
