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

  // 3. Đăng ký tài khoản mới (Supabase Auth + Metadata)
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

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
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

        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return { success: false, error: error.message };
        }

        // Tạo profile dự phòng nếu trigger DB chưa chạy
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: selectedRole,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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

          setUser(data.user);
          setRole(selectedRole);
          await fetchUserProfile(data.user.id);
        }

        setLoading(false);
        return { success: true, user: data.user };
      } catch (err) {
        setAuthError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    } else {
      // Mock SignUp khi chưa có Supabase key (hỗ trợ Gmail thật)
      const mockUserObj = {
        id: `mock_usr_${Date.now()}`,
        email,
        user_metadata: { full_name: fullName, role: selectedRole }
      };
      const mockProfileObj = {
        id: mockUserObj.id,
        full_name: fullName,
        email,
        role: selectedRole,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        university,
        major,
        company_name: companyName
      };

      try {
        const rawRegistered = localStorage.getItem('studenthub_registered_users');
        const usersList = rawRegistered ? JSON.parse(rawRegistered) : [];
        const filtered = usersList.filter(u => u.email.toLowerCase() !== email.toLowerCase());
        filtered.push(mockProfileObj);
        localStorage.setItem('studenthub_registered_users', JSON.stringify(filtered));
      } catch (e) {}

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
    }
  };

  // 4. Đăng nhập (Supabase Auth)
  const signIn = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setAuthError(error.message);
          setLoading(false);
          return { success: false, error: error.message };
        }

        setUser(data.user);
        setSession(data.session);
        await fetchUserProfile(data.user.id);

        setLoading(false);
        return { success: true, user: data.user };
      } catch (err) {
        setAuthError(err.message);
        setLoading(false);
        return { success: false, error: err.message };
      }
    } else {
      // Fallback demo login nếu chưa cấu hình key (hỗ trợ Gmail thật đã đăng ký)
      let demoRole = 'student';
      let demoName = 'Nguyễn Minh Anh';
      let demoUni = 'Đại học Kinh tế TP.HCM (UEH)';
      let demoCompany = 'Studio Sáng tạo';

      try {
        const rawRegistered = localStorage.getItem('studenthub_registered_users');
        const usersList = rawRegistered ? JSON.parse(rawRegistered) : [];
        const registered = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (registered) {
          demoRole = registered.role || 'student';
          demoName = registered.full_name || demoName;
          demoUni = registered.university || demoUni;
          demoCompany = registered.company_name || demoCompany;
        } else {
          if (email.includes('employer')) {
            demoRole = 'employer';
            demoName = 'Chị Mai - HR ABC Media';
          } else if (email.includes('phu') || email.includes('admin')) {
            demoName = 'Nguyễn Minh Phú';
          }
        }
      } catch (e) {}

      const mockUserObj = { id: `mock_${Date.now()}`, email };
      const mockProfileObj = {
        id: mockUserObj.id,
        full_name: demoName,
        email,
        role: demoRole,
        university: demoUni,
        company_name: demoCompany,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };

      setUser(mockUserObj);
      setProfile(mockProfileObj);
      setRole(demoRole);
      localStorage.setItem('studenthub_mock_session', JSON.stringify({
        user: mockUserObj,
        profile: mockProfileObj,
        role: demoRole
      }));
      setLoading(false);
      return { success: true, user: mockUserObj };
    }
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
    localStorage.removeItem('studenthub_mock_session');
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
