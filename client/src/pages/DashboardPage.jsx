import React, { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { getStudentStats } from '../lib/statsService';
import { StatusDistributionWidget } from '../components/common/AnalyticsCharts';
import {
  FileCheck2,
  Clock,
  Wallet,
  Star,
  ArrowRight,
  Sparkles,
  MapPin,
  Bookmark,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Newspaper
} from 'lucide-react';
import { getStoredArticles } from '../lib/articleService';
import ArticleDetailModal from '../components/common/ArticleDetailModal';

export default function DashboardPage({
  currentUser,
  jobs = [],
  projects = [],
  appliedJobs = [],
  onSelectJob,
  onNavigate,
  onToggleBookmark,
  bookmarkedIds = new Set()
}) {
  const activeProjects = projects.filter((p) => p.status === 'in_progress');

  // Quản lý hiển thị việc làm đề xuất (Hỗ trợ nút "Xem thêm")
  const [visibleJobCount, setVisibleJobCount] = useState(4);
  const recommendedJobs = jobs.slice(0, visibleJobCount);

  // Quản lý bài viết Cẩm nang Nghề nghiệp & Tin tức CMS
  const [articles, setArticles] = useState(getStoredArticles());
  const [visibleArticlesCount, setVisibleArticlesCount] = useState(4);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Student Dashboard Stats (Sprint 3.4)
  const [studentStats, setStudentStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const data = await getStudentStats(currentUser);
        if (isMounted) setStudentStats(data);
      } catch (e) {
        console.warn('Lỗi lấy stats sinh viên:', e);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  // Đồng bộ bài viết CMS khi Admin đăng bài mới
  useEffect(() => {
    const syncArticles = () => {
      setArticles(getStoredArticles());
    };
    window.addEventListener('storage', syncArticles);
    window.addEventListener('studenthub_articles_updated', syncArticles);
    return () => {
      window.removeEventListener('storage', syncArticles);
      window.removeEventListener('studenthub_articles_updated', syncArticles);
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sinh viên Đại học Kinh tế TP.HCM (UEH) - K48</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser?.name ? currentUser.name.replace(/\(.*?\)/g, '').trim().split(/\s+/).pop() : 'bạn'} 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
            Khám phá những công việc phù hợp với kỹ năng và thời gian của bạn. Hôm nay có{' '}
            <span className="font-semibold text-white underline decoration-amber-400 decoration-2">
              24 cơ hội mới
            </span>{' '}
            phù hợp lịch học!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition"
            >
              <span>Tìm việc ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('freelance')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/60 hover:bg-blue-800 text-white font-medium text-xs sm:text-sm rounded-xl transition backdrop-blur-sm border border-white/20"
            >
              <Layers className="w-4 h-4" />
              <span>Sàn dịch vụ Freelance</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 bottom-[-50px] w-60 h-60 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Công việc đã ứng tuyển"
          value={studentStats ? studentStats.appliedCount : appliedJobs.length}
          subtitle={
            studentStats?.reviewingCount > 0
              ? `${studentStats.reviewingCount} hồ sơ đang được duyệt`
              : '2 hồ sơ đang được duyệt'
          }
          icon={FileCheck2}
          color="blue"
          badge="+2 tuần này"
          onClick={() => onNavigate('my-applications')}
        />
        <StatCard
          title="Dự án đang làm"
          value={studentStats ? studentStats.activeProjectsCount : activeProjects.length}
          subtitle={
            studentStats?.completedProjectsCount > 0
              ? `Đã hoàn thành ${studentStats.completedProjectsCount} dự án`
              : '1 dự án sắp đến deadline'
          }
          icon={Clock}
          color="amber"
          onClick={() => onNavigate('my-projects')}
        />
        <StatCard
          title="Thu nhập tháng này"
          value={
            studentStats
              ? `${(studentStats.earningsMonth || 0).toLocaleString()}đ`
              : currentUser.earningsMonth
          }
          subtitle="Số dư khả dụng: 12.500.000đ"
          icon={Wallet}
          color="emerald"
          badge="+18% so với T9"
          onClick={() => onNavigate('wallet')}
        />
        <StatCard
          title="Đánh giá trung bình"
          value={currentUser.rating}
          subtitle={`Dựa trên ${currentUser.reviewsCount} đánh giá 5★`}
          icon={Star}
          color="purple"
          badge="Top 5% sinh viên"
          onClick={() => onNavigate('profile')}
        />
      </div>

      {/* Analytics Chart Widget (Sprint 3.4) */}
      {studentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tiến độ ứng tuyển & Uy tín năng lực</h3>
                  <p className="text-xs text-slate-500">Thống kê hồ sơ sinh viên qua các vòng phỏng vấn thực tế</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                  Tỉ lệ phản hồi 96%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Đã nộp</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">{studentStats.appliedCount}</div>
                </div>
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
                  <div className="text-[10px] text-amber-700 uppercase font-semibold">Hẹn phỏng vấn</div>
                  <div className="text-lg font-extrabold text-amber-900 mt-0.5">{studentStats.interviewCount}</div>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold">Được nhận việc</div>
                  <div className="text-lg font-extrabold text-emerald-900 mt-0.5">{studentStats.acceptedCount}</div>
                </div>
                <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
                  <div className="text-[10px] text-rose-700 uppercase font-semibold">Từ chối</div>
                  <div className="text-lg font-extrabold text-rose-900 mt-0.5">{studentStats.rejectedCount}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Hệ thống tự động đồng bộ trạng thái từ nhà tuyển dụng</span>
              <button
                onClick={() => onNavigate('my-applications')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Xem chi tiết hồ sơ →
              </button>
            </div>
          </div>

          <div className="md:col-span-1">
            <StatusDistributionWidget stats={studentStats} />
          </div>
        </div>
      )}

      {/* Main 2-Column: Left (Recommended Jobs) + Right (Ongoing Projects) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Việc làm đề xuất cho bạn</h2>
              <p className="text-xs text-slate-500">Dựa trên chuyên ngành Marketing UEH & kỹ năng Canva, Content</p>
            </div>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({jobs.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedJobs.map((job) => {
              const isBookmarked = bookmarkedIds.has(job.id);
              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-500/70 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                      />
                      <div className="flex items-center gap-1.5">
                        <Badge variant={job.workMode === 'Remote' ? 'primary' : 'neutral'} size="sm">
                          {job.workMode}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(job.id);
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                          }`}
                          title="Lưu công việc"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{job.company}</p>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    {/* Skills tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-md border border-slate-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Thù lao</span>
                      <span className="text-xs font-bold text-blue-600">{job.salary}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJob(job);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition"
                    >
                      Chi tiết →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nút Xem thêm việc làm đề xuất nếu có nhiều việc (> 4 việc) */}
          {jobs.length > 4 && (
            <div className="pt-2 flex justify-center">
              {visibleJobCount < jobs.length ? (
                <button
                  onClick={() => setVisibleJobCount((prev) => Math.min(prev + 4, jobs.length))}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition"
                >
                  <span>Xem thêm việc làm đề xuất (còn {jobs.length - visibleJobCount} việc)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setVisibleJobCount(4)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  <span>Thu gọn danh sách</span>
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Ongoing Projects Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Dự án đang làm</h2>
            <button
              onClick={() => onNavigate('my-projects')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onNavigate('my-projects')}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-subtle transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 truncate">{project.client}</span>
                  <Badge variant="primary" size="sm">Đang thực hiện</Badge>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                  {project.title}
                </h4>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Tiến độ</span>
                    <span className="font-bold text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">Hạn nộp: <strong>{project.deadline}</strong></span>
                  <span className="font-bold text-slate-800">{project.budget && !String(project.budget).includes('NaN') ? project.budget : '650.000đ'}</span>
                </div>
              </div>
            ))}

            {/* Student Tips */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>3 Bước Xây Dựng Reputation</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>• <strong>Nhận brief kỹ:</strong> Đặt câu hỏi rõ ràng trước khi bắt đầu.</li>
                <li>• <strong>Bàn giao đúng hạn:</strong> Nộp bài trước deadline ít nhất 6 giờ.</li>
                <li>• <strong>Xin review:</strong> Nhờ khách đánh giá 5 sao sau khi nghiệm thu.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Cẩm Nang Nghề Nghiệp & Tin Tức Báo Chí (Khớp chuẩn 100% hình ảnh yêu cầu) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cẩm Nang Nghề Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cập nhật kiến thức pháp lý, kỹ năng nghề nghiệp và bí quyết thành công cho sinh viên
          </p>
        </div>

        {/* Article Cards Grid (4 columns on desktop matching reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {articles.slice(0, visibleArticlesCount).map((article) => {
            const isRelax = article.category === 'THƯ GIÃN';
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-cardHover hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Poster image banner */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider border shadow-sm ${
                        isRelax
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-blue-600 text-white border-blue-700'
                      }`}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div
                      className={`text-[10px] font-extrabold uppercase tracking-wider mb-1.5 ${
                        isRelax ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    >
                      {article.category}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{article.publishedDate}</span>
                    <span className="font-semibold text-blue-600 group-hover:underline">Chi tiết →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút Xem thêm bài viết nếu có nhiều bài (> 4 bài) */}
        {articles.length > 4 && (
          <div className="pt-2 flex justify-center">
            {visibleArticlesCount < articles.length ? (
              <button
                onClick={() => setVisibleArticlesCount((prev) => Math.min(prev + 4, articles.length))}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 text-xs sm:text-sm font-bold rounded-xl transition border border-blue-200/60 shadow-sm"
              >
                <span>Xem thêm cẩm nang & tin tức (còn {articles.length - visibleArticlesCount} bài)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setVisibleArticlesCount(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition"
              >
                <span>Thu gọn cẩm nang</span>
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Modal xem chi tiết bài viết cẩm nang */}
      <ArticleDetailModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />
    </div>
  );
}
