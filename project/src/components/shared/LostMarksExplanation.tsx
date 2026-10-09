import { AlertCircle, Lightbulb, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface LostMarksExplanationProps {
  scores: { label: string; value: number; max?: number }[];
  mainIssue: string;
  recommendation: string;
}

export function LostMarksExplanation({ scores, mainIssue, recommendation }: LostMarksExplanationProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <TrendingDown size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Why You Lost Marks</h3>
          <p className="text-xs text-slate-500">Detailed breakdown of where points were deducted</p>
        </div>
      </div>

      <div className="space-y-3">
        {scores.map((s, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{s.label}</span>
              <span className="text-sm font-semibold text-slate-700">
                {s.value}/{s.max || 10}
              </span>
            </div>
            <ProgressBar value={s.value} max={s.max || 10} color={s.value >= 7 ? 'success' : s.value >= 5 ? 'warning' : 'error'} size="sm" />
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-white p-3 border border-amber-100">
          <div className="mb-1 flex items-center gap-1.5">
            <AlertCircle size={15} className="text-amber-600" />
            <span className="text-sm font-semibold text-slate-700">Main Issue</span>
          </div>
          <p className="text-sm text-slate-600">{mainIssue}</p>
        </div>
        <div className="rounded-xl bg-white p-3 border border-brand-100">
          <div className="mb-1 flex items-center gap-1.5">
            <Lightbulb size={15} className="text-brand-600" />
            <span className="text-sm font-semibold text-slate-700">Recommendation</span>
          </div>
          <p className="text-sm text-slate-600">{recommendation}</p>
        </div>
      </div>
    </Card>
  );
}
