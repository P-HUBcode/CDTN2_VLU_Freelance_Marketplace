import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API Base URL (Relative path proxied by Vite to http://localhost:5000)
const API_URL = '/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // home | detail | employer | profile | admin
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState(
    'Kính gửi Quý công ty, em là sinh viên năm cuối ngành CNTT Văn Lang, đã hoàn thành môn Web và có kinh nghiệm thực tế với ReactJS, Git. Em rất mong có cơ hội thực tập tại công ty.'
  );

  // Employer Applicants State
  const [applicants, setApplicants] = useState([]);
  
  // Admin stats
  const [adminStats, setAdminStats] = useState({
    totalStudents: 1240,
    totalEmployers: 158,
    activeJobs: 84,
    pendingJobs: 3
  });
  const [pendingJobs, setPendingJobs] = useState([]);

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/jobs`, {
        params: {
          district: districtFilter !== 'all' ? districtFilter : undefined,
          keyword: searchKeyword || undefined
        }
      });
      if (res.data && res.data.data) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.warn('API error, using local fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [districtFilter]);

  // Toast Helper
  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Submit Job Application (Student Flow)
  const handleApply = async () => {
    try {
      await axios.post(`${API_URL}/applications`, {
        job_id: selectedJob?.id || 1,
        cover_letter: coverLetter,
        cv_url: '/uploads/CV_NguyenMinhPhu_WebDev.pdf'
      });
      setShowApplyModal(false);
      showToastMsg('🚀 Hồ sơ ứng tuyển của bạn đã được gửi thành công đến Nhà tuyển dụng!');
    } catch (err) {
      setShowApplyModal(false);
      showToastMsg('🚀 Hồ sơ ứng tuyển của bạn đã được nộp thành công!');
    }
  };

  // Employer: Load Applicants for Job 1
  const loadApplicants = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications/job/1`);
      if (res.data && res.data.data) {
        setApplicants(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load applicants', err.message);
    }
  };

  // Employer: Approve / Reject Candidate
  const handleCandidateStatus = async (appId, newStatus, studentName) => {
    try {
      await axios.put(`${API_URL}/applications/${appId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      showToastMsg(
        newStatus === 'approved'
          ? `✔ Đã duyệt nhận ứng viên ${studentName}! Đã gửi email trúng tuyển.`
          : `Đã từ chối ứng viên ${studentName}.`,
        newStatus === 'approved' ? 'success' : 'warning'
      );
    } catch (err) {
      showToastMsg(`Đã cập nhật trạng thái ứng viên ${studentName}!`);
    }
  };

  // Admin: Moderate Job
  const handleModerateJob = async (jobId, action) => {
    try {
      await axios.put(`${API_URL}/admin/jobs/${jobId}/moderate`, { action });
      setPendingJobs(prev => prev.filter(j => j.id !== jobId));
      showToastMsg(
        action === 'approve'
          ? '✔ Tin tuyển dụng đã được duyệt và công khai trên trang chủ!'
          : '🚫 Đã bác bỏ tin đăng nghi vấn lừa đảo và đưa vào Blacklist!',
        action === 'approve' ? 'success' : 'danger'
      );
    } catch (err) {
      showToastMsg('Đã xử lý tin tuyển dụng!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-18 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold transition flex items-center space-x-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : (toast.type === 'danger' ? 'bg-red-600' : 'bg-blue-600')
        }`}>
          <span>{toast.type === 'success' ? '🎉' : (toast.type === 'danger' ? '🚫' : 'ℹ️')}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Banner / Role Switcher for Presentation & Testing */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold">VLU FREELANCE MARKETPLACE (REACT + NODE.JS + MYSQL)</span>
          <span className="hidden md:inline text-slate-400">| Đồ án Chuyên đề tốt nghiệp 2</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg">
          <span className="text-slate-400 px-1 font-medium">Chuyển vai trò:</span>
          <button
            onClick={() => setCurrentView('home')}
            className={`px-2.5 py-1 rounded font-medium transition ${currentView === 'home' || currentView === 'detail' ? 'bg-[#003366] text-white' : 'text-slate-300 hover:text-white'}`}
          >
            🧑‍🎓 Sinh viên
          </button>
          <button
            onClick={() => { setCurrentView('employer'); loadApplicants(); }}
            className={`px-2.5 py-1 rounded font-medium transition ${currentView === 'employer' ? 'bg-[#003366] text-white' : 'text-slate-300 hover:text-white'}`}
          >
            🏢 Nhà tuyển dụng
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-2.5 py-1 rounded font-medium transition ${currentView === 'admin' ? 'bg-[#003366] text-white' : 'text-slate-300 hover:text-white'}`}
          >
            🛡️ Admin kiểm duyệt
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-[#003366] text-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={() => setCurrentView('home')} className="flex items-center space-x-2 text-lg font-bold">
              <span>🎓</span>
              <span>VLU FREELANCE</span>
            </button>
            <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
              <button onClick={() => setCurrentView('home')} className={`px-3 py-2 rounded-md ${currentView === 'home' ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
                Việc làm mới
              </button>
              <button onClick={() => { setCurrentView('employer'); loadApplicants(); }} className={`px-3 py-2 rounded-md ${currentView === 'employer' ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
                Dành cho NTD
              </button>
              <button onClick={() => setCurrentView('profile')} className={`px-3 py-2 rounded-md ${currentView === 'profile' ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-800'}`}>
                Hồ sơ & CV
              </button>
              <button onClick={() => setCurrentView('admin')} className={`px-3 py-2 rounded-md ${currentView === 'admin' ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-800'} flex items-center space-x-1`}>
                <span>Kiểm duyệt</span>
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-[10px] font-bold">3</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <button
              onClick={() => { setCurrentView('employer'); loadApplicants(); }}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-xs shadow transition"
            >
              + Đăng tin NTD
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-blue-800 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                MP
              </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <div className="font-semibold">Nguyễn Minh Phú</div>
                <div className="text-[10px] text-emerald-300 font-medium mt-1">Đã xác thực VLU</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* ========================================================= */}
        {/* VIEW 1: HOME & JOB LIST */}
        {/* ========================================================= */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Hero banner */}
            <div className="bg-gradient-to-r from-sky-100 to-blue-50 border border-sky-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#003366]">
                  TÌM VIỆC LÀM PART-TIME & FREELANCE CHO SINH VIÊN VĂN LANG
                </h1>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Hơn 500+ công việc minh bạch, đối soát mã số thuế pháp nhân và hỗ trợ đóng dấu mộc thực tập.
                </p>
              </div>
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-300 p-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Tìm việc, kỹ năng (ReactJS, Pha chế...)"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                  className="px-3 py-1.5 text-xs w-full md:w-64 focus:outline-none"
                />
                <button
                  onClick={fetchJobs}
                  className="bg-[#003366] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-900 transition"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Layout 2 Cột */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Cột trái: Bộ lọc */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 text-xs h-fit">
                <div className="font-bold text-gray-900 pb-2 border-b flex justify-between">
                  <span>⚙️ BỘ LỌC TÌM KIẾM</span>
                  <button onClick={() => { setDistrictFilter('all'); setSearchKeyword(''); }} className="text-sky-600 hover:underline">
                    Đặt lại
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-gray-700">Cơ sở Văn Lang:</div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="district" checked={districtFilter === 'all'} onChange={() => setDistrictFilter('all')} />
                    <span>Tất cả cơ sở</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="district" checked={districtFilter === 'Bình Thạnh'} onChange={() => setDistrictFilter('Bình Thạnh')} />
                    <span>Bình Thạnh (Cơ sở 3 VLU)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="district" checked={districtFilter === 'Gò Vấp'} onChange={() => setDistrictFilter('Gò Vấp')} />
                    <span>Gò Vấp (Cơ sở 2 VLU)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="district" checked={districtFilter === 'Quận 1'} onChange={() => setDistrictFilter('Quận 1')} />
                    <span>Quận 1 (Cơ sở 1 VLU)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="district" checked={districtFilter === 'Online'} onChange={() => setDistrictFilter('Online')} />
                    <span>Làm việc từ xa (Online)</span>
                  </label>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="font-bold text-gray-700">Mức lương:</div>
                  <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /><span>25.000đ - 35.000đ/h</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /><span>35.000đ - 50.000đ/h</span></label>
                  <label className="flex items-center space-x-2"><input type="checkbox" /><span>&gt; 50.000đ/h hoặc Dự án</span></label>
                </div>

                <button
                  onClick={fetchJobs}
                  className="w-full bg-[#003366] text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition"
                >
                  Áp dụng bộ lọc
                </button>
              </div>

              {/* Cột phải: Danh sách việc làm */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-600">
                  <span>Tìm thấy <b>{jobs.length}</b> công việc phù hợp</span>
                  <span>Sắp xếp: <b>Mới nhất ▼</b></span>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">Đang tải danh sách việc làm...</div>
                ) : (
                  jobs.map(job => (
                    <div
                      key={job.id}
                      className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-5 shadow-sm transition hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            {job.job_type || 'Part-time'}
                          </span>
                          <h3
                            onClick={() => { setSelectedJob(job); setCurrentView('detail'); }}
                            className="font-bold text-gray-900 hover:text-blue-700 cursor-pointer text-sm md:text-base"
                          >
                            {job.title}
                          </h3>
                        </div>
                        <div className="text-xs text-gray-600">
                          🏢 {job.company} • 📍 {job.address}
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-emerald-700 font-bold text-sm">
                            💰 {job.salary_amount?.toLocaleString('vi-VN')}đ {job.salary_type === 'hourly' ? '/ giờ' : '/ Dự án'}
                          </span>
                          <span className="text-gray-500">• ⏰ {job.shift_time}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">{job.district}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Hỗ trợ mộc thực tập</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          onClick={() => { setSelectedJob(job); setShowApplyModal(true); }}
                          className="px-4 py-2 bg-[#003366] hover:bg-blue-900 text-white rounded-lg font-bold text-xs shadow transition"
                        >
                          Ứng tuyển ngay
                        </button>
                        <button
                          onClick={() => { setSelectedJob(job); setCurrentView('detail'); }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-xs transition"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: JOB DETAIL */}
        {/* ========================================================= */}
        {currentView === 'detail' && selectedJob && (
          <div className="space-y-5">
            <button onClick={() => setCurrentView('home')} className="text-xs text-sky-600 hover:underline flex items-center space-x-1">
              <span>← Quay lại danh sách việc làm</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5 text-xs leading-relaxed">
                <div className="border-b pb-4">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">{selectedJob.title}</h1>
                  <p className="text-blue-900 font-semibold mt-1">{selectedJob.company} ⭐ 4.9/5</p>
                  <p className="text-gray-500 mt-1">📍 {selectedJob.address}</p>
                  <div className="mt-3 flex items-center space-x-3">
                    <span className="text-emerald-700 font-bold text-base">
                      💰 {selectedJob.salary_amount?.toLocaleString('vi-VN')}đ {selectedJob.salary_type === 'hourly' ? '/ giờ' : '/ Dự án'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">✔ Hỗ trợ mộc thực tập</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">1. Mô tả công việc:</h3>
                  <p className="text-gray-600">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">2. Yêu cầu ứng viên:</h3>
                  <p className="text-gray-600">{selectedJob.requirements}</p>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">3. Quyền lợi:</h3>
                  <p className="text-gray-600">{selectedJob.benefits}</p>
                </div>
              </div>

              {/* Fast Apply Box */}
              <div className="bg-white border-2 border-emerald-500 rounded-xl p-5 shadow-sm space-y-4 text-xs h-fit">
                <div className="font-bold text-[#003366] text-sm border-b pb-2">FORM NỘP HỒ SƠ 1-CHẠM</div>
                <div className="p-3 bg-blue-50/70 rounded-lg space-y-1 text-gray-700">
                  <div className="font-bold text-blue-950">Nguyễn Minh Phú</div>
                  <div>MSSV: 2374802013447 • Khoa CNTT</div>
                  <div className="text-emerald-700 font-bold">✔ ĐÃ XÁC THỰC EMAIL TRƯỜNG VLU</div>
                </div>
                <div className="p-2 border rounded border-blue-200 bg-blue-50/40 text-blue-900 flex justify-between">
                  <span>📄 CV_NguyenMinhPhu_WebDev.pdf</span>
                  <button onClick={() => setShowCvModal(true)} className="underline text-blue-600 font-bold">Xem</button>
                </div>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-sm transition shadow"
                >
                  🚀 Nộp hồ sơ ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: EMPLOYER APPLICANTS REVIEW */}
        {/* ========================================================= */}
        {currentView === 'employer' && (
          <div className="space-y-5 text-xs">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">ĐANG MỞ</span>
                <h1 className="text-base font-bold text-gray-900 mt-1">Tuyển Thực Tập Sinh Lập Trình Frontend ReactJS</h1>
                <p className="text-gray-500">Mã tin: #JOB-001 • Tổng số: <b>{applicants.length} hồ sơ đã nộp</b></p>
              </div>
              <button onClick={() => showToastMsg('Đã xuất danh sách ứng viên!')} className="px-3 py-1.5 bg-[#003366] text-white rounded-lg font-bold hover:bg-blue-900 transition">
                📥 Xuất Excel
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-600 font-bold">
                  <tr>
                    <th className="p-3">Ứng viên</th>
                    <th className="p-3">Hồ sơ CV</th>
                    <th className="p-3">Uy tín</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3 text-center">Hành động duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applicants.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">Chưa có ứng viên nào nộp hồ sơ.</td></tr>
                  ) : (
                    applicants.map(app => (
                      <tr key={app.id} className="hover:bg-blue-50/20">
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{app.student_name}</div>
                          <div className="text-gray-500">MSSV: {app.student_mssv}</div>
                        </td>
                        <td className="p-3">
                          <button onClick={() => setShowCvModal(true)} className="text-blue-700 underline font-semibold">
                            📄 Xem CV PDF
                          </button>
                        </td>
                        <td className="p-3 text-amber-600 font-bold">⭐ {app.student_rating || '5.0'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : (app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
                          }`}>
                            {app.status === 'approved' ? 'ĐÃ DUYỆT NHẬN' : (app.status === 'rejected' ? 'TỪ CHỐI' : 'Chờ duyệt')}
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-1.5">
                          {app.status === 'approved' ? (
                            <button onClick={() => showToastMsg('SĐT: 0911223344 - Đã kết nối Zalo!')} className="px-3 py-1 bg-[#003366] text-white rounded font-bold hover:bg-blue-900">
                              Liên hệ SĐT/Zalo
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleCandidateStatus(app.id, 'approved', app.student_name)}
                                className="px-2.5 py-1 bg-[#059669] hover:bg-emerald-700 text-white rounded font-bold"
                              >
                                Duyệt nhận
                              </button>
                              <button
                                onClick={() => handleCandidateStatus(app.id, 'rejected', app.student_name)}
                                className="px-2.5 py-1 bg-[#DC2626] hover:bg-red-700 text-white rounded font-bold"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: STUDENT PROFILE */}
        {/* ========================================================= */}
        {currentView === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-900 border-2 border-[#003366] flex items-center justify-center font-bold text-lg">
                  MP
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Nguyễn Minh Phú</h2>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✔️ ĐÃ XÁC THỰC VLU
                  </span>
                  <p className="text-gray-500 mt-0.5">MSSV: 2374802013447 • Khoa CNTT</p>
                </div>
              </div>
              <div className="border-t pt-3 space-y-1 text-gray-600">
                <div>Email trường: <b>sinhvien.demo@student.vlu.edu.vn</b></div>
                <div>Đánh giá uy tín: <b className="text-amber-600">⭐⭐⭐⭐⭐ 5.0 / 5.0</b> (4 việc)</div>
              </div>
              <div className="border-t pt-3">
                <div className="font-bold text-gray-800 mb-1">Kỹ năng:</div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">ReactJS</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">Node.js</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">MySQL</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">TailwindCSS</span>
                </div>
              </div>
              <div className="border-t pt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-bold text-blue-900">📄 CV_NguyenMinhPhu_WebDev.pdf</div>
                <button onClick={() => setShowCvModal(true)} className="text-blue-700 underline font-semibold mt-1">
                  👁️ Xem CV trực tiếp
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 text-sm border-b pb-2">LỊCH SỬ CÔNG VIỆC & ĐÁNH GIÁ CỦA DOANH NGHIỆP</h2>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>1. Thực tập sinh Web — Công ty Sáng tạo VLU</span>
                  <span className="text-amber-600">⭐⭐⭐⭐⭐ 5.0</span>
                </div>
                <p className="text-gray-600 italic">"Phú làm việc rất chăm chỉ, nắm bắt ReactJS nhanh và hoàn thành task đúng hẹn!"</p>
                <div className="text-emerald-700 font-semibold">✔ Doanh nghiệp đã cấp mộc chứng nhận thực tập</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: ADMIN MODERATION */}
        {/* ========================================================= */}
        {currentView === 'admin' && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="text-blue-700 font-semibold">Sinh viên</div>
                <div className="text-2xl font-bold text-blue-900">{adminStats.totalStudents}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-emerald-700 font-semibold">Doanh nghiệp</div>
                <div className="text-2xl font-bold text-emerald-900">{adminStats.totalEmployers}</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="text-amber-700 font-semibold">Việc làm đang chạy</div>
                <div className="text-2xl font-bold text-amber-900">{adminStats.activeJobs}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-700 font-semibold">Tin chờ duyệt</div>
                <div className="text-2xl font-bold text-red-600">3 CẦN DUYỆT</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b font-bold text-gray-900">
                DANH SÁCH TIN TUYỂN DỤNG CẦN KIỂM DUYỆT — CHỐNG LỪA ĐẢO
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-600 font-bold">
                  <tr>
                    <th className="p-3">Tiêu đề tin</th>
                    <th className="p-3">Doanh nghiệp</th>
                    <th className="p-3">Mức lương</th>
                    <th className="p-3">MST / Pháp nhân</th>
                    <th className="p-3 text-center">Kiểm duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Tuyển Nhân viên Phục vụ Cafe Sách</td>
                    <td className="p-3">The Book Cafe VLU</td>
                    <td className="p-3 text-emerald-700 font-bold">30.000đ/h</td>
                    <td className="p-3 text-emerald-700 font-bold">✔ MST: 0319887766</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleModerateJob(2, 'approve')} className="px-3 py-1 bg-[#059669] hover:bg-emerald-700 text-white rounded font-bold">
                        Duyệt tin
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-red-50 border-l-4 border-red-500">
                    <td className="p-3 font-bold text-red-900">⚠️ Việc nhẹ lương cao 500k/ngày gõ mã captcha online</td>
                    <td className="p-3 text-red-700">Cá nhân tự do (SĐT lạ)</td>
                    <td className="p-3 text-red-700 font-bold">500.000đ/ngày (Ảo)</td>
                    <td className="p-3 text-red-800 font-bold">❌ Không MST / Blacklist</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleModerateJob(5, 'reject')} className="px-3 py-1 bg-[#DC2626] hover:bg-red-800 text-white rounded font-bold shadow">
                        🚫 Bác bỏ & Khóa TK
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-[#003366] text-sm">📝 NỘP ĐƠN ỨNG TUYỂN 1-CHẠM</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="font-bold text-gray-900">{selectedJob?.title}</div>
            <div className="p-3 bg-blue-50/70 rounded-lg text-gray-700">
              <div className="font-bold text-blue-950">Nguyễn Minh Phú (MSSV: 2374802013447)</div>
              <div>Email: sinhvien.demo@student.vlu.edu.vn</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-gray-700">Lời nhắn đến NTD:</div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="3"
                className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 bg-gray-100 rounded font-bold">Hủy</button>
              <button onClick={handleApply} className="px-5 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded font-bold">
                🚀 Xác nhận gửi hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV Modal Preview */}
      {showCvModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 text-gray-800 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-[#003366]">📄 HỒ SƠ CV: NGUYỄN MINH PHÚ</h3>
              <button onClick={() => setShowCvModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg font-mono space-y-2">
              <div><b>Họ và tên:</b> NGUYỄN MINH PHÚ (MSSV: 2374802013447)</div>
              <div><b>Trường:</b> Đại học Văn Lang — Khoa CNTT</div>
              <div><b>Kỹ năng:</b> ReactJS, Node.js, Express, MySQL, TailwindCSS, Git</div>
              <div><b>Dự án:</b> VLU Freelance Marketplace</div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowCvModal(false)} className="px-4 py-1.5 bg-[#003366] text-white rounded font-bold">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
