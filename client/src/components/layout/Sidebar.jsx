import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Layers,
  FileCheck2,
  Briefcase,
  MessageSquare,
  Wallet,
  User,
  LogOut,
  Sparkles,
  Building2,
  GraduationCap,
  ChevronDown,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  Check,
  Settings,
  Bell,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({
  currentView,
  setCurrentView,
  jobsCount = 0,
  freelanceCount = 0,
  unreadMessagesCount = 0,
  appliedCount = 0,
  activeProjectsCount = 0,
  employerApplicantsCount = 0,
  employerJobsCount = 0,
  adminPendingJobsCount = 0,
  onOpenPostJob,
  onOpenAuth,
  onOpenAdmin
}) {
  const { user, profile, role, setRole, isAuthenticated, signOut, loginAsDemo } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Student Navigation Links
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'marketplace',
      label: 'Tìm việc',
      icon: Search,
      badge: jobsCount > 0 ? String(jobsCount) : undefined
    },
    {
      id: 'freelance',
      label: 'Thuê dịch vụ sinh viên (Freelance)',
      icon: Layers,
      badge: freelanceCount > 0 ? String(freelanceCount) : 'Hot',
      badgeColor: 'amber'
    },
    { id: 'applied', label: 'Việc đã ứng tuyển', icon: FileCheck2, count: appliedCount },
    { id: 'my-projects', label: 'Dự án & Tiến độ bàn giao', icon: Briefcase, count: activeProjectsCount },
    { id: 'wallet', label: 'Thu nhập', icon: Wallet },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  // Employer Navigation Links
  const employerNavItems = [
    {
      id: 'employer-dashboard',
      label: 'Tuyển dụng (Kanban)',
      icon: LayoutDashboard,
      count: employerApplicantsCount
    },
    {
      id: 'marketplace',
      label: 'Xem tin tuyển dụng',
      icon: Search,
      badge: employerJobsCount > 0 ? String(employerJobsCount) : undefined
    },
    { id: 'company-profile', label: 'Hồ sơ Doanh nghiệp', icon: Building2 },
    {
      id: 'freelance',
      label: 'Thuê dịch vụ sinh viên (Freelance)',
      icon: Layers,
      badge: freelanceCount > 0 ? String(freelanceCount) : 'Hot',
      badgeColor: 'amber'
    },
    {
      id: 'my-projects',
      label: 'Dự án & Tiến độ bàn giao',
      icon: Briefcase,
      count: activeProjectsCount
    },
    { id: 'post-job', label: 'Đăng việc mới', icon: PlusCircle, isHighlight: true },
    { id: 'wallet', label: 'Ngân sách tuyển dụng', icon: Wallet },
  ];

  // Admin Navigation Links
  const adminNavItems = [
    {
      id: 'admin',
      label: 'Quản trị & Kiểm duyệt',
      icon: ShieldCheck,
      isHighlight: true,
      count: adminPendingJobsCount
    },
    {
      id: 'marketplace',
      label: 'Tất cả tin việc làm',
      icon: Search,
      badge: jobsCount > 0 ? String(jobsCount) : undefined
    },
    {
      id: 'employer-dashboard',
      label: 'Quản lý ứng viên',
      icon: LayoutDashboard,
      count: employerApplicantsCount
    },
    {
      id: 'applied',
      label: 'Toàn bộ đơn nộp',
      icon: FileCheck2,
      count: appliedCount
    }
  ];

  const navItems = role === 'employer' ? employerNavItems : role === 'admin' ? adminNavItems : studentNavItems;

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Nguyễn Minh Anh';
  const displayAvatar = profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const displaySubtext = role === 'employer' ? 'Nhà tuyển dụng' : role === 'admin' ? 'Super Admin' : (profile?.university || 'Sinh viên UEH');

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Về Trang chủ StudentHub"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
                Student<span className="text-blue-600">Hub</span>
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
              Find work. Build skills.
            </span>
          </div>
        </div>
      </div>

      {/* Role Switcher Pill */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition"
          >
            <div className="flex items-center gap-2">
              {role === 'student' ? (
                <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
              ) : role === 'employer' ? (
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
              )}
              <span>
                Chế độ: <strong>{role === 'student' ? 'Sinh viên' : role === 'employer' ? 'Nhà tuyển dụng' : 'Admin'}</strong>
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-dropdown p-1.5 z-40 space-y-1">
              <button
                onClick={() => {
                  setRole('student');
                  setCurrentView('dashboard');
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  role === 'student'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Sinh viên (Tìm việc & làm project)</span>
                </div>
                {role === 'student' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>

              <button
                onClick={() => {
                  setRole('employer');
                  setCurrentView('employer-dashboard');
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  role === 'employer'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Nhà tuyển dụng (Đăng việc & tuyển)</span>
                </div>
                {role === 'employer' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                onClick={() => {
                  setRole('admin');
                  if (onOpenAdmin) onOpenAdmin();
                  setShowRoleDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                  role === 'admin'
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>Quản trị viên (Super Admin)</span>
                </div>
                {role === 'admin' && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'post-job') {
                  if (onOpenPostJob) onOpenPostJob();
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.isNew && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md">
                    Hot
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor === 'amber'
                        ? 'bg-amber-100 text-amber-700 font-bold'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Student Escrow Trust Badge */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-blue-50/70 border border-blue-100">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Bảo vệ quyền lợi Sinh viên</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
          Ký quỹ 100% qua StudentHub Escrow. Nhận tiền đúng hẹn khi hoàn thành project.
        </p>
      </div>

      {/* User Footer Profile & Dropdown */}
      <div className="p-3 border-t border-slate-100 relative">
        {isAuthenticated ? (
          <div>
            <div
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                    {displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {displaySubtext}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {role === 'student' ? 'Đang tìm việc' : role === 'employer' ? 'Đang tuyển dụng' : 'Quản trị viên'}
                  </span>
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition ml-1" />
            </div>

            {/* Dropdown Options */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-2xl shadow-dropdown p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ cá nhân</span>
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => {
                      if (onOpenAdmin) onOpenAdmin();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-xl transition font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Bảng quản trị Admin</span>
                  </button>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => {
                    signOut();
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
