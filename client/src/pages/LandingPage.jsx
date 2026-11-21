import React, { useState, useEffect } from 'react';
import Badge from '../components/common/Badge';
import {
  Search,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  ChevronRight,
  MapPin,
  Clock,
  Bookmark,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getStoredArticles } from '../lib/articleService';
import ArticleDetailModal from '../components/common/ArticleDetailModal';

export default function LandingPage({
  jobs = [],
  onSelectJob,
  onNavigate,
  onToggleBookmark,
  bookmarkedIds = new Set()
}) {
  const [keyword, setKeyword] = useState('');

  const quickCategories = [
    { label: 'Part-time', filter: 'Part-time' },
    { label: 'Freelance', filter: 'Freelance' },
    { label: 'Internship', filter: 'Internship' },
    { label: 'Remote', filter: 'Remote' },
    { label: 'Marketing', filter: 'Marketing' },
    { label: 'Design', filter: 'Design' },
    { label: 'IT', filter: 'IT' },
    { label: 'Content', filter: 'Content' },
  ];

  const featuredJobs = jobs.slice(0, 6);

  // Quản lý bài viết Cẩm nang Nghề nghiệp (giống TopCV - đặt ở cuối trang chủ)
  const [articles, setArticles] = useState(getStoredArticles());
  const [selectedCategory, setSelectedCategory] = useState('TẤT CẢ');
  const [visibleArticlesCount, setVisibleArticlesCount] = useState(8);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['TẤT CẢ', 'WIKI CAREER', 'KỸ NĂNG', 'HƯỚNG DẪN', 'THƯ GIÃN'];

  // Đồng bộ bài viết CMS khi Admin đăng hoặc xóa bài
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

  const filteredArticles = selectedCategory === 'TẤT CẢ'
    ? articles
    : articles.filter((a) => a.category?.toUpperCase() === selectedCategory);

  const handleSearch = (e) => {
    e.preventDefault();
    onNavigate('marketplace', { keyword });
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/70 via-white to-[#F8FAFC] border border-blue-100/60 p-6 sm:p-12 lg:p-16 text-center">
        {/* Soft background glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Nền tảng việc làm freelance & part-time dành riêng cho Sinh viên Việt Nam</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
            Tìm việc phù hợp. Nhận project thật.{' '}
            <span className="text-blue-600 block mt-1">
              Xây dựng sự nghiệp từ khi còn là sinh viên.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            Kết nối sinh viên với các công việc part-time, freelance và project phù hợp với kỹ năng và thời gian của bạn.
          </p>

          {/* Large Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-md shadow-blue-500/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-2xl mx-auto"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Bạn đang tìm công việc gì? (vd: Canva, Content, TikTok, Excel...)"
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm active:scale-95 shrink-0"
            >
              Tìm việc
            </button>
          </form>

          {/* Quick Categories */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Tìm nhanh:</span>
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('marketplace', { filter: cat.filter })}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition shadow-subtle"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Social Proof stats */}
          <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">1.200+</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Sinh viên hoạt động</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600">350+</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Doanh nghiệp uy tín</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">100%</p>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">Ký quỹ thù lao an toàn</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED JOBS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Cơ hội mới hôm nay</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Công việc nổi bật dành cho sinh viên
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tuyển chọn các vị trí part-time & freelance linh hoạt theo lịch học trường
            </p>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline self-start sm:self-auto"
          >
            <span>Xem tất cả {jobs?.length || 10} việc làm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Featured Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredJobs.map((job) => {
            const isBookmarked = bookmarkedIds.has(job.id);
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle hover:border-blue-500/70 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
              >
                <div>
                  {/* Top: Logo + Badges + Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                    />

                    <div className="flex items-center gap-1.5">
                      <Badge variant={job.workMode === 'Remote' ? 'primary' : 'neutral'} size="sm">
                        {job.workMode}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {job.type}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(job.id);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Lưu công việc"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Company */}
                  <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <span>{job.company}</span>
                    {job.verified && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                        Đã xác thực
                      </span>
                    )}
                  </p>

                  {/* Salary Highlight */}
                  <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                      Mức thù lao
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {job.salary}
                    </span>
                  </div>

                  {/* Location & Time */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.workingHours}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {job.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{job.postedTime}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJob(job);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 3 DISTINCT ECOSYSTEMS: "Không chỉ tìm việc – hãy xây dựng portfolio" */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200/90 p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Hệ sinh thái toàn diện
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Không chỉ tìm việc – hãy xây dựng portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            StudentHub đồng hành cùng bạn từ bước tìm việc đầu tiên cho đến khi có profile chuyên nghiệp và thu nhập vững vàng.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-3 hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Tìm việc</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tìm công việc phù hợp với kỹ năng, địa điểm gần trường học và khung giờ rảnh của bạn.
            </p>
            <button
              onClick={() => onNavigate('marketplace')}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Khám phá việc làm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-3 hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Nhận freelance</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Đăng dịch vụ kỹ năng của bạn (Canva, TikTok, Content, Excel...) và nhận project trực tiếp từ khách hàng.
            </p>
            <button
              onClick={() => onNavigate('freelance')}
              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Xem sàn dịch vụ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-3 hover:border-blue-400 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Xây dựng reputation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tích lũy đánh giá 5 sao, chứng nhận thực tập từ doanh nghiệp và portfolio thực tế trước khi tốt nghiệp.
            </p>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Xem hồ sơ mẫu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. EMPLOYER CTA BANNER */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-card">
        <div className="space-y-3 max-w-xl relative z-10">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-blue-200">
            Dành cho Doanh nghiệp & Startup
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bạn là nhà tuyển dụng?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tiếp cận ngay nguồn nhân lực trẻ trung, sáng tạo, thông thạo công cụ AI/Canva/TikTok từ các trường đại học hàng đầu (UEH, Văn Lang, TĐT, Bách Khoa...).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
          <button
            onClick={() => onNavigate('employer-dashboard')}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Tìm kiếm sinh viên phù hợp
          </button>
          <button
            onClick={() => onNavigate('post-job')}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition"
          >
            Đăng tin tuyển dụng
          </button>
        </div>
      </section>

      {/* 5. CẨM NANG NGHỀ NGHIỆP (GIỐNG TOPCV - ĐẶT Ở DƯỚI CÙNG TRANG CHỦ, LƯỚT XUỐNG DƯỚI ĐỂ XEM) */}
      <section id="cam-nang" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-subtle space-y-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cẩm Nang & Hành Trang Nghề Nghiệp</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cẩm Nang Nghề Nghiệp
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Cập nhật kiến thức pháp lý, kỹ năng nghề nghiệp, kinh nghiệm phỏng vấn và bí quyết thành công dành riêng cho sinh viên
            </p>
          </div>

          {/* Bộ lọc danh mục bài viết */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleArticlesCount(8);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danh sách bài viết */}
        {filteredArticles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
            Chưa có bài viết nào trong chuyên mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredArticles.slice(0, visibleArticlesCount).map((article) => {
              const isRelax = article.category === 'THƯ GIÃN';
              return (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-cardHover hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  {/* Ảnh bìa bài viết */}
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

                  {/* Nội dung bài viết */}
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
                      {article.summary && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
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
        )}

        {/* Nút Xem thêm bài viết nếu nhiều bài */}
        {filteredArticles.length > 4 && (
          <div className="pt-2 flex justify-center">
            {visibleArticlesCount < filteredArticles.length ? (
              <button
                onClick={() => setVisibleArticlesCount((prev) => Math.min(prev + 4, filteredArticles.length))}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 text-xs sm:text-sm font-bold rounded-xl transition border border-blue-200/60 shadow-sm"
              >
                <span>Xem thêm cẩm nang & tin tức (còn {filteredArticles.length - visibleArticlesCount} bài)</span>
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
