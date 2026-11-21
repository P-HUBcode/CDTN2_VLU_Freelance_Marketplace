import React, { useState, useRef } from 'react';
import Modal from '../components/common/Modal';
import { formatSalaryInput } from '../lib/currencyFormatter';
import {
  Upload,
  FileText,
  CheckCircle2,
  Link2,
  DollarSign,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default function ApplyModal({ isOpen, onClose, job, onSubmit, currentUser, user, profile, studentProfile }) {
  const hasSavedCv = Boolean(studentProfile?.cv_url || currentUser?.cv_url);
  const [cvOption, setCvOption] = useState(hasSavedCv ? 'existing' : 'upload'); // 'existing' | 'upload'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const savedCvUrl = studentProfile?.cv_url || currentUser?.cv_url || '';
  const savedCvName = savedCvUrl ? savedCvUrl.split('/').pop().replace(/^\d+_/, '') : '';

  const defaultEmail = user?.email || profile?.email || studentProfile?.email || currentUser?.email || '';
  const defaultName = profile?.full_name || studentProfile?.full_name || user?.user_metadata?.full_name || currentUser?.name || '';
  const studentUniversity = studentProfile?.university || profile?.university || currentUser?.university || 'Đại học tại TP.HCM';
  const studentPhone = profile?.phone || studentProfile?.phone || user?.user_metadata?.phone || currentUser?.phone || 'Chưa cập nhật';

  const [applicantEmail, setApplicantEmail] = useState(defaultEmail);
  const [applicantName, setApplicantName] = useState(defaultName);

  const [portfolioLink, setPortfolioLink] = useState(studentProfile?.portfolio_url || studentProfile?.website || '');
  const [coverLetter, setCoverLetter] = useState(
    `Em chào Quý công ty,\nEm là ${defaultName || 'sinh viên'}, sinh viên tại ${studentUniversity}. Em đã xem kỹ yêu cầu công việc "${job?.title || ''}" và nhận thấy kinh nghiệm, kỹ năng của mình rất phù hợp. Em có thể sắp xếp thời gian làm việc linh hoạt theo thời khóa biểu học tập và cam kết hoàn thành đúng hạn các deadline được giao.`
  );
  const [expectedSalary, setExpectedSalary] = useState(job?.salary || '3.500.000 – 5.000.000đ/tháng');
  const [startDate, setStartDate] = useState('Ngay khi được duyệt');
  const [availableHours, setAvailableHours] = useState('18 - 20 giờ/tuần (Linh hoạt theo ca học)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;

    const allowed = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setFileError('Chỉ chấp nhận file định dạng .PDF, .DOC, .DOCX');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError('Dung lượng file vượt quá giới hạn 10MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setCvOption('upload');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cvOption === 'upload' && !selectedFile) {
      setErrorMessage('Vui lòng chọn hoặc tải lên file CV từ máy tính của bạn.');
      return;
    }

    if (!coverLetter.trim()) {
      setErrorMessage('Vui lòng viết lời giới thiệu bản thân trước khi nộp hồ sơ.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          companyLogo: job.companyLogo,
          coverLetter: coverLetter.trim(),
          cvFile: cvOption === 'upload' ? selectedFile : null,
          existingCvUrl: savedCvUrl,
          expectedSalary,
          availableHours,
          portfolioLink,
          studentId: user?.id || currentUser?.id,
          studentEmail: applicantEmail.trim(),
          studentName: applicantName.trim()
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi nộp hồ sơ ứng tuyển:', err);
      setErrorMessage(err.message || 'Không thể lưu hồ sơ ứng tuyển vào cơ sở dữ liệu Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ứng tuyển: ${job.title}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Job Mini Summary */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{job.title}</h4>
            <p className="text-[11px] text-slate-500 truncate">{job.company} • <span className="font-semibold text-blue-600">{job.salary}</span></p>
          </div>
        </div>

        {/* Student Autofill Info */}
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate"><strong>Họ tên:</strong> {applicantName || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate"><strong>SĐT:</strong> {studentPhone}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate"><strong>Trường:</strong> {studentUniversity}</span>
          </div>
        </div>

        {/* Email nhận thông báo kết quả qua Gmail */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-amber-900 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>Email nhận kết quả & thư mời phỏng vấn:</span>
            </label>
            <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">Tự động gửi mail</span>
          </div>
          <input
            type="email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            placeholder="vd: sinhvien@gmail.com"
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
          <p className="text-[11px] text-amber-800 leading-tight">
            🛡️ Hệ thống StudentHub sẽ tự động gửi email xác nhận nộp hồ sơ, lịch phỏng vấn và thông báo trúng tuyển đến hòm thư này.
          </p>
        </div>

        {/* CV Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            1. Hồ sơ năng lực (CV) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!hasSavedCv}
              onClick={() => {
                if (hasSavedCv) {
                  setCvOption('existing');
                  setFileError('');
                }
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                !hasSavedCv
                  ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed text-slate-400'
                  : cvOption === 'existing'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileText className={`w-5 h-5 shrink-0 ${hasSavedCv ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <span className="text-xs font-bold block truncate">
                  {hasSavedCv ? savedCvName : 'Chưa có CV trong hồ sơ'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {hasSavedCv ? 'CV đã lưu trong hồ sơ' : 'Vui lòng tải file mới bên cạnh'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                cvOption === 'upload'
                  ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Upload className="w-5 h-5 text-slate-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block truncate">
                  {selectedFile ? selectedFile.name : 'Tải file CV mới (.pdf, .docx)'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB • Bấm để đổi` : 'Tối đa 10MB'}
                </span>
              </div>
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
          </div>
          {fileError && <p className="text-[11px] text-rose-600 mt-1">{fileError}</p>}
        </div>

        {/* Portfolio Link */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-400" />
            <span>2. Portfolio / Link dự án đã làm</span>
          </label>
          <input
            type="url"
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
            placeholder="https://behance.net/your-work hoặc Google Drive, GitHub..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            3. Thư giới thiệu bản thân & Lý do ứng tuyển <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition leading-relaxed font-normal"
            placeholder="Giới thiệu điểm mạnh, kinh nghiệm liên quan và cam kết của bạn..."
            required
          />
        </div>

        {/* 2-Col for salary & availability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>Mức thù lao mong muốn</span>
              </label>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                Tự thêm (.)
              </span>
            </div>
            <input
              type="text"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(e.target.value)}
              onBlur={(e) => setExpectedSalary(formatSalaryInput(e.target.value, false))}
              placeholder="Vd: Nhập 9000000 sẽ tự thành 9.000.000"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition font-semibold text-blue-700"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Nhập số và bấm ra ngoài để tự động định dạng hàng nghìn (ví dụ: 9.000.000đ).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian có thể bắt đầu</span>
            </label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Thời gian / Khung giờ có thể làm việc</span>
          </label>
          <input
            type="text"
            value={availableHours}
            onChange={(e) => setAvailableHours(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span>Đang gửi hồ sơ vào hệ thống...</span>
            ) : (
              <span>Gửi hồ sơ ứng tuyển</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
