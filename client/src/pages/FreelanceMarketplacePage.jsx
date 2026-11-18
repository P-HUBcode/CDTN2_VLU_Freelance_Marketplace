import React, { useState, useMemo } from 'react';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import {
  Search,
  PlusCircle,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export default function FreelanceMarketplacePage({
  services = [],
  searchQuery = '',
  onSearchChange,
  onSelectService,
  onOpenCreateService,
  onNavigate,
  currentUser
}) {
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const checkIsMyService = (srv) => {
    if (!currentUser || !srv) return false;
    if (srv.studentId && currentUser.id && srv.studentId === currentUser.id) return true;
    if (srv.studentEmail && currentUser.email && srv.studentEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (srv.studentName && currentUser.name && srv.studentName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  };

  // Đồng bộ với từ khóa tìm kiếm toàn cục từ Topbar
  React.useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== searchTerm) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Design', label: 'Design' },
    { id: 'Content', label: 'Content' },
    { id: 'Video Editing', label: 'Video Editing' },
    { id: 'Marketing', label: 'Marketing' },
    { id: 'IT', label: 'IT' },
    { id: 'Data Entry', label: 'Data Entry' },
    { id: 'Tutoring', label: 'Tutoring' },
  ];

  const filteredServices = useMemo(() => {
    const q = (searchTerm || searchQuery || '').trim().toLowerCase();

    return (services || []).filter((srv) => {
      if (!srv) return false;

      // Lọc theo danh mục
      if (selectedCategory !== 'all') {
        const srvCat = (srv.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (srvCat !== selCat && !srvCat.includes(selCat)) {
          return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm (tiêu đề, tên sinh viên, kỹ năng, mô tả)
      if (q) {
        const matchTitle = (srv.title || '').toLowerCase().includes(q);
        const matchName = (srv.studentName || '').toLowerCase().includes(q);
        const matchDesc = (srv.description || '').toLowerCase().includes(q);

        const srvSkills = Array.isArray(srv.skills)
          ? srv.skills
          : typeof srv.skills === 'string'
          ? srv.skills.split(',')
          : [];

        const matchSkills = srvSkills.some((s) =>
          String(s).trim().toLowerCase().includes(q)
        );

        if (!matchTitle && !matchName && !matchSkills && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [services, selectedCategory, searchTerm, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Navigation Switcher Tabs (Việc làm Tuyển dụng <-> Thuê dịch vụ Freelance) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200/80">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('marketplace')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition"
        >
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Tin tuyển dụng việc làm</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-blue-700 shadow-sm border border-slate-200/60"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Thuê dịch vụ sinh viên (Freelance) ({filteredServices.length})</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sell Your Skills Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thuê sinh viên theo kỹ năng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Khám phá các gói dịch vụ freelance chuyên nghiệp do chính sinh viên các trường đại học thực hiện với mức phí tối ưu.
          </p>
        </div>

        <button
          onClick={onOpenCreateService}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo dịch vụ của bạn</span>
        </button>
      </div>

      {/* Search & Categories bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle space-y-3.5">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Tìm dịch vụ bạn cần... (vd: Canva, TikTok, Viết bài SEO, Excel, Lập trình...)"
            className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
        <span>
          Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ chất lượng
        </span>
        <span className="hidden sm:inline">Cam kết nghiệm thu hài lòng mới giải ngân thù lao</span>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <EmptyState
          title="Không tìm thấy gói dịch vụ phù hợp"
          description="Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục Tất cả."
          actionLabel="Đặt lại bộ lọc"
          onAction={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-subtle hover:border-blue-500/70 hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Service Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="primary" size="sm">
                      {service.category}
                    </Badge>
                  </div>
                  {checkIsMyService(service) && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm">
                        Gói của bạn
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  {/* Student author */}
                  <div className="flex items-center gap-2">
                    <img
                      src={service.studentAvatar}
                      alt={service.studentName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-100"
                    />
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {service.studentName}
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold shrink-0">
                      {service.studentUniversity}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                    {service.title}
                  </h3>

                  {/* Rating & reviews */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-slate-800">{service.rating}</span>
                    <span className="text-slate-400 font-normal">({service.reviewsCount})</span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {service.skills?.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{service.deliveryDays} ngày</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Giá từ</span>
                  <span className="text-sm font-extrabold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(service.startingPrice)}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
