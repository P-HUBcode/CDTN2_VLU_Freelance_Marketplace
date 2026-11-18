import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Search,
  Layers,
  FileCheck2,
  Briefcase,
  Wallet,
  Building2,
  User,
  Plus,
  MessageSquare,
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToUserNotifications
} from '../../lib/notificationService';

export default function Topbar({
  currentView,
  setCurrentView,
  jobsCount = 0,
  freelanceCount = 0,
  unreadMessagesCount = 0,
  appliedCount = 0,
  activeProjectsCount = 0,
  employerApplicantsCount = 0,
  employerJobsCount = 0,
  onOpenPostJob,
  onOpenCreateService,
  onOpenAuth,
  onOpenEmailPreview,
  onSearchQuery,
  isChatBoxOpen = false,
  isChatMinimized = false,
  onToggleChatBox
}) {
  const { user, profile, role, setRole, isAuthenticated, signOut, loginAsDemo } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quản lý trạng thái hover mượt mà cho các menu trượt xuống từ trên
  const [hoveredMenu, setHoveredMenu] = useState(null); // 'jobs_mega' | 'my_work' | 'employer_work' | null
  const hoverTimeoutRef = useRef(null);

  const handleMenuEnter = (menuId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredMenu(menuId);
  };

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 180);
  };

  // 1. Load Notifications từ Backend Server & Supabase
  const loadUserNotifications = async () => {
    const userIdentifier = user || {
      id: profile?.id || 'demo_student',
      email: profile?.email || user?.email || (role === 'employer' ? 'employer.a@test.vn' : 'student.a@test.vn'),
      name: profile?.full_name || 'Nguyễn Minh Anh'
    };

    try {
      const [list, count] = await Promise.all([
        getNotifications(userIdentifier),
        getUnreadNotificationCount(userIdentifier)
      ]);
      setNotifications(list || []);
      setUnreadCount(count || 0);
    } catch (err) {
      console.warn('Lỗi load notifications:', err);
    }
  };

  useEffect(() => {
    loadUserNotifications();

    const userIdentifier = user || {
      id: profile?.id || 'demo_student',
      email: profile?.email || user?.email || (role === 'employer' ? 'employer.a@test.vn' : 'student.a@test.vn')
    };

    // Đăng ký nhận Realtime qua BroadcastChannel & Supabase
    const sub = subscribeToUserNotifications(userIdentifier.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Polling định kỳ mỗi 4 giây để đồng bộ tức thì thông báo khi trình duyệt khác thao tác
    const timer = setInterval(() => {
      loadUserNotifications();
    }, 4000);

    return () => {
      sub.unsubscribe();
      clearInterval(timer);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [user?.id, profile?.id, role]);

  // Đánh dấu 1 thông báo là đã đọc
  const handleItemClick = async (item) => {
    if (!item.isRead) {
      await markNotificationAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true, unread: false } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setShowNotifications(false);

    // Điều hướng theo ngữ cảnh
    if (item.type === 'new_project' || item.type === 'project_delivery' || item.type === 'project_completed' || item.relatedProjectId) {
      setCurrentView('my-projects');
    } else if (item.type === 'new_application' || role === 'employer') {
      setCurrentView('employer-dashboard');
    } else if (item.type === 'application_status_changed' || role === 'student') {
      setCurrentView('applied');
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllRead = async () => {
    const userIdentifier = user || {
      id: profile?.id || 'demo_student',
      email: profile?.email || user?.email || (role === 'employer' ? 'employer.a@test.vn' : 'student.a@test.vn')
    };
    try {
      await markAllNotificationsAsRead(userIdentifier);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, unread: false })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Lỗi mark all read:', e);
    }
  };

  // Click vào mục trong Mega Menu Tìm Việc
  const handleMegaItemClick = (keyword) => {
    setHoveredMenu(null);
    if (onSearchQuery) {
      onSearchQuery(keyword);
    }
    setCurrentView('marketplace');
  };

  // Click vào mục trong Mega Menu Thuê Freelance
  const handleFreelanceMegaClick = (keyword) => {
    setHoveredMenu(null);
    if (onSearchQuery) {
      onSearchQuery(keyword);
    }
    setCurrentView('freelance');
  };

  const rawName = profile?.full_name || user?.user_metadata?.full_name;
  const isNameAdmin = rawName && (rawName.includes('Admin') || rawName.includes('Quản trị viên'));
  const displayName = (!isNameAdmin && rawName) || (
    role === 'employer' ? 'Chị Mai - HR' : 'Nguyễn Minh Anh'
  );
  const displayAvatar = (!isNameAdmin && profile?.avatar_url) || (role === 'employer'
    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const displayRoleLabel = role === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên';

  // Helper icon thông báo
  const getNotificationIcon = (type, title) => {
    if (type === 'new_project' || title?.includes('thuê') || title?.includes('Dự án')) {
      return { icon: Briefcase, color: 'text-amber-600 bg-amber-50' };
    }
    if (type === 'project_completed' || title?.includes('nghiệm thu') || title?.includes('giải ngân')) {
      return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' };
    }
    if (type === 'project_delivery' || title?.includes('bàn giao')) {
      return { icon: Clock, color: 'text-indigo-600 bg-indigo-50' };
    }
    if (type === 'new_application') {
      return { icon: Briefcase, color: 'text-blue-600 bg-blue-50' };
    }
    if (title?.includes('phỏng vấn')) {
      return { icon: Calendar, color: 'text-purple-600 bg-purple-50' };
    }
    if (title?.includes('trúng tuyển') || title?.includes('nhận việc')) {
      return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' };
    }
    if (title?.includes('Từ chối') || title?.includes('kết quả')) {
      return { icon: XCircle, color: 'text-rose-600 bg-rose-50' };
    }
    return { icon: Briefcase, color: 'text-blue-600 bg-blue-50' };
  };

  const isMyWorkActive = ['applied', 'my-projects', 'wallet'].includes(currentView);
  const totalMyWorkCount = (appliedCount || 0) + (activeProjectsCount || 0);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
      {/* 1. BRAND LOGO (BÊN TRÁI) */}
      <div className="flex items-center gap-3 shrink-0 mr-3 lg:mr-6">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Trang chủ StudentHub"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
              Student<span className="text-blue-600">Hub</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 block tracking-wider">
              Find work. Build skills.
            </span>
          </div>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG CHÍNH VỚI DROPDOWN VÀ MEGA-MENU TRƯỢT TỪ TRÊN XUỐNG */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 flex-1 relative h-full">
        {/* Nút 1: Trang chủ / Dashboard */}
        <button
          onClick={() => setCurrentView(role === 'employer' ? 'employer-dashboard' : 'dashboard')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            currentView === 'dashboard' || (role === 'employer' && currentView === 'employer-dashboard')
              ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span>{role === 'employer' ? 'Tuyển dụng (Kanban)' : 'Trang chủ'}</span>
          {role === 'employer' && employerApplicantsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
              {employerApplicantsCount}
            </span>
          )}
        </button>

        {/* Nút 2: TÌM VIỆC LÀM (VỚI MEGA-MENU TRƯỢT TỪ TRÊN XUỐNG GIỐNG NHƯ ẢNH) */}
        <div
          className="relative h-full flex items-center group"
          onMouseEnter={() => handleMenuEnter('jobs_mega')}
          onMouseLeave={handleMenuLeave}
        >
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentView === 'marketplace'
                ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>Tìm Việc Làm</span>
            {jobsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                {jobsCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:rotate-180 group-hover:text-blue-600 ${
              hoveredMenu === 'jobs_mega' ? 'rotate-180 text-blue-600' : ''
            }`} />
          </button>

          {/* MEGA MENU: HIỆN TỪ TỪ TỪ TRÊN XUỐNG GIỐNG HỆT HÌNH ẢNH MẪU */}
          <div
            className={`fixed top-16 left-0 right-0 max-w-6xl mx-auto px-4 z-50 transform origin-top transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:visible ${
              hoveredMenu === 'jobs_mega'
                ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                : 'opacity-0 -translate-y-3 pointer-events-none invisible'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
              {/* Dải gradient trang trí trên đầu giống ảnh */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                {/* CỘT 1: VIỆC LÀM SINH VIÊN & DOANH NGHIỆP */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-[#0056b3] uppercase tracking-wide pb-1.5 border-b-2 border-blue-500 inline-block mb-3 text-[13px]">
                      VIỆC LÀM SINH VIÊN
                    </h4>
                    <ul className="space-y-2 font-medium text-slate-700">
                      <li
                        onClick={() => handleMegaItemClick('mới nhất')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center justify-between"
                      >
                        <span>Việc làm mới nhất hôm nay</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-bold">Mới</span>
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('part time')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center justify-between"
                      >
                        <span>Việc làm Part-time / Theo ca</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-bold">Hot</span>
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('thực tập')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                      >
                        Thực tập sinh (Internship 2026)
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('remote')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                      >
                        Việc làm Remote / Làm từ xa
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('linh hoạt')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                      >
                        Việc làm linh hoạt theo ca học
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('freelance')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition text-blue-700 font-semibold"
                      >
                        Việc có ký quỹ Escrow bảo đảm 🛡️
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="font-extrabold text-[#0056b3] uppercase tracking-wide pb-1.5 border-b-2 border-blue-500 inline-block mb-3 text-[13px]">
                      DOANH NGHIỆP
                    </h4>
                    <ul className="space-y-2 font-medium text-slate-700">
                      <li
                        onClick={() => handleMegaItemClick('FPT')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                      >
                        Danh sách Top công ty tuyển dụng
                      </li>
                      <li
                        onClick={() => handleMegaItemClick('xác thực')}
                        className="hover:text-blue-600 hover:font-bold cursor-pointer transition text-emerald-700"
                      >
                        Doanh nghiệp uy tín đã xác thực ✓
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CỘT 2: VIỆC LÀM PHỔ BIẾN CHO SINH VIÊN */}
                <div>
                  <h4 className="font-extrabold text-[#0056b3] uppercase tracking-wide pb-1.5 border-b-2 border-blue-500 inline-block mb-3 text-[13px]">
                    VIỆC LÀM PHỔ BIẾN
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleMegaItemClick('React')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Lập trình Web & Mobile App
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Thiết kế')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Đồ họa & UI/UX Figma
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Content')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Content Marketing & Viết bài PR
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Gia sư')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Gia sư & Dạy kèm trực tuyến
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Video')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Video Editor & TikTok Creator
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Dịch thuật')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Dịch thuật Anh - Hàn - Nhật
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Trợ lý')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Trợ lý nghiên cứu & Nhập liệu
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Data')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Data Analyst & Báo cáo số liệu
                    </li>
                  </ul>
                </div>

                {/* CỘT 3: VIỆC LÀM THEO KHU VỰC */}
                <div>
                  <h4 className="font-extrabold text-[#0056b3] uppercase tracking-wide pb-1.5 border-b-2 border-blue-500 inline-block mb-3 text-[13px]">
                    VIỆC THEO KHU VỰC
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleMegaItemClick('TPHCM')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại TP. Hồ Chí Minh</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Hà Nội')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại Hà Nội</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Bình Dương')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại Bình Dương</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Đà Nẵng')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại Đà Nẵng</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Đồng Nai')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại Đồng Nai</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Cần Thơ')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Việc làm tại Cần Thơ</span>
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Online')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition text-indigo-700 font-semibold"
                    >
                      🌐 Việc làm Toàn quốc (100% Online)
                    </li>
                  </ul>
                </div>

                {/* CỘT 4: NGÀNH NGHỀ PHỔ BIẾN */}
                <div>
                  <h4 className="font-extrabold text-[#0056b3] uppercase tracking-wide pb-1.5 border-b-2 border-blue-500 inline-block mb-3 text-[13px]">
                    NGÀNH NGHỀ PHỔ BIẾN
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleMegaItemClick('CNTT')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Công nghệ thông tin / Phần mềm
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Thiết kế')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế & Sáng tạo đa phương tiện
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Marketing')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Marketing / Truyền thông & Sự kiện
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Kế toán')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Kế toán / Kiểm toán / Tài chính
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Nhân sự')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Nhân sự / Hành chính / Tuyển dụng
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Bán hàng')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Bán hàng / Thu ngân / Dịch vụ F&B
                    </li>
                    <li
                      onClick={() => handleMegaItemClick('Luật')}
                      className="hover:text-blue-600 hover:font-bold cursor-pointer transition"
                    >
                      Luật / Pháp lý / Biên dịch viên
                    </li>
                  </ul>
                </div>
              </div>

              {/* Banner chân mega menu */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mọi tin tuyển dụng trên StudentHub đều được kiểm duyệt xác minh danh tính doanh nghiệp.</span>
                </div>
                <button
                  onClick={() => {
                    setHoveredMenu(null);
                    setCurrentView('marketplace');
                  }}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Xem tất cả việc làm <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Nút 3: THUÊ FREELANCE (VỚI MEGA-MENU TRƯỢT TỪ TRÊN XUỐNG) */}
        <div
          className="relative h-full flex items-center group"
          onMouseEnter={() => handleMenuEnter('freelance_mega')}
          onMouseLeave={handleMenuLeave}
        >
          <button
            onClick={() => setCurrentView('freelance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              currentView === 'freelance'
                ? 'bg-amber-50 text-amber-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Thuê freelance</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
              Hot
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:rotate-180 group-hover:text-amber-600 ${
              hoveredMenu === 'freelance_mega' ? 'rotate-180 text-amber-600' : ''
            }`} />
          </button>

          {/* MEGA MENU THUÊ FREELANCE: HIỆN TỪ TỪ TỪ TRÊN XUỐNG */}
          <div
            className={`fixed top-16 left-0 right-0 max-w-6xl mx-auto px-4 z-50 transform origin-top transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:visible ${
              hoveredMenu === 'freelance_mega'
                ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                : 'opacity-0 -translate-y-3 pointer-events-none invisible'
            }`}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
              {/* Dải gradient trang trí trên đầu */}
              <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                {/* CỘT 1: THIẾT KẾ & ĐỒ HỌA */}
                <div>
                  <h4 className="font-extrabold text-[#d97706] uppercase tracking-wide pb-1.5 border-b-2 border-amber-500 inline-block mb-3 text-[13px]">
                    THIẾT KẾ & ĐỒ HỌA
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleFreelanceMegaClick('Canva')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition flex items-center justify-between"
                    >
                      <span>Thiết kế Banner & Social Canva</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-bold">Hot</span>
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Figma')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Giao diện UI/UX Figma
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Logo')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Logo & Bộ nhận diện
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Slide')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Slide thuyết trình / Pitch Deck
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Poster')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Poster, Standee & Menu F&B
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Vẽ')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Vẽ minh họa chibi & Typography
                    </li>
                  </ul>
                </div>

                {/* CỘT 2: VIDEO, MEDIA & NỘI DUNG */}
                <div>
                  <h4 className="font-extrabold text-[#d97706] uppercase tracking-wide pb-1.5 border-b-2 border-amber-500 inline-block mb-3 text-[13px]">
                    VIDEO & NỘI DUNG
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleFreelanceMegaClick('TikTok')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition flex items-center justify-between"
                    >
                      <span>Edit Video ngắn TikTok & Reels</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-bold">Trending</span>
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('SEO')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Viết bài chuẩn SEO & Bài PR Báo
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Content')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Xây dựng Content Fanpage & Threads
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Voice')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thu âm giọng đọc lồng tiếng (Voice Over)
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Chụp ảnh')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Chụp ảnh sản phẩm & Retouch Photoshop
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Phụ đề')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Làm phụ đề Subtitle & Intro YouTube
                    </li>
                  </ul>
                </div>

                {/* CỘT 3: CÔNG NGHỆ & DỮ LIỆU */}
                <div>
                  <h4 className="font-extrabold text-[#d97706] uppercase tracking-wide pb-1.5 border-b-2 border-amber-500 inline-block mb-3 text-[13px]">
                    CÔNG NGHỆ & DỮ LIỆU
                  </h4>
                  <ul className="space-y-2 font-medium text-slate-700">
                    <li
                      onClick={() => handleFreelanceMegaClick('Web')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Lập trình Website Frontend (ReactJS/NextJS)
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Landing')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Thiết kế Landing Page bán hàng tốc độ cao
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Excel')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Tự động hóa Excel, Google Sheet & Dashboard
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Chatbot')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition text-indigo-700 font-semibold"
                    >
                      Cài đặt Chatbot AI tự động tư vấn KH
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('Test')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Kiểm thử phần mềm QA/QC & Fix bug
                    </li>
                    <li
                      onClick={() => handleFreelanceMegaClick('WordPress')}
                      className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                    >
                      Quản trị website & đăng bài WordPress
                    </li>
                  </ul>
                </div>

                {/* CỘT 4: GIA SƯ, DỊCH THUẬT & TRỢ LÝ */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-[#d97706] uppercase tracking-wide pb-1.5 border-b-2 border-amber-500 inline-block mb-3 text-[13px]">
                      DỊCH THUẬT & GIA SƯ
                    </h4>
                    <ul className="space-y-2 font-medium text-slate-700">
                      <li
                        onClick={() => handleFreelanceMegaClick('Dịch')}
                        className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                      >
                        Dịch thuật tài liệu Anh, Hàn, Nhật, Trung
                      </li>
                      <li
                        onClick={() => handleFreelanceMegaClick('Gia sư')}
                        className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                      >
                        Gia sư tiếng Anh & Dạy kèm 1-1 online
                      </li>
                      <li
                        onClick={() => handleFreelanceMegaClick('Nhập liệu')}
                        className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                      >
                        Nhập liệu số liệu & Đánh máy văn bản
                      </li>
                      <li
                        onClick={() => handleFreelanceMegaClick('Trợ lý')}
                        className="hover:text-amber-600 hover:font-bold cursor-pointer transition"
                      >
                        Trợ lý ảo từ xa (Virtual Assistant) theo giờ
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Bảo vệ quyền lợi Escrow 100%</span>
                    </div>
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      Tiền thuê được sàn tạm giữ an toàn. Chỉ giải ngân khi bạn hài lòng với sản phẩm bàn giao!
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner chân mega menu */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bạn là sinh viên có kỹ năng? Hãy đăng dịch vụ để tiếp cận hàng trăm khách hàng mỗi ngày!</span>
                </div>
                <div className="flex items-center gap-3">
                  {onOpenCreateService && (
                    <button
                      onClick={() => {
                        setHoveredMenu(null);
                        onOpenCreateService();
                      }}
                      className="font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition"
                    >
                      + Tạo gói dịch vụ của bạn
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setHoveredMenu(null);
                      setCurrentView('freelance');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Xem tất cả dịch vụ <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nút 4: GỘP "VIỆC ĐÃ ỨNG TUYỂN", "DỰ ÁN & TIẾN ĐỘ", "THU NHẬP" THÀNH "CÔNG VIỆC CỦA TÔI" */}
        {role !== 'employer' ? (
          <div
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMenuEnter('my_work')}
            onMouseLeave={handleMenuLeave}
          >
            <button
              onClick={() => setCurrentView('applied')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isMyWorkActive
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Công việc của tôi</span>

              {totalMyWorkCount > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                  {totalMyWorkCount}
                </span>
              )}

              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:rotate-180 group-hover:text-blue-600 ${
                hoveredMenu === 'my_work' ? 'rotate-180 text-blue-600' : ''
              }`} />
            </button>

            {/* DROPDOWN MENU "CÔNG VIỆC CỦA TÔI" - HIỆN TỪ TỪ TỪ TRÊN XUỐNG */}
            <div
              className={`absolute top-14 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 transform origin-top transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:visible group-hover:scale-100 ${
                hoveredMenu === 'my_work'
                  ? 'opacity-100 translate-y-0 pointer-events-auto visible scale-100'
                  : 'opacity-0 -translate-y-2 pointer-events-none invisible scale-95'
              }`}
            >
              <div className="p-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">Không Gian Công Việc Sinh Viên</p>
                <p className="text-[11px] text-slate-400">Theo dõi tiến độ, hồ sơ và thu nhập cá nhân</p>
              </div>

              <div className="space-y-1">
                {/* 1. Việc đã ứng tuyển */}
                <div
                  onClick={() => {
                    setCurrentView('applied');
                    setHoveredMenu(null);
                  }}
                  className={`p-2.5 rounded-xl transition flex items-center gap-3 cursor-pointer ${
                    currentView === 'applied' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Việc đã ứng tuyển</span>
                      {appliedCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                          {appliedCount} đơn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Hồ sơ đã nộp & phản hồi từ NTD</p>
                  </div>
                </div>

                {/* 2. Dự án & Tiến độ */}
                <div
                  onClick={() => {
                    setCurrentView('my-projects');
                    setHoveredMenu(null);
                  }}
                  className={`p-2.5 rounded-xl transition flex items-center gap-3 cursor-pointer ${
                    currentView === 'my-projects' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Dự án & Tiến độ</span>
                      {activeProjectsCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                          {activeProjectsCount} dự án
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Quản lý task, milestone & nghiệm thu</p>
                  </div>
                </div>

                {/* 3. Thu nhập & Ví */}
                <div
                  onClick={() => {
                    setCurrentView('wallet');
                    setHoveredMenu(null);
                  }}
                  className={`p-2.5 rounded-xl transition flex items-center gap-3 cursor-pointer ${
                    currentView === 'wallet' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Thu nhập & Ví tiền</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                        Escrow 🛡️
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">Số dư, tạm giữ bảo đảm & rút tiền</p>
                  </div>
                </div>
              </div>

              {/* Nút xem hộp thư email đã gửi */}
              {onOpenEmailPreview && (
                <div className="pt-2 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setHoveredMenu(null);
                      onOpenEmailPreview();
                    }}
                    className="w-full p-2 text-left rounded-xl hover:bg-slate-50 transition flex items-center gap-2 text-xs text-blue-700 font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Xem email thông báo ứng tuyển (Gmail)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Nút với Nhà tuyển dụng: Dự án & Ngân sách */
          <div
            className="relative h-full flex items-center group"
            onMouseEnter={() => handleMenuEnter('employer_work')}
            onMouseLeave={handleMenuLeave}
          >
            <button
              onClick={() => setCurrentView('my-projects')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                currentView === 'my-projects' || currentView === 'wallet'
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Dự án & Ngân sách</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:rotate-180 group-hover:text-blue-600 ${
                hoveredMenu === 'employer_work' ? 'rotate-180 text-blue-600' : ''
              }`} />
            </button>

            <div
              className={`absolute top-14 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 transform origin-top transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:visible group-hover:scale-100 ${
                hoveredMenu === 'employer_work'
                  ? 'opacity-100 translate-y-0 pointer-events-auto visible scale-100'
                  : 'opacity-0 -translate-y-2 pointer-events-none invisible scale-95'
              }`}
            >
              <div
                onClick={() => {
                  setCurrentView('my-projects');
                  setHoveredMenu(null);
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-2.5 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">Dự án & Tiến độ</span>
                  <span className="text-[10px] text-slate-400">Kiểm tra bàn giao và nghiệm thu</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setCurrentView('wallet');
                  setHoveredMenu(null);
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-2.5 cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">Ngân sách & Escrow</span>
                  <span className="text-[10px] text-slate-400">Quản lý quỹ ký gửi thanh toán</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setCurrentView('company-profile');
                  setHoveredMenu(null);
                }}
                className="p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center gap-2.5 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">Hồ sơ Doanh nghiệp</span>
                  <span className="text-[10px] text-slate-400">Cập nhật thương hiệu & tin đăng</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 3. NHÓM HÀNH ĐỘNG BÊN PHẢI (ACTION BUTTONS + EMAIL + CHAT + THÔNG BÁO + PROFILE) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* Nút hành động chính: Đăng việc (Employer) hoặc Tạo dịch vụ (Student) */}
        {role === 'employer' ? (
          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            title="Đăng tin tuyển dụng việc làm mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng việc</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateService}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all active:scale-95"
            title="Tạo gói dịch vụ kỹ năng của bạn (Freelance)"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Tạo dịch vụ</span>
          </button>
        )}

        {/* Nút xem Hộp thư thông báo Email (Nodemailer status) */}
        {onOpenEmailPreview && (
          <button
            onClick={onOpenEmailPreview}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
            title="Hộp thư thông báo ứng tuyển (Gmail)"
          >
            <Mail className="w-5 h-5" />
          </button>
        )}

        {/* Nút bật/tắt Chat Box */}
        <button
          data-chat-toggle="true"
          onClick={() => {
            if (onToggleChatBox) onToggleChatBox();
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
          className={`relative p-2 rounded-xl transition ${
            isChatBoxOpen && !isChatMinimized
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Tin nhắn (Chat Box)"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-blue-600 text-[10px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
            </span>
          )}
        </button>

        {/* Quả chuông Thông báo (Dropdown) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-[10px] font-extrabold text-white rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Thông báo</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                    <p>Bạn chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const { icon: Icon, color } = getNotificationIcon(item.type, item.title);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-2.5 rounded-xl transition flex gap-3 cursor-pointer ${
                          item.unread || !item.isRead ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.message || item.desc}
                          </p>
                        </div>
                        {!item.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* 4. USER PROFILE & DROPDOWN */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 transition group"
            >
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition truncate max-w-[120px]">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{displayRoleLabel}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150 space-y-1">
                {/* Header info */}
                <div className="p-3 bg-slate-50 rounded-xl mb-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || (role === 'employer' ? 'employer.a@test.vn' : 'student.a@test.vn')}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                    {displayRoleLabel}
                  </span>
                </div>

                {/* Profile link */}
                <button
                  onClick={() => {
                    setCurrentView(role === 'employer' ? 'company-profile' : 'profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{role === 'employer' ? 'Hồ sơ Doanh nghiệp' : 'Hồ sơ cá nhân & CV'}</span>
                </button>

                {/* Hộp thư email preview */}
                {onOpenEmailPreview && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenEmailPreview();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition text-left"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Hộp thư thông báo ứng tuyển</span>
                  </button>
                )}

                {/* Chuyển nhanh vai trò Demo */}
                <div className="pt-1 mt-1 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Thử nghiệm vai trò
                  </p>
                  <button
                    onClick={() => {
                      loginAsDemo(role === 'employer' ? 'student' : 'employer');
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition text-left"
                  >
                    {role === 'employer' ? (
                      <>
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>Chuyển sang Sinh viên Demo</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Chuyển sang Nhà tuyển dụng</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Logout */}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      signOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
