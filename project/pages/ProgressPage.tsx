import { useMemo } from 'react';
import { Activity, CheckCircle2, Code2, Flame, Target, Timer, TrendingUp } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LineChart } from '@/components/ui/Charts';

export function ProgressPage() {
  const { assessments, scores, initialScores, streak, practiceMinutes, problemsSolved } = useData();

  const readiness = Math.round((scores.coding + scores.aptitude + scores.coreCS + scores.technical + scores.professional + scores.aiInterview) / 6);
  const initialReadiness = Math.round((initialScores.coding + initialScores.aptitude + initialScores.coreCS + initialScores.technical + initialScores.professional + initialScores.aiInterview) / 6);
  const improvement = readiness - initialReadiness;

  const categoryData = [
    { label: 'Coding & DSA', value: scores.coding },
    { label: 'Aptitude', value: scores.aptitude },
    { label: 'Core CS', value: scores.coreCS },
    { label: 'Technical', value: scores.technical },
    { label: 'Professional', value: scores.professional },
    { label: 'AI Interview', value: scores.aiInterview },
  ];

  const trend = useMemo(() => {
    const historical = [
      { label: 'Initial', value: initialReadiness },
      { label: 'Practice', value: Math.round((initialReadiness + readiness) / 2) },
      { label: 'Recovery', value: Math.max(initialReadiness, readiness - Math.max(1, Math.round(improvement / 3))) },
      { label: 'Current', value: readiness },
    ];
    return historical;
  }, [initialReadiness, readiness, improvement]);

  const recent = assessments.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Your journey</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-800">Progress Tracking</h2>
        <p className="mt-1 text-sm text-slate-500">A clear view of your placement preparation and improvement.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Readiness" value={readiness} suffix="%" icon={<Target size={20} />} color="brand" />
        <StatCard title="Current Streak" value={streak} suffix=" days" icon={<Flame size={20} />} color="warning" />
        <StatCard title="Problems Solved" value={problemsSolved} icon={<Code2 size={20} />} color="success" />
        <StatCard title="Practice Time" value={practiceMinutes} suffix=" min" icon={<Timer size={20} />} color="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Readiness Trend</h3>
              <p className="text-xs text-slate-500">Initial assessment → current performance</p>
            </div>
            <Badge variant={improvement >= 0 ? 'success' : 'error'}>
              {improvement >= 0 ? '+' : ''}{improvement}% overall
            </Badge>
          </div>
          <LineChart data={trend} height={250} />
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity size={20} className="text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-800">Skill Snapshot</h3>
              <p className="text-xs text-slate-500">Current performance by area</p>
            </div>
          </div>
          <div className="space-y-4">
            {categoryData.map((item) => (
              <ProgressBar
                key={item.label}
                value={item.value}
                label={item.label}
                showValue
                color={item.value >= 70 ? 'success' : item.value >= 55 ? 'warning' : 'error'}
                size="sm"
              />
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-brand-50/40">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Initial</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-500">{initialReadiness}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-600">{readiness}%</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Improvement</p>
            <p className={`mt-1 text-3xl font-extrabold ${improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {improvement >= 0 ? '+' : ''}{improvement}%
            </p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={readiness} label="Placement readiness" showValue color="brand" size="lg" />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <div>
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
              <p className="text-xs text-slate-500">Your latest completed assessments</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-orange-600"><Flame size={16} /> {streak} day streak</div>
        </div>
        <div className="space-y-2">
          {recent.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">{item.type} · {item.category}</p>
                <p className="truncate text-xs text-slate-400">{item.date}{item.details ? ` · ${item.details}` : ''}</p>
              </div>
              <Badge variant={item.score >= 70 ? 'success' : item.score >= 55 ? 'warning' : 'error'}>{item.score}%</Badge>
            </div>
          ))}
          {recent.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Complete an assessment to start your progress history.</p>}
        </div>
      </Card>
    </div>
  );
}
