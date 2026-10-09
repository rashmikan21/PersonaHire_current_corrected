import { Menu, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export function TopBar({ onMenuClick, title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="hidden text-xs text-slate-400 sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2 sm:pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
            <User size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name || 'Student'}</p>
            <p className="text-[11px] text-slate-400 leading-tight">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
