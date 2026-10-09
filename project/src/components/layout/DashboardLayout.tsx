import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your placement readiness at a glance' },
  '/profile': { title: 'Student Profile', subtitle: 'Manage your skills and career preferences' },
  '/aptitude': { title: 'Aptitude', subtitle: 'Practice quantitative, logical, verbal & DI' },
  '/coding': { title: 'Coding & DSA', subtitle: 'Sharpen your problem-solving skills' },
  '/core-cs': { title: 'Core Computer Science', subtitle: 'Master the fundamentals' },
  '/technical': { title: 'Technical Skills', subtitle: 'Programming and technology skills' },
  '/professional': { title: 'Professional Skills', subtitle: 'Soft skills that make a difference' },
  '/interview': { title: 'AI Mock Interview', subtitle: 'Practice with adaptive AI interviews' },
  '/simulation': { title: 'Placement Simulation', subtitle: 'Full mock placement experience' },
  '/recovery': { title: 'Recovery Plan', subtitle: 'Your personalized improvement roadmap' },
  '/progress': { title: 'Progress Tracking', subtitle: 'Track your improvement over time' },
  '/company': { title: 'Company Readiness', subtitle: 'Check your readiness for target companies' },
  '/readiness': { title: 'Placement Readiness', subtitle: 'Comprehensive skill analysis' },
  '/weakness': { title: 'AI Weakness Detection', subtitle: 'AI-powered analysis of your gaps' },
  '/reassessment': { title: 'Re-Assessment', subtitle: 'Compare before and after performance' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account preferences' },
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'PersonaHire' };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />
        <main className="animate-fadeIn p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
