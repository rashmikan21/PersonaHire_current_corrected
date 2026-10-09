import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses: Record<string, string> = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  blue: 'bg-blue-500',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'brand',
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-slate-700">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-200', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', colorClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
