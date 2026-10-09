import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
        hover && 'transition-all duration-300 hover:shadow-lg hover:border-brand-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'blue';
  suffix?: string;
  subtitle?: string;
}

const statColors: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
  error: { bg: 'bg-red-50', text: 'text-red-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

export function StatCard({ title, value, icon, color = 'brand', suffix, subtitle }: StatCardProps) {
  const c = statColors[color];
  return (
    <Card className="flex items-center gap-4">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', c.bg, c.text)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">
          {value}{suffix && <span className="text-lg font-medium text-slate-400 ml-1">{suffix}</span>}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  );
}
