import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import { formatNumberWithDots, parseRawNumber } from '../lib/currencyFormatter';
import { Sparkles, DollarSign, Clock, Layers, Upload } from 'lucide-react';

export default function CreateServiceModal({
  isOpen,
  onClose,
  currentUser,
  onCreateService
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Design');
  const [startingPrice, setStartingPrice] = useState('250000');
  const [deliveryDays, setDeliveryDays] = useState('2');
  const [skillsString, setSkillsString] = useState('Canva, Social Media, Design');
  const [description, setDescription] = useState('');
  const [includesText, setIncludesText] = useState('5 thiết kế ấn phẩm hoàn chỉnh\n2 lần chỉnh sửa miễn phí\nFile xuất định dạng JPG + PNG');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên gói dịch vụ');
      return;
    }

    const newService = {
      id: `srv_${Date.now()}`,
      title,
      studentName: currentUser?.name || 'Nguyễn Minh Anh',
      studentUniversity: currentUser?.university ? (currentUser.university.includes('UEH') ? 'UEH' : currentUser.university) : 'ĐH Kinh tế TP.HCM (UEH)',
      studentAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      category,
      rating: 5.0,
      reviewsCount: 1,
      startingPrice: parseRawNumber(startingPrice) || 200000,
      deliveryDays: parseInt(deliveryDays, 10) || 2,
      skills: skillsString.split(',').map((s) => s.trim()).filter(Boolean),
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
      description: description || 'Dịch vụ chất lượng cao, đúng tiến độ và hỗ trợ nhiệt tình cho khách hàng.',
      includes: includesText.split('\n').filter(Boolean)
    };

    if (onCreateService) {
      onCreateService(newService);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo gói dịch vụ Freelance mới"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Tên dịch vụ bạn cung cấp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Vd: Thiết kế 5 bài Social Media bằng Canva"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nhóm ngành nghề
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            >
              <option value="Design">Design & Canva</option>
              <option value="Content">Content & Copywriting</option>
              <option value="Video Editing">Video Editing & TikTok</option>
              <option value="Marketing">Marketing & Social Media</option>
              <option value="IT">IT & Lập trình Web</option>
              <option value="Data Entry">Data Entry & Excel</option>
              <option value="Tutoring">Gia sư & Dạy kèm</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Giá khởi điểm (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded">
                Tự thêm dấu chấm
              </span>
            </div>
            <input
              type="text"
              value={formatNumberWithDots(startingPrice)}
              onChange={(e) => setStartingPrice(formatNumberWithDots(e.target.value))}
              onBlur={(e) => setStartingPrice(formatNumberWithDots(e.target.value))}
              placeholder="Vd: Nhập 9000000 ➔ 9.000.000"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-bold text-blue-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Thời gian bàn giao (Số ngày)
            </label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              min="1"
              max="30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Kỹ năng (cách nhau dấu phẩy)
            </label>
            <input
              type="text"
              value={skillsString}
              onChange={(e) => setSkillsString(e.target.value)}
              placeholder="Canva, TikTok, Content..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Mô tả chi tiết dịch vụ
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nêu rõ thế mạnh, kinh nghiệm và cam kết bàn giao của bạn..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Gói dịch vụ bao gồm (Mỗi dòng 1 gạch đầu dòng)
          </label>
          <textarea
            rows={3}
            value={includesText}
            onChange={(e) => setIncludesText(e.target.value)}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-mono"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            Đăng dịch vụ ngay
          </button>
        </div>
      </form>
    </Modal>
  );
}
