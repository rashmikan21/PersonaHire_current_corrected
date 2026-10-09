import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, ArrowRight, BarChart3, Trophy } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LineChart } from '@/components/ui/Charts';

export function ReAssessmentPage() {
  const { scores, initialScores } = useData();
  const navigate = useNavigate();
  const [taken, setTaken] = useState(false);

  const before = {
    MCQ: initialScores.aptitude,
    Coding: initialScores.coding,
    Interview: initialScores.aiInterview,
    Readiness: Math.round((initialScores.aptitude + initialScores.coding + initialScores.coreCS + initialScores.technical + initialScores.professional + initialScores.aiInterview) / 6),
  };

  const after = {
    MCQ: scores.aptitude,
    Coding: scores.coding,
    Interview: scores.aiInterview,
    Readiness: Math.round((scores.aptitude + scores.coding + scores.coreCS + scores.technical + scores.professional + scores.aiInterview) / 6),
  };

  const improvement = after.Readiness - before.Readiness;
  const lineData = [
    { label: 'Initial', value: before.Readiness },
    { label: 'After Practice', value: Math.round((before.Readiness + after.Readiness) / 2) },
    { label: 'After Recovery', value: after.Readiness - 2 },
    { label: 'Re-Assessment', value: after.Readiness },
  ];

  if (!taken) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Re-Assessment</h2>
          <p className="text-sm text-slate-500">Compare your performance before and after the recovery plan</p>
        </div>

        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ready for Re-Assessment</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Take a re-assessment to see how your scores have improved after completing the recovery plan.
            We'll compare your before and after scores side by side.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={() => setTaken(true)}>
              <TrendingUp size={18} /> Start Re-Assessment
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-bold text-slate-700">Before Scores</h3>
          <div className="space-y-3">
            {Object.entries(before).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{key}</span>
                  <span className="font-bold text-slate-700">{value}%</span>
                </div>
                <ProgressBar value={value} color="warning" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const metrics = [
    { label: 'MCQ', before: before.MCQ, after: after.MCQ },
    { label: 'Coding', before: before.Coding, after: after.Coding },
    { label: 'Interview', before: before.Interview, after: after.Interview },
    { label: 'Readiness', before: before.Readiness, after: after.Readiness },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Re-Assessment Results</h2>
        <p className="text-sm text-slate-500">Before vs After comparison</p>
      </div>

      <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
            <Trophy size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">+{improvement}% Improvement</h3>
            <p className="text-brand-50">Your readiness improved from {before.Readiness}% to {after.Readiness}%</p>
          </div>
        </div>
      </Card>

      {/* Progress Chart */}
      <Card>
        <h3 className="mb-4 font-bold text-slate-800">Readiness Improvement Over Time</h3>
        <LineChart data={lineData} height={220} />
      </Card>

      {/* Before vs After Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-amber-100">
          <div className="mb-4 flex items-center gap-2">
            <ArrowLeft size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Before</h3>
          </div>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{m.label}</span>
                  <span className="font-bold text-amber-600">{m.before}%</span>
                </div>
                <ProgressBar value={m.before} color="warning" size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-emerald-100">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRight size={18} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800">After</h3>
          </div>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">{m.after}%</span>
                    <Badge variant={m.after > m.before ? 'success' : 'error'} size="sm">
                      {m.after > m.before ? `+${m.after - m.before}` : m.after < m.before ? `${m.after - m.before}` : '0'}
                    </Badge>
                  </div>
                </div>
                <ProgressBar value={m.after} color="success" size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        <Button onClick={() => navigate('/readiness')}>View Full Readiness</Button>
      </div>
    </div>
  );
}
