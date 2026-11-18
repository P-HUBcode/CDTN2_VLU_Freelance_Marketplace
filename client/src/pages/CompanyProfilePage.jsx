import React, { useState, useEffect } from 'react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import PublicCompanyModal from './PublicCompanyModal';
import { useAuth } from '../contexts/AuthContext';
import {
  getEmployerCompany,
  updateEmployerCompany,
  getCompanyJobs,
  uploadCompanyMedia
} from '../lib/companyService';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  Sparkles,
  Camera,
  Edit3,
  ExternalLink,
  PlusCircle,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Loader2,
  DollarSign,
  Clock
} from 'lucide-react';

export default function CompanyProfilePage({
  onNavigate,
  onShowToast,
  onSelectJob
}) {
  const { user } = useAuth();
  const employerId = user?.id || 'employer_demo_01';

  // Company state
  const [company, setCompany] = useState({});
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // 1. Fetch Company profile & Jobs
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const comp = await getEmployerCompany(employerId);
        const jobs = await getCompanyJobs(comp.id, employerId);

        if (mounted) {
          setCompany(comp);
          setCompanyJobs(jobs);
          setEditForm(comp);
        }
      } catch (err) {
        console.error('Lỗi tải thông tin doanh nghiệp:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [employerId]);

  // 2. Upload Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const url = await uploadCompanyMedia(file, employerId, 'logo');
      const updated = { ...company, logo_url: url };
      setCompany(updated);
      setEditForm((prev) => ({ ...prev, logo_url: url }));
      await updateEmployerCompany(employerId, updated);
      if (onShowToast) onShowToast('🏢 Logo doanh nghiệp đã được cập nhật thành công!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ ' + (err.message || 'Lỗi tải logo.'));
    } finally {
      setUploadingLogo(false);
    }
  };

  // 3. Upload Cover
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await uploadCompanyMedia(file, employerId, 'cover');
      const updated = { ...company, cover_url: url };
      setCompany(updated);
      setEditForm((prev) => ({ ...prev, cover_url: url }));
      await updateEmployerCompany(employerId, updated);
      if (onShowToast) onShowToast('🎨 Ảnh bìa doanh nghiệp đã được cập nhật!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ ' + (err.message || 'Lỗi tải ảnh bìa.'));
    } finally {
      setUploadingCover(false);
    }
  };

  // 4. Save Company Details
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateEmployerCompany(employerId, editForm);
      setCompany(editForm);
      setShowEditModal(false);
      if (onShowToast) onShowToast('✨ Thông tin hồ sơ doanh nghiệp đã được lưu thành công!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ Lỗi khi lưu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Cover & Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-subtle">
        <div className="h-40 sm:h-56 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 relative overflow-hidden group">
          {company.cover_url && (
            <img
              src={company.cover_url}
              alt="Company Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-slate-900/15 group-hover:bg-slate-900/25 transition" />

          {/* Verification Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Doanh nghiệp đối tác xác thực</span>
          </div>

          {/* Change Cover Button */}
          <label className="absolute bottom-3 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
            <Camera className="w-3.5 h-3.5" />
            <span>{uploadingCover ? 'Đang tải...' : 'Đổi ảnh bìa công ty'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </label>
        </div>

        {/* Company Identity Header */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={company.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80'}
                  alt={company.company_name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                />
                <label className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                  <Camera className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {company.company_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Đã xác minh MST & Hồ sơ
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{company.industry}</span>
                  <span className="text-slate-300">•</span>
                  <span>Quy mô: {company.company_size}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-md">{company.location}</span>
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => setShowPublicModal(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Xem trang công khai</span>
              </button>

              <button
                onClick={() => {
                  setEditForm({ ...company });
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>

          {/* Visibility Banner */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {company.description || 'Chưa cập nhật thông tin mô tả văn hóa và lĩnh vực hoạt động của công ty.'}
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                {company.is_public !== false ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-600" />
                )}
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block">
                    {company.is_public !== false ? 'Hồ sơ Công ty Công khai' : 'Hồ sơ Công ty Riêng tư'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {company.is_public !== false ? 'Sinh viên có thể tìm thấy trên sàn' : 'Chỉ hiển thị cho người tạo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Info & Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Thông tin liên hệ & Pháp lý
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold truncate"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{company.contact_email || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{company.contact_phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Năm thành lập: {company.founded_year || '2020'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Quy mô: {company.company_size || '10 - 50 nhân viên'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Post Job */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white space-y-3 shadow-md">
            <h3 className="text-sm font-extrabold">Đăng tin tuyển dụng mới?</h3>
            <p className="text-xs text-blue-100 leading-relaxed font-normal">
              Đăng việc ngay hôm nay để kết nối với hơn 10.000+ sinh viên tài năng từ các trường Đại học tại TP.HCM.
            </p>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('post-job');
              }}
              className="w-full py-2.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo việc làm mới</span>
            </button>
          </div>
        </div>

        {/* Right Column: Published Jobs by Company */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Việc làm đang tuyển dụng ({companyJobs.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các vị trí việc làm part-time, freelance đang được hiển thị công khai trên sàn việc làm sinh viên.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onNavigate) onNavigate('post-job');
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Đăng tin</span>
              </button>
            </div>

            {companyJobs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">Công ty hiện chưa có tin tuyển dụng nào</p>
                <p className="text-[11px] text-slate-400">Hãy đăng tin đầu tiên để tiếp cận các bạn sinh viên tiềm năng!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate">
                          {job.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700">
                          {job.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Hạn: {job.deadline}
                        </span>
                      </div>

                      {Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.skills.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (onSelectJob) onSelectJob(job);
                        }}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Company Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa thông tin hồ sơ doanh nghiệp"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên doanh nghiệp / Studio <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.company_name || ''}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lĩnh vực hoạt động
              </label>
              <input
                type="text"
                value={editForm.industry || ''}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                placeholder="VD: Truyền thông, Quảng cáo, F&B, Công nghệ"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Website công ty
              </label>
              <input
                type="url"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                placeholder="https://company.vn"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email nhận hồ sơ tuyển dụng
              </label>
              <input
                type="email"
                value={editForm.contact_email || ''}
                onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại hotline
              </label>
              <input
                type="tel"
                value={editForm.contact_phone || ''}
                onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quy mô nhân sự
              </label>
              <input
                type="text"
                value={editForm.company_size || ''}
                onChange={(e) => setEditForm({ ...editForm, company_size: e.target.value })}
                placeholder="VD: 10 - 50 nhân viên"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Năm thành lập
              </label>
              <input
                type="text"
                value={editForm.founded_year || ''}
                onChange={(e) => setEditForm({ ...editForm, founded_year: e.target.value })}
                placeholder="VD: 2021"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ trụ sở / Chi nhánh làm việc
            </label>
            <input
              type="text"
              value={editForm.location || ''}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô tả doanh nghiệp & Môi trường làm việc
            </label>
            <textarea
              rows={4}
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Giới thiệu về văn hóa doanh nghiệp, chế độ đãi ngộ dành cho sinh viên..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="company_is_public"
              checked={editForm.is_public !== false}
              onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="company_is_public" className="text-xs text-slate-700 font-semibold cursor-pointer">
              Công khai hồ sơ công ty trên sàn việc làm sinh viên
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu hồ sơ công ty</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Public Company Modal */}
      <PublicCompanyModal
        isOpen={showPublicModal}
        onClose={() => setShowPublicModal(false)}
        company={company}
        jobs={companyJobs}
        onSelectJob={onSelectJob}
      />
    </div>
  );
}
