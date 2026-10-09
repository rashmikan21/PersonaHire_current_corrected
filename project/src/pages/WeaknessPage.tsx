import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, TrendingDown, TrendingUp, Minus, Sparkles, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function WeaknessPage() {
  const { scores, recoveryPlanGenerated, setRecoveryPlanGenerated } = useData();
  const navigate = useNavigate();
  const [analyzed, setAnalyzed] = useState(false);

  const assessments = [
    { label: 'MCQ (Aptitude)', score: scores.aptitude },
    { label: 'Coding & DSA', score: scores.coding },
    { label: 'Core CS', score: scores.coreCS },
    { label: 'Technical', score: scores.technical },
    { label: 'Professional', score: scores.professional },
    { label: 'AI Interview', score: scores.aiInterview },
  ];

  const sorted = [...assessments].sort((a, b) => a.score - b.score);
  const weakAreas = sorted.filter((a) => a.score < 60);
  const moderateAreas = sorted.filter((a) => a.score >= 60 && a.score < 75);
  const strongAreas = sorted.filter((a) => a.score >= 75);

  const biggestWeakness = sorted[0];

  const handleGenerate = () => {
    setRecoveryPlanGenerated(true);
    navigate('/recovery');
  };

  if (!analyzed) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Weakness Detection</h2>
          <p className="text-sm text-slate-500">Let AI analyze your performance to identify improvement areas</p>
        </div>

        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Brain size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ready for AI Analysis</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Our AI will analyze your assessment scores across all categories to identify your weakest areas
            and generate a personalized improvement plan.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={() => setAnalyzed(true)}>
              <Sparkles size={18} /> Analyze My Performance
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-bold text-slate-700">Current Scores</h3>
          <div className="space-y-3">
            {assessments.map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{a.label}</span>
                  <span className="font-bold text-slate-700">{a.score}%</span>
                </div>
                <ProgressBar value={a.score} color={a.score >= 70 ? 'success' : a.score >= 55 ? 'warning' : 'error'} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI Weakness Detection Results</h2>
        <p className="text-sm text-slate-500">AI-powered analysis of your performance gaps</p>
      </div>

      <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <TrendingDown size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Your Biggest Improvement Area</h3>
            <p className="mt-1 text-brand-50">
              Based on your assessment scores, your biggest improvement area is{' '}
              <span className="font-bold text-white">{biggestWeakness.label}</span> ({biggestWeakness.score}%).
              Focus on this area to maximize your placement readiness.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-red-100">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-500" />
            <h3 className="font-bold text-slate-800">Weak</h3>
          </div>
          <div className="space-y-3">
            {weakAreas.length > 0 ? weakAreas.map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                  <Badge variant="error" size="sm">{a.score}%</Badge>
                </div>
                <ProgressBar value={a.score} color="error" size="sm" />
              </div>
            )) : <p className="text-sm text-slate-400">No weak areas!</p>}
          </div>
        </Card>

        <Card className="border-amber-100">
          <div className="mb-3 flex items-center gap-2">
            <Minus size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Moderate</h3>
          </div>
          <div className="space-y-3">
            {moderateAreas.length > 0 ? moderateAreas.map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                  <Badge variant="warning" size="sm">{a.score}%</Badge>
                </div>
                <ProgressBar value={a.score} color="warning" size="sm" />
              </div>
            )) : <p className="text-sm text-slate-400">No moderate areas.</p>}
          </div>
        </Card>

        <Card className="border-emerald-100">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-bold text-slate-800">Strong</h3>
          </div>
          <div className="space-y-3">
            {strongAreas.length > 0 ? strongAreas.map((a) => (
              <div key={a.label}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">{a.label}</span>
                  <Badge variant="success" size="sm">{a.score}%</Badge>
                </div>
                <ProgressBar value={a.score} color="success" size="sm" />
              </div>
            )) : <p className="text-sm text-slate-400">No strong areas yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="text-center bg-gradient-to-r from-slate-50 to-brand-50/30">
        <h3 className="text-lg font-bold text-slate-800">Generate Your Personalized Recovery Plan</h3>
        <p className="mt-1 text-sm text-slate-500">
          Get a day-by-day improvement plan tailored to your weak areas
        </p>
        <div className="mt-4">
          <Button size="lg" onClick={handleGenerate}>
            <Sparkles size={18} /> Generate My Improvement Plan
            <ArrowRight size={16} />
          </Button>
        </div>
        {recoveryPlanGenerated && (
          <p className="mt-3 text-sm text-emerald-600">
            Recovery plan already generated! Click to update it.
          </p>
        )}
      </Card>
    </div>
  );
}
