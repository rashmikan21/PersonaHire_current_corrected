import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCircle,
  Brain,
  Code2,
  Cpu,
  Wrench,
  Users,
  Bot,
  Rocket,
  CalendarClock,
  TrendingUp,
  Building2,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/aptitude', label: 'Aptitude', icon: Brain },
  { to: '/coding', label: 'Coding & DSA', icon: Code2 },
  { to: '/core-cs', label: 'Core CS', icon: Cpu },
  { to: '/technical', label: 'Technical Skills', icon: Wrench },
  { to: '/professional', label: 'Professional Skills', icon: Users },
  { to: '/interview', label: 'AI Interview', icon: Bot },
  { to: '/simulation', label: 'Placement Simulation', icon: Rocket },
  { to: '/recovery', label: 'Recovery Plan', icon: CalendarClock },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/company', label: 'Company Readiness', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800">PersonaHire</h1>
            <p className="text-[10px] font-medium text-slate-400">AI Placement Tracker</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 p-3">
            <p className="text-xs font-semibold text-brand-700">Need Help?</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Check your recovery plan for guided practice.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
