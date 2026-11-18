import React, { useState, useEffect, useCallback } from 'react';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { Skeleton, JobCardSkeleton } from '../components/common/Skeleton';
import {
  Search,
  MapPin,
  Clock,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Briefcase,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { getMarketplaceJobs } from '../lib/jobService';

export default function MarketplacePage({
  jobs: parentJobs = [],
  onSelectJob,
  onApplyQuick,
  onToggleBookmark,
  bookmarkedIds = new Set(),
  searchQuery = '',
  onSearchChange,
  onViewCompany,
  onNavigate
}) {
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [debouncedKeyword, setDebouncedKeyword] = useState(searchQuery || '');
  const [locationInput, setLocationInput] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | salary_high | salary_low
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Checkbox filters (Sidebar)
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  // TopCV Quick Dropdown Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedJobTypeFilter, setSelectedJobTypeFilter] = useState('');
  const [selectedSalaryFilter, setSelectedSalaryFilter] = useState('');

  // Data & Pagination state
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // 1. Đồng bộ từ khóa tìm kiếm từ Topbar toàn hệ thống
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
      setDebouncedKeyword(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // 2. Debounce Search & Location inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [locationInput]);

  // 2. Fetch Jobs directly from Database (with filters, sort, pagination)
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const activeJobTypes = selectedTypes.length > 0
        ? selectedTypes
        : (selectedJobTypeFilter ? [selectedJobTypeFilter] : []);

      const activeSalaryRanges = selectedSalaryRanges.length > 0
        ? selectedSalaryRanges
        : (selectedSalaryFilter ? [selectedSalaryFilter] : []);

      const result = await getMarketplaceJobs({
        keyword: debouncedKeyword,
        location: debouncedLocation,
        jobTypes: activeJobTypes,
        salaryRanges: activeSalaryRanges,
        skills: selectedSkills,
        category: selectedCategory,
        experience: selectedExperience,
        sortBy,
        page: currentPage,
        pageSize: 6
      });

      setJobs(result.jobs || []);
      setTotalCount(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi tải danh sách việc làm:', err);
      setFetchError('Không thể tải danh sách việc làm từ máy chủ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedKeyword,
    debouncedLocation,
    selectedTypes,
    selectedSalaryRanges,
    selectedSkills,
    selectedCategory,
    selectedExperience,
    selectedJobTypeFilter,
    selectedSalaryFilter,
    sortBy,
    currentPage
  ]);

  useEffect(() => {
    fetchJobs();
    // Tự động kiểm tra bài đăng tuyển dụng mới từ trình duyệt khác (Edge <-> Cốc Cốc) mỗi 3.5 giây
    const pollTimer = setInterval(() => {
      fetchJobs();
    }, 3500);
    return () => clearInterval(pollTimer);
  }, [fetchJobs]);

  const toggleArrayItem = (list, setList, item) => {
    setCurrentPage(1);
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleQuickTagClick = (tag) => {
    if (['Part-time', 'Full-time', 'Freelance', 'Internship', 'Remote'].includes(tag)) {
      setSelectedJobTypeFilter(selectedJobTypeFilter === tag ? '' : tag);
    } else {
      setSearchTerm(tag);
      setDebouncedKeyword(tag);
    }
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setDebouncedKeyword('');
    setLocationInput('');
    setDebouncedLocation('');
    setSelectedTypes([]);
    setSelectedSalaryRanges([]);
    setSelectedSkills([]);
    setSelectedCategory('');
    setSelectedExperience('');
    setSelectedJobTypeFilter('');
    setSelectedSalaryFilter('');
    setCurrentPage(1);
    if (onSearchChange) onSearchChange('');
  };

  const hasAnyFilter =
    selectedTypes.length > 0 ||
    selectedSalaryRanges.length > 0 ||
    selectedSkills.length > 0 ||
    searchTerm.trim() !== '' ||
    locationInput.trim() !== '' ||
    Boolean(selectedCategory) ||
    Boolean(selectedExperience) ||
    Boolean(selectedJobTypeFilter) ||
    Boolean(selectedSalaryFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation Switcher Tabs (Việc làm Tuyển dụng <-> Thuê dịch vụ Freelance) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/80">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-blue-700 shadow-sm border border-slate-200/60"
        >
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Tin tuyển dụng việc làm ({totalCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('freelance')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Thuê dịch vụ sinh viên (Freelance)</span>
        </button>
      </div>

      {/* 1. Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tìm công việc phù hợp với bạn
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Khám phá hàng trăm cơ hội part-time, freelance và internship từ các doanh nghiệp uy tín.
        </p>
      </div>

      {/* 2. TopCV Multi-Criteria Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-subtle space-y-4">
        {/* Row 1: Search Keyword & Location Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Vị trí ứng tuyển, kỹ năng (Canva, TikTok, Content...) hoặc tên công ty..."
              className="w-full pl-11 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedKeyword('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Selector (Input + Dropdown options) */}
          <div className="relative md:w-64 flex items-center">
            <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={locationInput}
              onChange={(e) => {
                setLocationInput(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition font-medium text-slate-700 cursor-pointer appearance-none"
            >
              <option value="">Tất cả địa điểm</option>
              <optgroup label="TP. Hồ Chí Minh">
                <option value="TP. Hồ Chí Minh">Tất cả TP.HCM</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Bình Thạnh">Bình Thạnh</option>
                <option value="Gò Vấp">Gò Vấp</option>
                <option value="Quận 10">Quận 10</option>
                <option value="Thủ Đức">TP. Thủ Đức</option>
              </optgroup>
              <optgroup label="Tỉnh / Thành khác">
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Bình Dương">Bình Dương</option>
              </optgroup>
              <option value="Remote">Làm việc từ xa (Remote)</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setDebouncedKeyword(searchTerm);
              setDebouncedLocation(locationInput);
              setCurrentPage(1);
            }}
            className="px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </button>

          {/* Mobile Filter toggle button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ lọc chi tiết</span>
          </button>
        </div>

        {/* Row 2: Secondary Dropdown Filters (TopCV Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          {/* Dropdown 1: Ngành nghề */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer appearance-none ${
                selectedCategory
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">💼 Ngành nghề: Tất cả</option>
              <option value="marketing">Marketing / Truyền thông / TikTok</option>
              <option value="design">Thiết kế đồ họa / Canva / Video</option>
              <option value="it">CNTT / Lập trình / Phần mềm</option>
              <option value="sales">Bán hàng / CSKH / F&B</option>
              <option value="finance">Kế toán / Kiểm toán / Thuế</option>
              <option value="admin">Hành chính / Nhân sự (HR)</option>
              <option value="education">Gia sư / Giáo dục</option>
            </select>
          </div>

          {/* Dropdown 2: Mức lương */}
          <div className="relative">
            <select
              value={selectedSalaryFilter}
              onChange={(e) => {
                setSelectedSalaryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer appearance-none ${
                selectedSalaryFilter
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">💰 Mức lương: Tất cả</option>
              <option value="under_3m">Dưới 3 triệu</option>
              <option value="3_to_5m">3 – 5 triệu</option>
              <option value="5_to_10m">5 – 10 triệu</option>
              <option value="over_10m">Trên 10 triệu</option>
            </select>
          </div>

          {/* Dropdown 3: Kinh nghiệm */}
          <div className="relative">
            <select
              value={selectedExperience}
              onChange={(e) => {
                setSelectedExperience(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer appearance-none ${
                selectedExperience
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">🎓 Kinh nghiệm: Tất cả</option>
              <option value="none">Chưa có kinh nghiệm</option>
              <option value="intern">Sinh viên thực tập (Intern)</option>
              <option value="under_1y">Dưới 1 năm kinh nghiệm</option>
              <option value="1_to_2y">1 – 2 năm kinh nghiệm</option>
            </select>
          </div>

          {/* Dropdown 4: Hình thức làm việc */}
          <div className="relative">
            <select
              value={selectedJobTypeFilter}
              onChange={(e) => {
                setSelectedJobTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer appearance-none ${
                selectedJobTypeFilter
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <option value="">⏰ Hình thức: Tất cả</option>
              <option value="Part-time">Part-time (Bán thời gian)</option>
              <option value="Full-time">Full-time (Toàn thời gian)</option>
              <option value="Internship">Thực tập sinh (Internship)</option>
              <option value="Freelance">Freelance (Theo dự án)</option>
              <option value="Remote">Remote (Từ xa)</option>
            </select>
          </div>
        </div>

        {/* Row 3: Trending Search Pills & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý TopCV:</span>
            </span>
            {[
              { label: '⚡ Part-time', value: 'Part-time' },
              { label: '🎨 Canva', value: 'Canva' },
              { label: '📱 TikTok', value: 'TikTok' },
              { label: '💻 ReactJS', value: 'React' },
              { label: '✨ Figma', value: 'Figma' },
              { label: '📝 Content', value: 'Content' },
              { label: '🎓 Thực tập sinh', value: 'Internship' },
              { label: '🌐 Remote', value: 'Remote' }
            ].map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleQuickTagClick(tag.value)}
                className={`px-2.5 py-1 rounded-lg font-medium transition text-[11px] ${
                  searchTerm === tag.value || selectedJobTypeFilter === tag.value
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200/80"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main 2-Column: Left Filter Sidebar & Right Results */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT FILTER SIDEBAR */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } md:block md:col-span-4 lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle space-y-6 md:sticky md:top-20`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Bộ lọc tìm kiếm</span>
            </span>
            {hasAnyFilter && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Group 1: Loại công việc */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900">Loại công việc</h4>
            <div className="space-y-2 text-xs text-slate-700">
              {['Part-time', 'Full-time', 'Freelance', 'Internship', 'Remote'].map((t) => (
                <label key={t} className="flex items-center gap-2.5 cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleArrayItem(selectedTypes, setSelectedTypes, t)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Group 2: Mức lương */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Mức lương</h4>
            <div className="space-y-2 text-xs text-slate-700">
              {[
                { id: 'under_2m', label: 'Dưới 2 triệu' },
                { id: '2_to_5m', label: '2 – 5 triệu' },
                { id: '5_to_10m', label: '5 – 10 triệu' },
                { id: 'over_10m', label: 'Trên 10 triệu' }
              ].map((s) => (
                <label key={s.id} className="flex items-center gap-2.5 cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedSalaryRanges.includes(s.id)}
                    onChange={() => toggleArrayItem(selectedSalaryRanges, setSelectedSalaryRanges, s.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Group 3: Kỹ năng */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Kỹ năng sinh viên</h4>
            <div className="space-y-2 text-xs text-slate-700">
              {['Canva', 'Content', 'Marketing', 'Excel', 'Video Editing', 'Programming'].map((skill) => (
                <label key={skill} className="flex items-center gap-2.5 cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleArrayItem(selectedSkills, setSelectedSkills, skill)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT JOB LISTINGS */}
        <section className="md:col-span-8 lg:col-span-9 space-y-4">
          {/* Results summary bar + Sort dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-subtle">
            <div className="text-xs font-semibold text-slate-700">
              {isLoading ? (
                <span>Đang truy vấn database...</span>
              ) : (
                <>
                  Tìm thấy <span className="font-extrabold text-blue-600 text-sm">{totalCount}</span> việc làm đang mở tuyển
                </>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="salary_high">Lương cao → thấp</option>
                <option value="salary_low">Lương thấp → cao</option>
              </select>
            </div>
          </div>

          {/* Error Banner */}
          {fetchError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {/* Cards Grid / Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <JobCardSkeleton key={n} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="Không tìm thấy việc làm phù hợp"
              description="Bạn hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn một số tiêu chí bộ lọc."
              actionLabel="Xóa bộ lọc tìm kiếm"
              onAction={resetAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const isBookmarked = bookmarkedIds.has(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle hover:border-blue-500/70 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Top Row: Logo + Badges + Bookmark */}
                      <div className="flex items-start justify-between gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCompany) onViewCompany(job);
                          }}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0 cursor-pointer hover:opacity-85 transition"
                          title="Xem thông tin doanh nghiệp"
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
                            title={isBookmarked ? 'Đã lưu' : 'Lưu công việc'}
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Job Title & Company */}
                      <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewCompany) onViewCompany(job);
                          }}
                          className="hover:text-blue-600 hover:underline text-left truncate transition"
                        >
                          {job.company}
                        </button>
                        {job.verified && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                            Đã xác thực
                          </span>
                        )}
                      </p>

                      {/* Salary */}
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
                        {job.skills?.slice(0, 4).map((skill, idx) => (
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
                      <span className="text-[11px] text-slate-400">Hạn: {job.deadline}</span>
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
          )}

          {/* 4. PAGINATION CONTROLS */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center gap-1 text-xs">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setCurrentPage(num);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`w-7 h-7 rounded-lg font-bold transition ${
                      currentPage === num
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
