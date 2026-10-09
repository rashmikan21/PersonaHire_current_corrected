import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DonutChart, RadarChart } from '@/components/ui/Charts';

export function ReadinessPage() {
  const { scores } = useData();
  const navigate = useNavigate();

  const categories = [
    { label: 'Aptitude', value: scores.aptitude },
    { label: 'Coding', value: scores.coding },
    { label: 'Core CS', value: scores.coreCS },
    { label: 'Technical', value: scores.technical },
    { label: 'Professional', value: scores.professional },
    { label: 'Interview', value: scores.aiInterview },
  ];

  const overall = Math.round(categories.reduce((sum, c) => sum + c.value, 0) / categories.length);

  const strong = categories.filter((c) => c.value >= 70);
  const moderate = categories.filter((c) => c.value >= 55 && c.value < 70);
  const weak = categories.filter((c) => c.value < 55);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Placement Readiness Analysis</h2>
        <p className="text-sm text-slate-500">Comprehensive visual analysis of your skills</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center">
          <p className="mb-3 text-sm font-medium text-slate-500">Overall Readiness</p>
          <DonutChart
            value={overall}
            label={`${overall}%`}
            sublabel="Ready"
            color={overall >= 70 ? '#10b981' : overall >= 50 ? '#f59e0b' : '#ef4444'}
            size={180}
          />
          <Badge variant={overall >= 70 ? 'success' : 'warning'} className="mt-3">
            {overall >= 70 ? 'Well Prepared' : 'Needs Improvement'}
          </Badge>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-bold text-slate-800">Skill Radar Analysis</h3>
          <div className="flex justify-center">
            <RadarChart data={categories} size={300} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-bold text-slate-800">Category-wise Scores</h3>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{cat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">{cat.value}%</span>
                  <Badge variant={cat.value >= 70 ? 'success' : cat.value >= 55 ? 'warning' : 'error'} size="sm">
                    {cat.value >= 70 ? 'Strong' : cat.value >= 55 ? 'Moderate' : 'Weak'}
                  </Badge>
                </div>
              </div>
              <ProgressBar
                value={cat.value}
                color={cat.value >= 70 ? 'success' : cat.value >= 55 ? 'warning' : 'error'}
                size="md"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Strong Areas</h3>
          </div>
          <div className="space-y-2">
            {strong.length > 0 ? strong.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
                <span className="text-sm font-bold text-emerald-600">{s.value}%</span>
              </div>
            )) : <p className="text-sm text-slate-400">No strong areas yet. Keep practicing!</p>}
          </div>
        </Card>

        <Card className="border-blue-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Target size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Moderate Areas</h3>
          </div>
          <div className="space-y-2">
            {moderate.length > 0 ? moderate.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
                <span className="text-sm font-bold text-blue-600">{s.value}%</span>
              </div>
            )) : <p className="text-sm text-slate-400">No moderate areas.</p>}
          </div>
        </Card>

        <Card className="border-amber-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Weak Areas</h3>
          </div>
          <div className="space-y-2">
            {weak.length > 0 ? weak.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
                <span className="text-sm font-bold text-amber-600">{s.value}%</span>
              </div>
            )) : <p className="text-sm text-slate-400">No weak areas. Excellent!</p>}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/weakness')}>
          <TrendingUp size={16} /> View Weakness Detection
        </Button>
        <Button variant="outline" onClick={() => navigate('/recovery')}>
          Generate Recovery Plan
        </Button>
      </div>
    </div>
  );
}
