import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import {
  ShieldCheck,
  Users,
  Briefcase,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Lock,
  Unlock,
  ExternalLink,
  Building2,
  GraduationCap,
  RefreshCw,
  Clock,
  Sparkles,
  Newspaper,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Copy,
  Check,
  Calendar,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import {
  getAdminStats,
  getAllJobsForAdmin,
  updateJobStatusByAdmin,
  getAllUsersForAdmin,
  toggleUserActiveStatus,
  adminResetUserPassword,
  deleteUserByAdmin
} from '../lib/adminService';
import {
  getStoredArticles,
  saveArticle,
  deleteArticle,
  INITIAL_ARTICLES
} from '../lib/articleService';
import { useAuth } from '../contexts/AuthContext';
import ArticleDetailModal from '../components/common/ArticleDetailModal';

export default function AdminDashboardPage({ onNavigate }) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobs' | 'users' | 'articles'

  // Stat Cards state
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Jobs management state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobSearch, setJobSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Users management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Password Management state (Admin yêu cầu đặt lại mật khẩu)
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState(null);

  // Delete User state (Admin xóa vĩnh viễn tài khoản)
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Articles (CMS) state
  const [articles, setArticles] = useState([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'WIKI CAREER',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    author: 'Wiki Career StudentHub',
    summary: '',
    content: ''
  });

  // 1. Tải số liệu thống kê Admin
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Lỗi load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Tải danh sách tin tuyển dụng
  const loadJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const res = await getAllJobsForAdmin({
        status: jobStatusFilter,
        search: jobSearch
      });
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Lỗi load jobs admin:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [jobStatusFilter, jobSearch]);

  // 3. Tải danh sách người dùng
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await getAllUsersForAdmin({
        role: userRoleFilter,
        search: userSearch
      });
      setUsers(res.users || []);
    } catch (err) {
      console.error('Lỗi load users admin:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearch]);

  // 4. Tải danh sách bài viết cẩm nang CMS
  const loadArticles = useCallback(() => {
    const list = getStoredArticles();
    setArticles(list);
  }, []);

  useEffect(() => {
    loadStats();
    loadArticles();
  }, [loadStats, loadArticles]);

  useEffect(() => {
    if (activeTab === 'jobs' || activeTab === 'overview') loadJobs();
    if (activeTab === 'users' || activeTab === 'overview') loadUsers();
    if (activeTab === 'articles') loadArticles();
  }, [activeTab, loadJobs, loadUsers, loadArticles]);

  // Xử lý Admin duyệt / từ chối tin
  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      setActionLoadingId(jobId);
      await updateJobStatusByAdmin(jobId, newStatus);
      await loadJobs();
      await loadStats();
    } catch (err) {
      alert(`Thao tác thất bại: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xử lý Admin khóa / mở khóa tài khoản
  const handleToggleUser = async (userId, currentActive) => {
    const nextStatus = !currentActive;
    const confirmMsg = nextStatus
      ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?'
      : 'Bạn có chắc chắn muốn KHÓA tài khoản này? Người dùng sẽ không thể đăng nhập.';
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoadingId(userId);
      await toggleUserActiveStatus(userId, nextStatus);
      await loadUsers();
    } catch (err) {
      alert(`Cập nhật trạng thái người dùng thất bại: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xử lý Admin xóa vĩnh viễn tài khoản người dùng
  const handleConfirmDeleteUser = async (e) => {
    e.preventDefault();
    if (!deleteModalUser) return;

    if (deleteConfirmInput.trim().toLowerCase() !== deleteModalUser.email.trim().toLowerCase()) {
      alert('Email xác nhận không khớp với email tài khoản cần xóa.');
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await deleteUserByAdmin(deleteModalUser.id, deleteConfirmInput);
      alert(res.message || 'Đã xóa tài khoản và dọn dẹp dữ liệu thành công.');
      setDeleteModalUser(null);
      setDeleteConfirmInput('');
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(`Xóa tài khoản thất bại: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Xử lý đăng bài viết mới
  const handlePublishArticle = (e) => {
    e.preventDefault();
    if (!articleForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết.');
      return;
    }

    const updated = saveArticle(articleForm);
    setArticles(updated);
    setIsWriteModalOpen(false);
    setArticleForm({
      title: '',
      category: 'WIKI CAREER',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      author: 'Wiki Career StudentHub',
      summary: '',
      content: ''
    });
    alert('🎉 Bài viết đã được đăng thành công và hiển thị trực tiếp trên Trang chủ!');
  };

  // Xử lý xóa bài viết
  const handleDeleteArticle = (articleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi trang chủ?')) return;
    const updated = deleteArticle(articleId);
    setArticles(updated);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Đang mở (Published)</Badge>;
      case 'pending_approval':
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge variant="danger">Bị từ chối</Badge>;
      case 'closed':
        return <Badge variant="neutral">Đã đóng</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const pendingJobsCount = jobs.filter(j => j.status === 'pending_approval').length;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] pb-12">
      {/* ========================================================================= */}
      {/* THANH SIDEBAR ADMIN BÊN CẠNH (LEFT LATERAL SIDEBAR)                       */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-72 bg-slate-900 text-white rounded-3xl p-5 shrink-0 flex flex-col justify-between shadow-2xl border border-slate-800">
        <div className="space-y-6">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80 px-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>StudentHub</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 font-bold rounded-md border border-purple-500/30">
                  ADMIN
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Cổng Quản Trị Hệ Thống</p>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            {/* 1. Tổng quan */}
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Tổng quan & Chỉ số</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 2. Kiểm duyệt Tin đăng */}
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4" />
                <span>Kiểm duyệt Tin đăng</span>
              </div>
              {pendingJobsCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                  {pendingJobsCount}
                </span>
              )}
            </button>

            {/* 3. Quản lý Người dùng */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Quản lý Người dùng</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* 4. CMS: Đăng bài Cẩm nang & Tin tức */}
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                activeTab === 'articles'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Newspaper className="w-4 h-4 text-purple-400" />
                <span className="flex items-center gap-1.5">
                  <span>Cẩm nang & Tin tức</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">Mới</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400">({articles.length})</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Info & Logout */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Quản Trị Viên</p>
              <p className="text-[10px] text-slate-400 truncate">admin@studenthub.vn</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {onNavigate && (
              <button
                onClick={() => onNavigate('landing')}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[11px] font-semibold transition text-center"
              >
                Về Trang chủ
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm('Bạn có muốn đăng xuất khỏi phiên Quản trị viên?')) {
                  signOut();
                  if (onNavigate) onNavigate('landing');
                }
              }}
              className="px-2.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* VÙNG NỘI DUNG CHÍNH (RIGHT MAIN CONTENT AREA)                             */}
      {/* ========================================================================= */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Top bar header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Admin Portal</span>
              <span>/</span>
              <span className="font-bold text-slate-700 capitalize">{activeTab}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Tổng quan Chỉ số & Hoạt động Toàn sàn'}
              {activeTab === 'jobs' && 'Kiểm duyệt Tin Tuyển Dụng Doanh Nghiệp'}
              {activeTab === 'users' && 'Quản lý Tài Khoản Sinh Viên & Nhà Tuyển Dụng'}
              {activeTab === 'articles' && 'Cẩm Nang Nghề Nghiệp & Đăng Bài Lên Trang Chủ'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'articles' && (
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Viết bài mới</span>
              </button>
            )}

            <button
              onClick={() => {
                loadStats();
                if (activeTab === 'jobs' || activeTab === 'overview') loadJobs();
                if (activeTab === 'users' || activeTab === 'overview') loadUsers();
                if (activeTab === 'articles') loadArticles();
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards luôn hiển thị ở Tab Tổng quan */}
        {(activeTab === 'overview' || activeTab === 'jobs') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={GraduationCap}
              label="Sinh viên đã đăng ký"
              value={loadingStats ? '...' : stats.totalStudents.toLocaleString()}
              change="+12% tuần này"
              positive={true}
            />
            <StatCard
              icon={Building2}
              label="Doanh nghiệp đối tác"
              value={loadingStats ? '...' : stats.totalEmployers.toLocaleString()}
              change="+5 mới"
              positive={true}
            />
            <StatCard
              icon={Briefcase}
              label="Tổng tin tuyển dụng"
              value={loadingStats ? '...' : stats.totalJobs.toLocaleString()}
              change={`${pendingJobsCount} tin chờ duyệt`}
              positive={true}
            />
            <StatCard
              icon={FileCheck2}
              label="Hồ sơ ứng tuyển"
              value={loadingStats ? '...' : stats.totalApplications.toLocaleString()}
              change="+28 hồ sơ mới"
              positive={true}
            />
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 1: TỔNG QUAN (OVERVIEW)                                           */}
        {/* ===================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Tình trạng tin tuyển dụng */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Tin tuyển dụng chờ xử lý</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Xem tất cả →
                  </button>
                </div>

                {jobs.filter(j => j.status === 'pending_approval').length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl">
                    🎉 Tuyệt vời! Hiện không có tin tuyển dụng nào đang chờ duyệt.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {jobs.filter(j => j.status === 'pending_approval').slice(0, 3).map(j => (
                      <div key={j.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{j.title}</p>
                          <p className="text-[11px] text-slate-500">{j.companyName} • {j.jobType}</p>
                        </div>
                        <button
                          onClick={() => handleUpdateJobStatus(j.id, 'published')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Duyệt ngay
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Bài viết Cẩm nang gần đây */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-purple-600" />
                    <span>Bài viết Cẩm nang trên Trang chủ</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Quản lý CMS ({articles.length}) →
                  </button>
                </div>

                <div className="space-y-2">
                  {articles.slice(0, 3).map(art => (
                    <div key={art.id} className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center gap-3">
                      <img src={art.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{art.title}</p>
                        <p className="text-[10px] text-slate-400">{art.category} • {art.publishedDate}</p>
                      </div>
                      <button
                        onClick={() => setPreviewArticle(art)}
                        className="p-1.5 text-slate-400 hover:text-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: KIỂM DUYỆT TIN ĐĂNG (JOBS MODERATION)                          */}
        {/* ===================================================================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pending_approval', label: 'Chờ duyệt' },
                  { id: 'published', label: 'Đang mở' },
                  { id: 'rejected', label: 'Bị từ chối' },
                  { id: 'closed', label: 'Đã đóng' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setJobStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      jobStatusFilter === f.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Tìm tin tuyển dụng..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingJobs ? (
                <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách tin tuyển dụng...</div>
              ) : jobs.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Không có tin tuyển dụng nào"
                    description="Không tìm thấy tin tuyển dụng nào phù hợp với bộ lọc hiện tại."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Công việc & Doanh nghiệp</th>
                        <th className="py-3 px-4">Hình thức & Lương</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Hành động kiểm duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-800 truncate">{job.title}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{job.companyName || 'Doanh nghiệp'}</span>
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">{job.jobType}</span>
                            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                              {job.salaryMin > 0 ? `${job.salaryMin?.toLocaleString()}đ - ${job.salaryMax?.toLocaleString()}đ` : 'Thỏa thuận'}
                            </p>
                          </td>

                          <td className="py-3.5 px-4">
                            {getStatusBadge(job.status)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {job.status !== 'published' && (
                                <button
                                  onClick={() => handleUpdateJobStatus(job.id, 'published')}
                                  disabled={actionLoadingId === job.id}
                                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Duyệt</span>
                                </button>
                              )}

                              {job.status !== 'rejected' && (
                                <button
                                  onClick={() => handleUpdateJobStatus(job.id, 'rejected')}
                                  disabled={actionLoadingId === job.id}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Từ chối</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG (USERS MANAGEMENT)                          */}
        {/* ===================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Tất cả vai trò' },
                  { id: 'student', label: 'Sinh viên' },
                  { id: 'employer', label: 'Nhà tuyển dụng' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setUserRoleFilter(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      userRoleFilter === r.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách người dùng...</div>
              ) : users.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Không có người dùng nào"
                    description="Không tìm thấy tài khoản người dùng phù hợp với tiêu chí lọc."
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Tài khoản & Email</th>
                        <th className="py-3 px-4">Vai trò</th>
                        <th className="py-3 px-4">Đơn vị / Trường học</th>
                        <th className="py-3 px-4">Xác thực Email</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Mật khẩu & Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{u.fullName || 'Người dùng'}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            {u.role === 'admin' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                Quản trị viên
                              </span>
                            ) : u.role === 'employer' ? (
                              <Badge variant="warning">Nhà tuyển dụng</Badge>
                            ) : (
                              <Badge variant="primary">Sinh viên</Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {u.role === 'admin'
                              ? 'Hệ thống StudentHub'
                              : u.role === 'employer'
                                ? u.companyName || 'Công ty'
                                : u.university || 'Đại học'}
                          </td>

                          {/* CỘT XÁC THỰC EMAIL */}
                          <td className="py-3.5 px-4">
                            {u.isEmailConfirmed !== false ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Đã xác thực
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                Chưa xác thực
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Đã bị khóa
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Đặt lại mật khẩu của Admin */}
                              <button
                                type="button"
                                onClick={() => setPasswordModalUser(u)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-2xs"
                                title="Admin gửi yêu cầu khôi phục mật khẩu qua Supabase Auth"
                              >
                                <Key className="w-3.5 h-3.5 text-blue-600" />
                                <span>Đặt lại mật khẩu</span>
                              </button>

                              {/* Với tài khoản Quản trị viên: Bảo vệ không cho tự khóa hoặc xóa */}
                              {u.role === 'admin' || (user?.email && u.email?.toLowerCase() === user.email.toLowerCase()) ? (
                                <span className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50/80 rounded-lg border border-purple-200">
                                  Bảo vệ Admin
                                </span>
                              ) : (
                                <>
                                  {/* Nút Khóa / Mở khóa */}
                                  <button
                                    onClick={() => handleToggleUser(u.id, u.isActive)}
                                    disabled={actionLoadingId === u.id}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 ${
                                      u.isActive
                                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                  >
                                    {u.isActive ? (
                                      <>
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Khóa</span>
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3.5 h-3.5" />
                                        <span>Mở</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Nút Xóa vĩnh viễn tài khoản */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteModalUser(u);
                                      setDeleteConfirmInput('');
                                    }}
                                    disabled={actionLoadingId === u.id}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                    title="Admin xóa vĩnh viễn tài khoản người dùng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Xóa</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: CMS QUẢN LÝ BÀI VIẾT CẨM NANG & TIN TỨC TRANG CHỦ              */}
        {/* ===================================================================== */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl flex items-center justify-between text-xs text-purple-900">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  Các bài viết được đăng tại đây sẽ xuất hiện trực tiếp trong mục <strong>"Cẩm Nang Nghề Nghiệp"</strong> trên Trang chủ sinh viên!
                </span>
              </div>
              <span className="font-bold">{articles.length} bài đã đăng</span>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Ảnh & Tiêu đề bài viết</th>
                      <th className="py-3 px-4">Chuyên mục</th>
                      <th className="py-3 px-4">Tác giả & Ngày đăng</th>
                      <th className="py-3 px-4">Lượt xem</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {articles.map(art => (
                      <tr key={art.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 max-w-sm flex items-center gap-3">
                          <img
                            src={art.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 line-clamp-2">{art.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{art.summary}</p>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${art.categoryColor || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {art.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{art.author}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{art.publishedDate}</span>
                          </p>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-700">
                          {art.viewsCount?.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewArticle(art)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Xem trước bài viết"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Xem</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Xóa bài viết"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL VIẾT VÀ ĐĂNG BÀI VIẾT MỚI (CMS POST ARTICLE MODAL)                 */}
      {/* ========================================================================= */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Soạn thảo & Đăng bài Cẩm nang mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublishArticle} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="Vd: Thu nhập chịu thuế là gì? Cách tính và các khoản miễn trừ 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 outline-none font-semibold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Chuyên mục hiển thị
                  </label>
                  <select
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="WIKI CAREER">WIKI CAREER</option>
                    <option value="THƯ GIÃN">THƯ GIÃN</option>
                    <option value="KỸ NĂNG">KỸ NĂNG SINH VIÊN</option>
                    <option value="HƯỚNG DẪN">HƯỚNG DẪN ỨNG TUYỂN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tác giả / Nguồn tin
                  </label>
                  <input
                    type="text"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                    placeholder="Vd: Ban Biên Tập StudentHub"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Link ảnh bìa bài viết (URL)
                </label>
                <input
                  type="url"
                  value={articleForm.imageUrl}
                  onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                {/* Chọn ảnh mẫu nhanh */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400">Ảnh mẫu gợi ý:</span>
                  {[
                    { label: 'Tài chính / Thuế', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' },
                    { label: 'Lịch / Văn hóa', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80' },
                    { label: 'Công nghệ / Edu', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80' },
                    { label: 'Tết / Lễ hội', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setArticleForm({ ...articleForm, imageUrl: s.url })}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 rounded text-[10px] font-semibold transition"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tóm tắt bài viết (Summary)
                </label>
                <textarea
                  rows={2}
                  value={articleForm.summary}
                  onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                  placeholder="Tóm tắt ngắn 1-2 câu hiển thị ở phần xem trước..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nội dung chi tiết bài viết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={articleForm.content}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Nhập toàn bộ nội dung bài viết cẩm nang tại đây..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition active:scale-95"
                >
                  Đăng bài lên Trang chủ ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem trước bài viết */}
      <ArticleDetailModal
        isOpen={Boolean(previewArticle)}
        onClose={() => setPreviewArticle(null)}
        article={previewArticle}
      />

      {/* ===================================================================== */}
      {/* MODAL ADMIN YÊU CẦU ĐẶT LẠI MẬT KHẨU QUA SUPABASE AUTH                */}
      {/* ===================================================================== */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Yêu Cầu Đặt Lại Mật Khẩu</h3>
                  <p className="text-xs text-slate-500 font-medium">{passwordModalUser.fullName} ({passwordModalUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordChangeLoading(true);
                try {
                  const res = await adminResetUserPassword({
                    email: passwordModalUser.email
                  });

                  setPasswordToast({
                    name: passwordModalUser.fullName || passwordModalUser.email,
                    message: res.message || 'Đã gửi liên kết khôi phục mật khẩu chính thức qua Supabase.'
                  });
                  setPasswordModalUser(null);
                  setTimeout(() => setPasswordToast(null), 6000);
                } catch (err) {
                  alert(`Thao tác trên Supabase thất bại: ${err.message}`);
                } finally {
                  setPasswordChangeLoading(false);
                }
              }}
              className="p-5 space-y-4"
            >
              {/* Thông tin hồ sơ & quyền hạn người dùng */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Họ và tên:</span>
                  <span className="font-bold text-slate-900">{passwordModalUser.fullName || 'Người dùng'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tài khoản email:</span>
                  <span className="font-bold text-slate-900">{passwordModalUser.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Vai trò tài khoản:</span>
                  <span className="font-semibold text-slate-800">
                    {passwordModalUser.role === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Trạng thái email:</span>
                  <span className="font-semibold text-emerald-700">
                    {passwordModalUser.isEmailConfirmed !== false ? 'Đã xác thực' : 'Chưa xác thực'}
                  </span>
                </div>
              </div>

              {/* Thông tin giải thích luồng khôi phục chính thức */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Quy trình khôi phục chính thức Supabase Auth</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Khi xác nhận, hệ thống backend sẽ gọi API Supabase Auth để gửi email chứa liên kết khôi phục mật khẩu bảo mật đến địa chỉ email của người dùng. Người dùng sẽ truy cập liên kết đó để tự đặt mật khẩu mới an toàn.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{passwordChangeLoading ? 'Đang gửi yêu cầu...' : 'Gửi email khôi phục'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL ADMIN XÁC NHẬN XÓA TÀI KHOẢN VĨNH VIỄN                          */}
      {/* ===================================================================== */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Xác Nhận Xóa Vĩnh Viễn Tài Khoản</h3>
                  <p className="text-xs text-rose-600 font-medium">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDeleteUser} className="p-6 space-y-4">
              {/* Thông tin tài khoản */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Họ và tên:</span>
                  <span className="font-bold text-slate-900">{deleteModalUser.fullName || 'Người dùng'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Email tài khoản:</span>
                  <span className="font-bold text-rose-700">{deleteModalUser.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Vai trò:</span>
                  <span className="font-semibold text-slate-800">
                    {deleteModalUser.role === 'employer' ? 'Nhà tuyển dụng' : (deleteModalUser.role === 'admin' ? 'Quản trị viên' : 'Sinh viên')}
                  </span>
                </div>
              </div>

              {/* Chi tiết dữ liệu sẽ bị xóa */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Dữ liệu sẽ bị xóa khỏi hệ thống:</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-800 leading-relaxed">
                  <li>Toàn bộ hồ sơ cá nhân và hồ sơ năng lực ({deleteModalUser.role === 'employer' ? 'Doanh nghiệp, các tin tuyển dụng đã đăng' : 'Hồ sơ sinh viên, kỹ năng, portfolio'}).</li>
                  <li>Các đơn ứng tuyển cá nhân và file CV tải lên trong Storage (chỉ xóa khi không còn hồ sơ nào khác dùng chung).</li>
                  <li><strong>Bảo toàn dữ liệu dùng chung:</strong> Lịch sử dự án và tin nhắn liên kết với người dùng khác sẽ được giữ nguyên cho đối phương dưới nhãn <em>[Tài khoản đã xóa]</em>.</li>
                  <li>Tài khoản xác thực Supabase Auth sẽ được xóa để người dùng có thể đăng ký lại bằng email này nếu cần.</li>
                </ul>
              </div>

              {/* Yêu cầu nhập lại email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập lại chính xác email <span className="text-rose-600 select-all font-mono font-bold">"{deleteModalUser.email}"</span> để xác nhận:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder="Nhập email tài khoản..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || deleteConfirmInput.trim().toLowerCase() !== deleteModalUser.email.trim().toLowerCase()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleteLoading ? 'Đang xóa dữ liệu...' : 'Xác nhận xóa vĩnh viễn'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO KHI ĐẶT LẠI MẬT KHẨU THÀNH CÔNG */}
      {passwordToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideUp">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Đã gửi yêu cầu khôi phục mật khẩu!</p>
            <p className="text-slate-300">
              {passwordToast.message}
            </p>
          </div>
          <button
            onClick={() => setPasswordToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
