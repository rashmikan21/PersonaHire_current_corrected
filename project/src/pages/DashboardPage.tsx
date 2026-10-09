import { useNavigate } from 'react-router-dom';
import {
  Code2, Brain, Cpu, Wrench, Users, Bot, TrendingUp, Target,
  ArrowRight, Zap, CheckCircle2, AlertTriangle, Rocket, Lightbulb,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Card, StatCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge, Button } from '@/components/ui/Badge';
import { DonutChart, BarChart } from '@/components/ui/Charts';

export function DashboardPage() {
  const { scores, initialScores, profile, streak, problemsSolved, practiceMinutes } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const overall = Math.round(
    (scores.coding + scores.aptitude + scores.coreCS + scores.technical + scores.professional + scores.aiInterview) / 6
  );
  const initialOverall = Math.round(
    (initialScores.coding + initialScores.aptitude + initialScores.coreCS + initialScores.technical + initialScores.professional + initialScores.aiInterview) / 6
  );
  const improvement = overall - initialOverall;

  const scoreCards = [
    { title: 'Coding Score', value: scores.coding, icon: <Code2 size={20} />, color: 'brand' as const },
    { title: 'Aptitude Score', value: scores.aptitude, icon: <Brain size={20} />, color: 'blue' as const },
    { title: 'Core CS Score', value: scores.coreCS, icon: <Cpu size={20} />, color: 'success' as const },
    { title: 'Technical Score', value: scores.technical, icon: <Wrench size={20} />, color: 'warning' as const },
    { title: 'Professional Score', value: scores.professional, icon: <Users size={20} />, color: 'brand' as const },
    { title: 'AI Interview Score', value: scores.aiInterview, icon: <Bot size={20} />, color: 'blue' as const },
  ];

  const allCategories = [
    { name: 'Communication', score: scores.professional },
    { name: 'OOP', score: scores.coreCS },
    { name: 'SQL', score: scores.coreCS },
    { name: 'Coding', score: scores.coding },
    { name: 'Technical Knowledge', score: scores.technical },
    { name: 'DSA', score: Math.max(30, scores.coding - 15) },
    { name: 'Aptitude', score: scores.aptitude },
    { name: 'Operating Systems', score: Math.max(35, scores.coreCS - 10) },
  ];

  const strengths = allCategories.filter((c) => c.score >= 70).slice(0, 4);
  const weakAreas = allCategories.filter((c) => c.score < 65).slice(0, 4);

  const barData = [
    { label: 'Coding', value: scores.coding, color: '#6366f1' },
    { label: 'Aptitude', value: scores.aptitude, color: '#3b82f6' },
    { label: 'Core CS', value: scores.coreCS, color: '#10b981' },
    { label: 'Technical', value: scores.technical, color: '#f59e0b' },
    { label: 'Prof.', value: scores.professional, color: '#8b5cf6' },
    { label: 'Interview', value: scores.aiInterview, color: '#06b6d4' },
  ];

  const workflowSteps = [
    { label: 'Profile', path: '/profile', done: !!profile },
    { label: 'Aptitude', path: '/aptitude', done: false },
    { label: 'Coding', path: '/coding', done: false },
    { label: 'Core CS', path: '/core-cs', done: false },
    { label: 'AI Interview', path: '/interview', done: false },
    { label: 'Readiness', path: '/readiness', done: false },
    { label: 'Recovery', path: '/recovery', done: false },
    { label: 'Re-Assess', path: '/reassessment', done: false },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h2>
        <p className="text-sm text-slate-500">Here's your placement readiness overview</p>
      </div>

      {/* Overall Score + Improvement */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center lg:col-span-1">
          <p className="mb-3 text-sm font-medium text-slate-500">Overall Placement Readiness</p>
          <DonutChart
            value={overall}
            label={`${overall}%`}
            sublabel="Ready"
            color={overall >= 70 ? '#10b981' : overall >= 50 ? '#f59e0b' : '#ef4444'}
            size={180}
          />
          <div className="mt-4 flex items-center gap-2">
            <Badge variant={improvement > 0 ? 'success' : 'warning'}>
              <TrendingUp size={12} /> {improvement > 0 ? `+${improvement}%` : '0%'} improvement
            </Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-bold text-slate-800">Score Breakdown</h3>
          <BarChart data={barData} height={200} />
        </Card>
      </div>

      {/* Practice streak */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Current Streak" value={streak} suffix=" days" icon={<TrendingUp size={20} />} color="warning" />
        <StatCard title="Problems Solved" value={problemsSolved} icon={<Code2 size={20} />} color="success" />
        <StatCard title="Practice Time" value={practiceMinutes} suffix=" min" icon={<Target size={20} />} color="blue" />
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scoreCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            suffix="%"
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Before vs After */}
      <Card className="bg-gradient-to-r from-slate-50 to-brand-50/30">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Before vs After Progress</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-slate-500">Initial Readiness</p>
            <p className="text-3xl font-bold text-slate-400">{initialOverall}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Current Readiness</p>
            <p className="text-3xl font-bold text-brand-600">{overall}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Improvement</p>
            <p className="text-3xl font-bold text-emerald-600">+{improvement}%</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={overall}
            max={100}
            label="Current Readiness"
            showValue
            color="brand"
            size="lg"
          />
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Zap size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Your Strengths</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                </div>
                <Badge variant="success">{s.score}%</Badge>
              </div>
            ))}
            {strengths.length === 0 && (
              <p className="text-sm text-slate-400">Complete assessments to identify your strengths.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-slate-800">Weak Areas</h3>
          </div>
          <div className="space-y-3">
            {weakAreas.map((w) => (
              <div key={w.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">{w.name}</span>
                </div>
                <Badge variant="warning">{w.score}%</Badge>
              </div>
            ))}
            {weakAreas.length === 0 && (
              <p className="text-sm text-slate-400">Great job! No significant weak areas detected.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recommended Next Step */}
      <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Target size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">Recommended Next Step</h3>
            <p className="mt-1 text-brand-50">
              {weakAreas.length > 0
                ? `Focus on ${weakAreas[0].name} for the next 3 days. Practice daily to improve your readiness score.`
                : 'Take a full placement simulation to test your readiness across all areas.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {weakAreas.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/recovery')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <Rocket size={16} /> Start Recovery Plan
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/simulation')}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Take Full Simulation <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Workflow */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={20} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">PersonaHire Workflow</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">Follow this path to maximize your placement readiness</p>
        <div className="flex flex-wrap items-center gap-2">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <button
                onClick={() => navigate(step.path)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  step.done
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {step.done && <CheckCircle2 size={14} />}
                {step.label}
              </button>
              {i < workflowSteps.length - 1 && <ArrowRight size={14} className="text-slate-300" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
