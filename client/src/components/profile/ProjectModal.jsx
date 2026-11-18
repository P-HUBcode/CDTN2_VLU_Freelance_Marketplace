import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { uploadPortfolioImage } from '../../lib/profileService';
import {
  FolderPlus,
  Edit3,
  Trash2,
  Upload,
  Link,
  Code2,
  Globe,
  Layers,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProjectModal({
  isOpen,
  onClose,
  project = null, // null = Thêm mới, object = Chỉnh sửa
  userId,
  onSave,
  onDelete
}) {
  const isEditing = Boolean(project && project.id);

  const [formData, setFormData] = useState({
    title: '',
    role: '',
    description: '',
    technologies: '',
    github_url: '',
    demo_url: '',
    start_date: '',
    end_date: '',
    image_url: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        role: project.role || '',
        description: project.description || '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || ''),
        github_url: project.github_url || '',
        demo_url: project.demo_url || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        image_url: project.image_url || ''
      });
    } else {
      setFormData({
        title: '',
        role: 'Frontend Developer',
        description: '',
        technologies: 'ReactJS, Tailwind CSS, Figma',
        github_url: '',
        demo_url: '',
        start_date: '01/2026',
        end_date: 'Hiện tại',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'
      });
    }
    setErrorMsg('');
  }, [project, isOpen]);

  // Xử lý upload ảnh dự án
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMsg('');
      const uploadedUrl = await uploadPortfolioImage(file, userId || 'student', 'project_cover');
      setFormData((prev) => ({ ...prev, image_url: uploadedUrl }));
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi tải ảnh lên storage.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Vui lòng nhập tên dự án.');
      return;
    }

    try {
      setSubmitting(true);
      const techList = formData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        technologies: techList
      };

      await onSave(payload, project?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi khi lưu dự án.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa dự án Portfolio' : 'Thêm dự án cá nhân mới'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Project Cover Image */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Hình ảnh minh họa dự án
          </label>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
            {formData.image_url ? (
              <img
                src={formData.image_url}
                alt="Project preview"
                className="w-full h-44 object-cover"
              />
            ) : (
              <div className="w-full h-44 flex flex-col items-center justify-center text-slate-400">
                <FolderPlus className="w-10 h-10 mb-2 text-slate-300" />
                <span className="text-xs">Chưa có ảnh dự án</span>
              </div>
            )}

            <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white gap-2">
              <Upload className="w-6 h-6" />
              <span className="text-xs font-semibold">
                {uploadingImage ? 'Đang tải lên...' : 'Nhấp để thay đổi ảnh'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Title & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên dự án <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: StudentHub — Sàn việc làm"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Vai trò trong dự án
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="VD: UI/UX Designer, Frontend Dev"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Công nghệ / Kỹ năng sử dụng (ngăn cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="VD: ReactJS, Tailwind CSS, Supabase, Figma"
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Start / End Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thời gian bắt đầu
            </label>
            <input
              type="text"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              placeholder="VD: 09/2025"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thời gian kết thúc
            </label>
            <input
              type="text"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              placeholder="VD: 11/2026 hoặc Hiện tại"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Links: Github & Demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-slate-600" />
              Link Mã nguồn (GitHub)
            </label>
            <input
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              Link Trải nghiệm (Demo Live)
            </label>
            <input
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://myproject.demo.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mô tả chi tiết sản phẩm & đóng góp của bạn
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nêu vắn tắt mục tiêu của dự án, các tính năng nổi bật và những kết quả đạt được..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {isEditing && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa dự án này khỏi Portfolio?')) {
                  onDelete(project.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa dự án</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Lưu thay đổi' : 'Thêm vào Portfolio'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
