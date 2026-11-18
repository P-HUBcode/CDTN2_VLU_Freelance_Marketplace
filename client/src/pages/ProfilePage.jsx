import React, { useState, useEffect } from 'react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ProjectModal from '../components/profile/ProjectModal';
import PublicStudentProfileModal from './PublicStudentProfileModal';
import { useAuth } from '../contexts/AuthContext';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentProjects,
  createStudentProject,
  updateStudentProject,
  deleteStudentProject,
  uploadPortfolioImage
} from '../lib/profileService';
import {
  User,
  GraduationCap,
  MapPin,
  Star,
  Award,
  Briefcase,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileCheck,
  Camera,
  Globe,
  Code2,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Layers,
  Phone,
  Mail,
  Loader2,
  Upload
} from 'lucide-react';

export default function ProfilePage({
  currentUser,
  onUpdateProfile,
  onShowToast
}) {
  const { user } = useAuth();
  const activeUserId = user?.id || currentUser?.id || 'student_demo_01';

  // Profile data state
  const [profileData, setProfileData] = useState(currentUser || {});
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // null = modal đóng; {} = modal mở
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({ ...profileData });
  const [skillsInput, setSkillsInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // 1. Fetch Profile & Projects khi vào trang
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [prof, projList] = await Promise.all([
          getStudentProfile(activeUserId),
          getStudentProjects(activeUserId)
        ]);

        if (mounted) {
          setProfileData(prof);
          setProjects(projList);
          setEditForm(prof);
          setSkillsInput(Array.isArray(prof.skills) ? prof.skills.join(', ') : '');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [activeUserId]);

  // 2. Xử lý Upload Avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const url = await uploadPortfolioImage(file, activeUserId, 'avatar');
      const updated = { ...profileData, avatar_url: url };
      setProfileData(updated);
      setEditForm((prev) => ({ ...prev, avatar_url: url }));
      await updateStudentProfile(activeUserId, updated);
      if (onShowToast) onShowToast('📸 Ảnh đại diện đã được cập nhật thành công!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ ' + (err.message || 'Lỗi tải ảnh đại diện.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 3. Xử lý Upload Cover Photo
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const url = await uploadPortfolioImage(file, activeUserId, 'cover');
      const updated = { ...profileData, cover_url: url };
      setProfileData(updated);
      setEditForm((prev) => ({ ...prev, cover_url: url }));
      await updateStudentProfile(activeUserId, updated);
      if (onShowToast) onShowToast('🎨 Ảnh bìa trang cá nhân đã được cập nhật!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ ' + (err.message || 'Lỗi tải ảnh bìa.'));
    } finally {
      setUploadingCover(false);
    }
  };

  // 4. Lưu toàn bộ hồ sơ
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const parsedSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const finalPayload = {
        ...editForm,
        skills: parsedSkills
      };

      await updateStudentProfile(activeUserId, finalPayload);
      setProfileData(finalPayload);
      if (onUpdateProfile) onUpdateProfile(finalPayload);
      setShowEditModal(false);
      if (onShowToast) onShowToast('✨ Hồ sơ cá nhân đã được lưu thành công vào CSDL!');
    } catch (err) {
      if (onShowToast) onShowToast('❌ Lỗi khi lưu hồ sơ: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 5. Thao tác CRUD Portfolio
  const handleSaveProject = async (projectPayload, existingId) => {
    if (existingId) {
      const updated = await updateStudentProject(activeUserId, existingId, projectPayload);
      setProjects((prev) => prev.map((p) => (p.id === existingId ? updated : p)));
      if (onShowToast) onShowToast('🎉 Dự án đã được cập nhật!');
    } else {
      const created = await createStudentProject(activeUserId, projectPayload);
      setProjects((prev) => [created, ...prev]);
      if (onShowToast) onShowToast('🚀 Đã thêm dự án mới vào Portfolio!');
    }
  };

  const handleDeleteProject = async (projectId) => {
    await deleteStudentProject(activeUserId, projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (onShowToast) onShowToast('🗑️ Đã xóa dự án khỏi Portfolio.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Cover & Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-subtle">
        {/* Cover Banner */}
        <div className="h-36 sm:h-52 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 relative overflow-hidden group">
          {profileData.cover_url && (
            <img
              src={profileData.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/25 transition" />

          {/* Verification Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Sinh viên đã xác minh</span>
          </div>

          {/* Change Cover Button */}
          <label className="absolute bottom-3 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition">
            <Camera className="w-3.5 h-3.5" />
            <span>{uploadingCover ? 'Đang tải...' : 'Đổi ảnh bìa'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </label>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={profileData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={profileData.full_name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                />
                <label className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white">
                  <Camera className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {profileData.full_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Sinh viên tìm việc
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{profileData.university}</span>
                  <span className="text-slate-300">•</span>
                  <span>{profileData.major}</span>
                </p>

                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{profileData.location}</span>
                  <span className="text-slate-300">•</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Tốt nghiệp: {profileData.graduation_year || '2026'}</span>
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Xem trước</span>
              </button>

              <button
                onClick={() => {
                  setEditForm({ ...profileData });
                  setSkillsInput(Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '');
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>

          {/* Visibility & Bio Highlights */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {profileData.bio || 'Chưa cập nhật phần giới thiệu bản thân.'}
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profileData.is_public ? (
                  <Unlock className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-600" />
                )}
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block">
                    {profileData.is_public ? 'Hồ sơ Công khai' : 'Hồ sơ Riêng tư'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {profileData.is_public ? 'Doanh nghiệp có thể tìm thấy bạn' : 'Chỉ hiển thị khi bạn nộp đơn'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skills, Languages, Contact */}
        <div className="lg:col-span-1 space-y-6">
          {/* Skills Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Kỹ năng chuyên môn</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {profileData.skills?.length || 0} kỹ năng
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Chưa có kỹ năng. Hãy bấm Chỉnh sửa để thêm.</span>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Trình độ ngoại ngữ</span>
            </h3>

            <div className="space-y-2">
              {Array.isArray(profileData.foreign_languages) && profileData.foreign_languages.length > 0 ? (
                profileData.foreign_languages.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{item.language}</span>
                    <span className="text-slate-500 font-medium">{item.level}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">Chưa cập nhật ngoại ngữ.</span>
              )}
            </div>
          </div>

          {/* Career Goal Card */}
          {profileData.career_goals && (
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 rounded-3xl p-5 border border-indigo-100 space-y-2">
              <h3 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Mục tiêu sự nghiệp</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {profileData.career_goals}
              </p>
            </div>
          )}

          {/* Contact & Availability */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-subtle space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Thông tin chi tiết
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profileData.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profileData.availability || 'Linh hoạt theo lịch học'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portfolio Projects & Experience */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Projects Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>Dự án cá nhân / Portfolio</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Minh chứng năng lực thực tế giúp nhà tuyển dụng đánh giá trực quan kỹ năng của bạn.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm dự án</span>
              </button>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">Chưa có dự án nào trong Portfolio</p>
                <p className="text-[11px] text-slate-400">Hãy thêm dự án môn học, đồ án tốt nghiệp hoặc dự án freelance để tăng 80% cơ hội trúng tuyển!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-subtle transition flex flex-col justify-between"
                  >
                    {/* Project Image */}
                    {proj.image_url && (
                      <div className="h-36 w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={proj.image_url}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setSelectedProject(proj);
                              setIsProjectModalOpen(true);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm text-xs"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md">
                          {proj.role}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {/* Tech tags */}
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(proj.technologies) && proj.technologies.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          {proj.github_url && (
                            <a
                              href={proj.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.demo_url && (
                            <a
                              href={proj.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 ml-auto"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Demo Live →</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Experience & Certifications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-subtle space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Kinh nghiệm làm việc & Hoạt động thực tế</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {profileData.experience || 'Chưa cập nhật kinh nghiệm làm việc.'}
              </p>
            </div>

            {profileData.academic_achievements && (
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Thành tích học tập & Giải thưởng</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                  {profileData.academic_achievements}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa thông tin hồ sơ sinh viên"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trường Đại học
              </label>
              <input
                type="text"
                value={editForm.university || ''}
                onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chuyên ngành đào tạo
              </label>
              <input
                type="text"
                value={editForm.major || ''}
                onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Năm tốt nghiệp dự kiến
              </label>
              <input
                type="text"
                value={editForm.graduation_year || ''}
                onChange={(e) => setEditForm({ ...editForm, graduation_year: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={editForm.birth_date || ''}
                onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khu vực sinh sống
              </label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kỹ năng chuyên môn (cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="VD: ReactJS, Figma, Canva, Content Writing, English"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Giới thiệu bản thân
            </label>
            <textarea
              rows={3}
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mục tiêu sự nghiệp
            </label>
            <textarea
              rows={2}
              value={editForm.career_goals || ''}
              onChange={(e) => setEditForm({ ...editForm, career_goals: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kinh nghiệm làm việc & Hoạt động
            </label>
            <textarea
              rows={3}
              value={editForm.experience || ''}
              onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_public_checkbox"
              checked={editForm.is_public !== false}
              onChange={(e) => setEditForm({ ...editForm, is_public: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_public_checkbox" className="text-xs text-slate-700 font-semibold cursor-pointer">
              Công khai hồ sơ cho Nhà tuyển dụng trên sàn tìm kiếm ứng viên
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
              disabled={isSavingProfile}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu hồ sơ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProject}
        userId={activeUserId}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      {/* Public Profile Preview Modal */}
      <PublicStudentProfileModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        studentProfile={profileData}
        studentProjects={projects}
      />
    </div>
  );
}

// Custom Clock icon component helper
function Clock(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
