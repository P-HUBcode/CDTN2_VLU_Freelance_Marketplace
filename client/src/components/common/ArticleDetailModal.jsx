import React from 'react';
import Modal from './Modal';
import { Calendar, User, Eye, Sparkles, Share2, Bookmark } from 'lucide-react';

export default function ArticleDetailModal({ isOpen, onClose, article }) {
  if (!article) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cẩm Nang Nghề Nghiệp & Tin Tức"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Banner Image */}
        <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden border border-slate-200">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm border ${
              article.category === 'THƯ GIÃN'
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-blue-600 text-white border-blue-700'
            }`}>
              {article.category}
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2.5 pb-3 border-b border-slate-100">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>{article.author || 'StudentHub News'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.publishedDate}</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.viewsCount?.toLocaleString()} lượt xem</span>
            </span>
          </div>
        </div>

        {/* Summary box */}
        {article.summary && (
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs sm:text-sm font-medium text-blue-900 leading-relaxed italic">
            "{article.summary}"
          </div>
        )}

        {/* Article Content */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line font-normal">
          {article.content}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Nguồn: Cẩm nang nghề nghiệp sinh viên StudentHub
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Đóng bài viết
          </button>
        </div>
      </div>
    </Modal>
  );
}
