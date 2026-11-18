import React from 'react';
import { Home, Search, Layers, MessageSquare, User } from 'lucide-react';

export default function MobileNav({
  currentView,
  setCurrentView,
  unreadMessagesCount = 0,
  onToggleChatBox
}) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'marketplace', label: 'Tìm việc', icon: Search },
    { id: 'freelance', label: 'Freelance', icon: Layers },
    { id: 'messages', label: 'Tin nhắn', icon: MessageSquare, count: unreadMessagesCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 z-40 flex items-center justify-around shadow-dropdown">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'messages' && onToggleChatBox) {
                onToggleChatBox();
              } else {
                setCurrentView(item.id);
              }
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-white">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
