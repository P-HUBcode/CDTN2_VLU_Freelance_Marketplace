import React, { useState } from 'react';
import {
  TrendingUp,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

/**
 * 1. BIỂU ĐỒ SỐ ĐƠN THEO NGÀY (TIMELINE CHART)
 * Render thuần SVG + Tailwind, hỗ trợ tooltip tương tác, không phụ thuộc thư viện nặng.
 */
export function ApplicationsTimelineChart({ timeline = [], days = 7, onDaysChange }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxCount = Math.max(...timeline.map((d) => d.count), 5);
  const totalInPeriod = timeline.reduce((acc, cur) => acc + cur.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header & Bộ chọn khoảng thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Số đơn ứng tuyển theo ngày</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Tổng cộng <span className="font-bold text-blue-600">{totalInPeriod}</span> đơn nộp trong {days} ngày qua
          </p>
        </div>

        {/* Bộ chọn 7 / 30 / 90 ngày */}
        {onDaysChange && (
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                className={`px-3 py-1 rounded-lg transition ${
                  days === d
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d} ngày
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SVG Chart Area */}
      {timeline.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-slate-400">
          Chưa có dữ liệu đơn ứng tuyển trong khoảng thời gian này
        </div>
      ) : (
        <div className="relative pt-4 pb-1">
          {/* Gridlines & Bar Columns */}
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-1">
            {timeline.map((item, idx) => {
              const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.date || idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip khi hover */}
                  {isHovered && (
                    <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2">
                      <span className="text-blue-300 font-bold">{item.count} đơn</span> ({item.label || item.date})
                    </div>
                  )}

                  {/* Count indicator on top of bar if count > 0 */}
                  {item.count > 0 && (
                    <span className="text-[10px] font-bold text-blue-600 mb-1 opacity-80 group-hover:opacity-100">
                      {item.count}
                    </span>
                  )}

                  {/* Cột Bar */}
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      style={{ height: `${Math.max(heightPercent, item.count > 0 ? 8 : 2)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        item.count > 0
                          ? isHovered
                            ? 'bg-blue-600 shadow-sm'
                            : 'bg-blue-500/85 hover:bg-blue-600'
                          : 'bg-slate-200/50'
                      }`}
                    />
                  </div>

                  {/* Trục nhãn ngày tháng */}
                  <span className="text-[10px] text-slate-400 font-medium mt-2 truncate max-w-full">
                    {/* Giảm mật độ chữ nếu chọn 30 hoặc 90 ngày */}
                    {days === 7 || (days === 30 && idx % 4 === 0) || (days === 90 && idx % 12 === 0)
                      ? item.label || item.date?.split('-').slice(1).join('/')
                      : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2. BIỂU ĐỒ PHỄU CHUYỂN ĐỔI TUYỂN DỤNG (RECRUITMENT FUNNEL)
 * Tính theo application_status_history, đếm các mốc đã từng đạt:
 * Applied -> Reviewing -> Interview -> Accepted
 * Thẻ Rejected hiển thị tách biệt, không tính gộp vào phễu thuận.
 */
export function RecruitmentFunnelChart({ funnel }) {
  const {
    applied = 0,
    reviewing = 0,
    interview = 0,
    accepted = 0,
    rejected = 0,
    rates = {
      applied_to_reviewing: 0,
      reviewing_to_interview: 0,
      interview_to_accepted: 0,
      overall: 0,
    },
  } = funnel || {};

  const stages = [
    {
      id: 'applied',
      label: '1. Đã nộp hồ sơ (Applied)',
      count: applied,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      percentOfTotal: 100,
    },
    {
      id: 'reviewing',
      label: '2. Đang xem xét (Reviewing)',
      count: reviewing,
      nextRate: rates.applied_to_reviewing,
      color: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      percentOfTotal: applied > 0 ? Math.round((reviewing / applied) * 100) : 0,
    },
    {
      id: 'interview',
      label: '3. Hẹn phỏng vấn (Interview)',
      count: interview,
      nextRate: rates.reviewing_to_interview,
      color: 'bg-purple-600',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      percentOfTotal: applied > 0 ? Math.round((interview / applied) * 100) : 0,
    },
    {
      id: 'accepted',
      label: '4. Đã nhận việc (Accepted)',
      count: accepted,
      nextRate: rates.interview_to_accepted,
      color: 'bg-emerald-600',
      lightBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      percentOfTotal: applied > 0 ? Math.round((accepted / applied) * 100) : 0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Phễu chuyển đổi tuyển dụng (Recruitment Funnel)</h3>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-bold">
          <span>Tỷ lệ tuyển dụng tổng thể:</span>
          <span>{rates.overall || 0}%</span>
        </div>
      </div>

      {/* Main Funnel Stages */}
      <div className="space-y-3 pt-1">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="space-y-1.5">
            {/* Tỷ lệ chuyển tiếp giữa 2 bước */}
            {idx > 0 && (
              <div className="flex items-center gap-2 pl-3 py-0.5 text-[11px] text-slate-500">
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">{stage.nextRate}%</span>
                <span className="text-slate-400">chuyển tiếp sang bước này</span>
              </div>
            )}

            {/* Stage Row */}
            <div className={`p-3 rounded-xl border ${stage.borderColor} ${stage.lightBg} flex items-center justify-between gap-4 transition hover:shadow-xs`}>
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="text-xs font-bold text-slate-800">{stage.label}</span>
              </div>

              {/* Progress bar minh họa tỷ lệ */}
              <div className="flex-1 max-w-[220px] bg-white/70 h-2 rounded-full overflow-hidden hidden sm:block border border-slate-200/60">
                <div
                  style={{ width: `${stage.percentOfTotal}%` }}
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                />
              </div>

              {/* Số lượng đơn */}
              <div className="text-right">
                <span className={`text-sm font-extrabold ${stage.textColor}`}>{stage.count}</span>
                <span className="text-[10px] text-slate-400 ml-1">hồ sơ ({stage.percentOfTotal}%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thẻ phụ: Hồ sơ từ chối (Rejected) - Hiển thị riêng biệt theo yêu cầu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between p-3 bg-rose-50/60 border border-rose-200/70 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-rose-800 font-semibold">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>Hồ sơ đã từ chối (Rejected - Không tính vào phễu thuận):</span>
        </div>
        <div className="font-extrabold text-rose-700 text-sm">
          {rejected} <span className="text-xs font-normal text-rose-500">hồ sơ</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. PHÂN BỔ TRẠNG THÁI ỨNG VIÊN HIỆN TẠI (STATUS DISTRIBUTION)
 */
export function StatusDistributionWidget({ distribution = {} }) {
  const total = Object.values(distribution).reduce((a, b) => a + Number(b || 0), 0);

  const items = [
    { key: 'applied', label: 'Đã nộp', color: 'bg-blue-500', count: distribution.applied || 0 },
    { key: 'reviewing', label: 'Đang xem xét', color: 'bg-amber-500', count: distribution.reviewing || 0 },
    { key: 'interview', label: 'Phỏng vấn', color: 'bg-purple-500', count: distribution.interview || 0 },
    { key: 'accepted', label: 'Trúng tuyển', color: 'bg-emerald-500', count: distribution.accepted || 0 },
    { key: 'rejected', label: 'Từ chối', color: 'bg-rose-500', count: distribution.rejected || 0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Phân bổ trạng thái hiện tại</span>
        </h3>
        <span className="text-xs font-semibold text-slate-500">Tổng: {total} đơn</span>
      </div>

      {/* Multi-color segment progress bar */}
      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {total === 0 ? (
          <div className="w-full h-full bg-slate-200 text-[10px] text-slate-400 flex items-center justify-center">
            Chưa có hồ sơ
          </div>
        ) : (
          items.map((item) => {
            const widthPct = total > 0 ? (item.count / total) * 100 : 0;
            if (widthPct === 0) return null;
            return (
              <div
                key={item.key}
                style={{ width: `${widthPct}%` }}
                className={`${item.color} h-full transition-all duration-500 hover:brightness-110`}
                title={`${item.label}: ${item.count} (${Math.round(widthPct)}%)`}
              />
            );
          })
        )}
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.key} className="p-2 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-800">{item.count}</span>
                <span className="text-[10px] text-slate-400 font-medium">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
