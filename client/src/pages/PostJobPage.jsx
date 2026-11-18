import React, { useState } from 'react';
import Badge from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createEmployerJob } from '../lib/jobService';
import { formatSalaryInput } from '../lib/currencyFormatter';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
  Bookmark,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function PostJobPage({ onPostJob, onCancel, onShowToast }) {
  const { user, profile, role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('Studio Sáng Tạo Trẻ');
  const [category, setCategory] = useState('Thiết kế đồ họa & Canva');
  const [type, setType] = useState('Part-time');
  const [workMode, setWorkMode] = useState('Remote');
  const [salary, setSalary] = useState('3.500.000 – 5.000.000đ/tháng');
  const [location, setLocation] = useState('Bình Thạnh, TP. Hồ Chí Minh (hoặc Online)');
  const [workingHours, setWorkingHours] = useState('15 - 20 giờ/tuần (Linh hoạt theo lịch học)');
  const [skillsString, setSkillsString] = useState('Canva, Photoshop, Sáng tạo');
  const [deadline, setDeadline] = useState('2026-12-30');
  const [positions, setPositions] = useState('2');
  const [description, setDescription] = useState(
    'Cần tuyển 2 bạn sinh viên nhiệt tình, có gu thẩm mỹ tốt để hỗ trợ thiết kế banner truyền thông cho các chiến dịch ra mắt sản phẩm mới.'
  );

  const skillsList = skillsString
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề công việc.');
      return;
    }

    // Phân tích mức lương (VNĐ)
    let minSal = 3500000;
    let maxSal = 5000000;
    const numMatches = salary.replace(/\./g, '').match(/\d+/g);
    if (numMatches && numMatches.length >= 2) {
      minSal = parseInt(numMatches[0], 10);
      maxSal = parseInt(numMatches[1], 10);
    } else if (numMatches && numMatches.length === 1) {
      minSal = parseInt(numMatches[0], 10);
      maxSal = minSal;
    }

    // Chuẩn hóa ngày deadline
    let isoDeadline = deadline;
    if (deadline && deadline.includes('/')) {
      const parts = deadline.split('/');
      if (parts.length === 3) {
        isoDeadline = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    if (!isoDeadline) {
      isoDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const jobPayload = {
      title,
      company_name: company || profile?.full_name || 'Doanh nghiệp VLU',
      job_type: type,
      work_mode: workMode,
      location: location || 'TP. Hồ Chí Minh',
      salary_min: minSal,
      salary_max: maxSal,
      working_hours: workingHours,
      skills: skillsList.length ? skillsList : ['Canva', 'Sáng tạo'],
      description,
      requirements: [
        'Là sinh viên các trường đại học tại TP.HCM.',
        'Có laptop cá nhân và tinh thần trách nhiệm cao.',
        description
      ],
      benefits: [
        'Thù lao cạnh tranh, nhận minh bạch qua ví bảo đảm.',
        'Hỗ trợ dấu mộc thực tập tốt nghiệp cho sinh viên năm 3, năm 4.',
        'Lịch làm việc linh hoạt theo thời khóa biểu học tập.'
      ],
      deadline: isoDeadline,
      status: 'published'
    };

    try {
      setIsSubmitting(true);

      // 1. Kiểm tra xác thực tài khoản (Supabase Auth Cloud hoặc Tài khoản Nhà tuyển dụng trong phiên làm việc)
      let activeUser = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) activeUser = authUser;
      } catch (err) {
        // ignore
      }
      if (!activeUser && user) {
        activeUser = user;
      }

      if (!activeUser) {
        setErrorMessage('Bạn cần đăng nhập để đăng tin tuyển dụng.');
        setIsSubmitting(false);
        return;
      }

      const activeRole =
        (role && role !== 'authenticated' ? role : null) ||
        activeUser?.user_metadata?.role ||
        (profile?.role && profile.role !== 'authenticated' ? profile.role : null) ||
        (activeUser?.role && activeUser.role !== 'authenticated' ? activeUser.role : null) ||
        'employer';

      if (activeRole === 'student') {
        setErrorMessage('Tài khoản Sinh viên không được đăng tin tuyển dụng việc làm. Sinh viên có thể tạo gói dịch vụ kỹ năng của mình tại mục "Thuê dịch vụ sinh viên (Freelance)"!');
        setIsSubmitting(false);
        return;
      }

      // 2. Gửi tạo tin tuyển dụng của Nhà tuyển dụng (Supabase PostgreSQL / Local Persistent Storage / Express Backend Server)
      const createdJob = await createEmployerJob(jobPayload, activeUser);

      if (onPostJob) {
        await onPostJob(createdJob);
      }
      if (onShowToast) {
        onShowToast('🎉 Tin tuyển dụng đã được lưu thành công vào hệ thống và công khai trên Marketplace!');
      }
    } catch (err) {
      console.error('Lỗi khi đăng tin tuyển dụng:', err);
      setErrorMessage(err.message || 'Không thể lưu tin vào cơ sở dữ liệu Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Đăng tin tuyển dụng việc làm sinh viên
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tiếp cận hàng nghìn sinh viên năng động, trách nhiệm và có kỹ năng tốt từ các trường đại học hàng đầu.
        </p>
      </div>

      {/* 2-Column: Form (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post Job Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5"
        >
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vd: Thiết kế Canva & Social Media Part-time"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition font-medium"
              required
            />
          </div>

          {/* Company & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tên Doanh nghiệp / Đơn vị
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nhóm ngành nghề
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="Thiết kế đồ họa & Canva">Thiết kế đồ họa & Canva</option>
                <option value="Lập trình Web & Mobile">Lập trình Web & Mobile (Frontend/React)</option>
                <option value="Sáng tạo nội dung & TikTok">Sáng tạo nội dung & TikTok</option>
                <option value="Gia sư & Trợ giảng">Gia sư & Trợ giảng</option>
                <option value="Phục vụ & Barista Part-time">Phục vụ & Barista Part-time</option>
                <option value="Chụp ảnh & Media">Chụp ảnh & Media</option>
              </select>
            </div>
          </div>

          {/* Job Type & Work Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Hình thức công việc
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="Part-time">Part-time (Bán thời gian)</option>
                <option value="Freelance">Freelance (Theo sản phẩm/dự án)</option>
                <option value="Internship">Thực tập sinh (Internship)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Địa điểm làm việc
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              >
                <option value="Remote">Online / Remote (Tại nhà)</option>
                <option value="Onsite">Tại văn phòng / Cửa hàng</option>
                <option value="Hybrid">Hybrid (Linh hoạt kết hợp)</option>
              </select>
            </div>
          </div>

          {/* Salary & Working Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Mức thù lao / Ngân sách (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Tự động chèn dấu chấm (.)
                </span>
              </div>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                onBlur={(e) => setSalary(formatSalaryInput(e.target.value, false))}
                placeholder="Vd: Nhập 9000000 sẽ tự thành 9.000.000"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-semibold text-blue-600"
                required
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Nhập số rồi click ra ngoài sẽ tự định dạng dấu chấm</span>
                <div className="flex items-center gap-1">
                  {['3.000.000', '5.000.000', '9.000.000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSalary(val)}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded text-[10px] font-semibold transition"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Thời gian làm việc
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="Vd: 15 - 20 giờ/tuần (Linh hoạt theo lịch học)"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Location & Positions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Khu vực / Địa chỉ
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Số lượng cần tuyển
              </label>
              <input
                type="number"
                value={positions}
                onChange={(e) => setPositions(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                min="1"
              />
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Kỹ năng yêu cầu (cách nhau bởi dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="Canva, TikTok, Viết lách, Photoshop..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Mô tả chi tiết công việc <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none leading-relaxed"
              required
            />
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Đang lưu vào CSDL...' : 'Đăng công việc'}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Xem trước Job Card (Live Preview)</span>
          </div>

          {/* Rendered Job Card */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-5 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {company.charAt(0)}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={workMode === 'Remote' ? 'primary' : 'neutral'} size="sm">
                  {workMode}
                </Badge>
                <Badge variant="outline" size="sm">
                  {type}
                </Badge>
                <div className="p-1.5 text-slate-300">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                {title || 'Tiêu đề công việc sẽ hiển thị tại đây'}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {company} • <span className="text-blue-600 font-semibold">Đã xác thực</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-400 block font-medium">Mức thù lao</span>
              <span className="text-sm font-extrabold text-blue-600">
                {salary || 'Thỏa thuận'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Cần tuyển {positions} vị trí</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Vừa đăng</span>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl"
              >
                Ứng tuyển ngay →
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Tin đăng của bạn sẽ ngay lập tức được gửi thông báo đến các bạn sinh viên có kỹ năng khớp với yêu cầu!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
