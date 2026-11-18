import React, { useState, useEffect } from 'react';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import {
  User,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  Code2,
  Award,
  Globe,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Star
} from 'lucide-react';
import { getCvSignedUrl } from '../lib/applicationService';
import { getReviewsForUser, getUserRatingSummary } from '../lib/reviewService';

export default function PublicStudentProfileModal({
  isOpen,
  onClose,
  studentProfile,
  studentProjects = [],
  onOpenCv
}) {
  if (!isOpen || !studentProfile) return null;

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ totalReviews: 0, ratingAvg: 0.0 });
  const [loadingReviews, setLoadingReviews] = useState(false);

  const studentUserId = studentProfile.user_id || studentProfile.id;

  useEffect(() => {
    if (studentUserId) {
      setLoadingReviews(true);
      Promise.all([
        getReviewsForUser(studentUserId),
        getUserRatingSummary(studentUserId)
      ]).then(([revList, summary]) => {
        setReviews(revList || []);
        setRatingSummary(summary || { totalReviews: 0, ratingAvg: 0.0 });
      }).catch(err => {
        console.error('Lỗi tải đánh giá sinh viên:', err);
      }).finally(() => {
        setLoadingReviews(false);
      });
    }
  }, [studentUserId]);

  const handleOpenCv = async (cvPath) => {
    if (!cvPath) return;
    try {
      const signedUrl = await getCvSignedUrl(cvPath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        alert('Không thể tạo liên kết tải CV. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi mở CV:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ năng lực & Portfolio Sinh viên"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Cover & Identity */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 relative overflow-hidden">
            {studentProfile.cover_url && (
              <img
                src={studentProfile.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-slate-900/15" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sinh viên đã xác minh</span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={studentProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={studentProfile.full_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {studentProfile.full_name}
                  </h2>
                  <Badge variant="blue">Sinh viên tiềm năng</Badge>
                  {ratingSummary.totalReviews > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{ratingSummary.ratingAvg} ({ratingSummary.totalReviews} đánh giá)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{studentProfile.university} • {studentProfile.major}</span>
                </p>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{studentProfile.location || 'TP. Hồ Chí Minh'}</span>
                </p>
              </div>
            </div>

            {/* Quick Contact & CV button */}
            <div className="flex items-center gap-2">
              {studentProfile.cv_url && (
                <button
                  onClick={() => handleOpenCv(studentProfile.cv_url)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Xem CV PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bio & Skills */}
          <div className="lg:col-span-1 space-y-5">
            {/* Contact Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Thông tin liên hệ
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{studentProfile.email}</span>
                </div>
                {studentProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{studentProfile.phone}</span>
                  </div>
                )}
                {studentProfile.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Ngày sinh: {studentProfile.birth_date}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Năm tốt nghiệp: {studentProfile.graduation_year || '2026'}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Kỹ năng chuyên môn</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(studentProfile.skills) && studentProfile.skills.length > 0 ? (
                  studentProfile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Chưa cập nhật kỹ năng</span>
                )}
              </div>
            </div>

            {/* Foreign Languages */}
            {Array.isArray(studentProfile.foreign_languages) && studentProfile.foreign_languages.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ngoại ngữ</span>
                </h3>
                <div className="space-y-1.5">
                  {studentProfile.foreign_languages.map((lang, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-800">{lang.language}</span>
                      <span className="text-slate-500">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Experience, Goals & Portfolio */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bio & Career Goals */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Giới thiệu bản thân
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {studentProfile.bio || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>

              {studentProfile.career_goals && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mục tiêu nghề nghiệp</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {studentProfile.career_goals}
                  </p>
                </div>
              )}

              {studentProfile.experience && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kinh nghiệm làm việc & Hoạt động</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {studentProfile.experience}
                  </p>
                </div>
              )}
            </div>

            {/* Portfolio Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Dự án cá nhân / Portfolio ({studentProjects.length})</span>
                </h3>
              </div>

              {studentProjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">Sinh viên chưa cập nhật dự án nào trong Portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {studentProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-subtle transition flex flex-col justify-between"
                    >
                      {proj.image_url && (
                        <div className="h-32 w-full overflow-hidden bg-slate-100 relative group">
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md">
                            {proj.role}
                          </div>
                        </div>
                      )}

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
                          {/* Tech stack */}
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(proj.technologies) && proj.technologies.slice(0, 3).map((t, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                                {t}
                              </span>
                            ))}
                            {proj.technologies?.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{proj.technologies.length - 3}</span>
                            )}
                          </div>

                          {/* External Links */}
                          <div className="flex items-center gap-3 pt-1">
                            {proj.github_url && (
                              <a
                                href={proj.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition"
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
                                className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1 transition ml-auto"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Live Demo →</span>
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

            {/* Certifications & Achievements */}
            {Array.isArray(studentProfile.certifications) && studentProfile.certifications.length > 0 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Chứng chỉ & Bằng cấp</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {studentProfile.certifications.map((cert, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-800 block">{cert.name}</span>
                      <span className="text-[11px] text-slate-500 block">{cert.issuer} • {cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Đánh giá uy tín & Nhận xét từ Nhà tuyển dụng (Sprint 4: Reviews) */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Đánh giá từ Nhà tuyển dụng ({reviews.length})</span>
                </h3>
                {ratingSummary.ratingAvg > 0 && (
                  <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    ★ {ratingSummary.ratingAvg} / 5.0
                  </span>
                )}
              </div>

              {loadingReviews ? (
                <p className="text-xs text-slate-400 italic">Đang tải nhận xét...</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Chưa có đánh giá nào từ nhà tuyển dụng.</p>
              ) : (
                <div className="space-y-2.5">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewerAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80'}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      {Array.isArray(rev.tags) && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] rounded text-slate-500 font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
