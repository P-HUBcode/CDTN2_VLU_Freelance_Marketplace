import React, { useState } from 'react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatNumberWithDots, parseRawNumber } from '../lib/currencyFormatter';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  TrendingUp,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function WalletPage({
  currentUser,
  transactions = [],
  monthlyEarningsChart = [],
  onWithdrawFunds,
  onShowToast
}) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2000000');
  const [bankName, setBankName] = useState('Vietcombank (VCB)');
  const [accountNumber, setAccountNumber] = useState('1029384756');
  const [accountHolder, setAccountHolder] = useState('NGUYEN NHAT MINH');

  // Format currency
  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseRawNumber(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (amountNum > currentUser.availableBalance) {
      alert('Số dư khả dụng không đủ để rút số tiền này');
      return;
    }

    if (onWithdrawFunds) {
      onWithdrawFunds(amountNum);
    }
    setShowWithdrawModal(false);
    if (onShowToast) {
      onShowToast(`💸 Yêu cầu rút ${formatVND(amountNum)} về ${bankName} đã được tạo thành công! Tiền sẽ về trong 5-15 phút.`);
    }
  };

  const maxAmount = Math.max(...monthlyEarningsChart.map(m => m.amount));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ví & Quản lý thu nhập
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi dòng tiền thù lao, lịch sử nhận tiền freelance và rút tiền về tài khoản ngân hàng.
          </p>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Rút tiền về ngân hàng</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Available Balance */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md shadow-blue-500/15 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200">Số dư khả dụng</span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight mt-2">
            {formatVND(currentUser.availableBalance)}
          </div>
          <span className="text-[11px] text-blue-100 block mt-2">
            Sẵn sàng rút về tài khoản ngân hàng liên kết
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Thu nhập tháng này</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {currentUser.earningsMonth}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-2">
            +18.5% so với tháng trước
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng thu nhập tích lũy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {currentUser.totalEarnings}
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            8 dự án hoàn thành
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đang chờ thanh toán</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-600 mt-2">
            2.200.000đ
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">
            Khách đang nghiệm thu sản phẩm
          </span>
        </div>
      </div>

      {/* Monthly Chart UI (Clean Minimalist Bar Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Biểu đồ thu nhập theo tháng</h2>
            <p className="text-xs text-slate-400 mt-0.5">Nửa cuối năm 2026 (Đơn vị: VNĐ)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span>Thực nhận</span>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-4 border-b border-slate-100">
          {monthlyEarningsChart.map((item, idx) => {
            const heightPercent = Math.round((item.amount / maxAmount) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 px-1.5 py-0.5 rounded">
                  {formatVND(item.amount)}
                </span>
                <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden max-w-[48px]">
                  <div
                    className="w-full bg-blue-600 group-hover:bg-blue-700 transition-all duration-300 rounded-t-xl"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500 pt-1">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Lịch sử giao dịch</h2>
          <span className="text-xs text-slate-400">Giao dịch gần nhất</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Công việc / Nội dung</th>
                <th className="py-3 px-5">Khách hàng</th>
                <th className="py-3 px-5">Ngày</th>
                <th className="py-3 px-5 text-right">Số tiền</th>
                <th className="py-3 px-5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {tx.jobTitle}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-medium">
                    {tx.client}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    {tx.date}
                  </td>
                  <td className={`py-3.5 px-5 text-right font-bold ${tx.amount?.startsWith('+') ? 'text-emerald-600 font-extrabold' : tx.amount?.startsWith('-') ? 'text-rose-600 font-bold' : 'text-blue-600'}`}>
                    {tx.amount}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {tx.status === 'completed' ? (
                      <Badge variant="success" size="sm">Đã thanh toán</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Đang xử lý</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Rút tiền về tài khoản ngân hàng"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-800">
            Số dư khả dụng hiện tại: <strong>{formatVND(currentUser.availableBalance)}</strong>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Số tiền muốn rút (VNĐ)
              </label>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded">
                Tự động định dạng dấu chấm
              </span>
            </div>
            <input
              type="text"
              value={formatNumberWithDots(withdrawAmount)}
              onChange={(e) => setWithdrawAmount(formatNumberWithDots(e.target.value))}
              onBlur={(e) => setWithdrawAmount(formatNumberWithDots(e.target.value))}
              placeholder="Vd: 2.000.000"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Ngân hàng thụ hưởng
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="Vietcombank (VCB)">Vietcombank (VCB)</option>
              <option value="MB Bank (Quân Đội)">MB Bank (Quân Đội)</option>
              <option value="Techcombank (TCB)">Techcombank (TCB)</option>
              <option value="TPBank (Tiên Phong)">TPBank (Tiên Phong)</option>
              <option value="ACB (Á Châu)">ACB (Á Châu)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Số tài khoản ngân hàng
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tên chủ tài khoản (Viết hoa không dấu)
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Xác nhận rút tiền
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
