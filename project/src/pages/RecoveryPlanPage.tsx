import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Circle, Rocket, RotateCcw, TrendingUp } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function RecoveryPlanPage() {
  const { recoveryPlan, toggleRecoveryDay, scores } = useData();
  const navigate = useNavigate();
  const [planGenerated, setPlanGenerated] = useState(false);

  const completedDays = recoveryPlan.filter((d) => d.completed).length;
  const progress = Math.round((completedDays / recoveryPlan.length) * 100);

  const handleGenerate = () => {
    setPlanGenerated(true);
  };

  if (!planGenerated && completedDays === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Personalized Recovery Plan</h2>
          <p className="text-sm text-slate-500">Your AI-generated improvement roadmap</p>
        </div>

        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <CalendarClock size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">7-Day Recovery Plan</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Based on your assessment scores, we'll generate a personalized 7-day improvement plan
            targeting your weak areas with daily tasks and practice exercises.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={handleGenerate}>
              <Rocket size={18} /> Generate Recovery Plan
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-bold text-slate-700">Weak Areas Detected</h3>
          <div className="space-y-2">
            {Object.entries(scores).filter(([_, v]) => v < 65).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <span className="text-sm font-medium capitalize text-slate-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <Badge variant="warning">{value}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Personalized 7-Day Recovery Plan</h2>
          <p className="text-sm text-slate-500">Complete daily tasks to improve your readiness</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/reassessment')}>
          <RotateCcw size={16} /> Take Re-Assessment
        </Button>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-brand-50 to-blue-50/50 border-brand-100">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-extrabold text-brand-600">{progress}%</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-700">Plan Progress</p>
            <p className="text-xs text-slate-500">{completedDays} of {recoveryPlan.length} days completed</p>
            <div className="mt-2">
              <ProgressBar value={progress} color="brand" size="md" />
            </div>
          </div>
          {progress === 100 && (
            <Badge variant="success">
              <CheckCircle2 size={14} /> Complete!
            </Badge>
          )}
        </div>
      </Card>

      {/* Day-by-Day Plan */}
      <div className="space-y-4">
        {recoveryPlan.map((day) => (
          <Card key={day.day} className={day.completed ? 'border-emerald-200 bg-emerald-50/30' : ''}>
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleRecoveryDay(day.day)}
                className="mt-0.5 shrink-0"
              >
                {day.completed ? (
                  <CheckCircle2 size={24} className="text-emerald-500" />
                ) : (
                  <Circle size={24} className="text-slate-300 hover:text-brand-400" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={day.completed ? 'font-bold text-slate-500 line-through' : 'font-bold text-slate-800'}>
                    Day {day.day}: {day.topic}
                  </h3>
                  {day.completed && <Badge variant="success" size="sm">Completed</Badge>}
                </div>
                <div className="mt-2 space-y-1.5">
                  {day.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                      {task}
                    </div>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${day.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="text-sm font-bold">{day.day}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {progress === 100 && (
        <Card className="text-center bg-gradient-to-r from-emerald-50 to-brand-50/30 border-emerald-200">
          <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800">Recovery Plan Complete!</h3>
          <p className="mt-1 text-sm text-slate-500">
            You've completed all 7 days. Take a re-assessment to see how much you've improved.
          </p>
          <div className="mt-4">
            <Button size="lg" onClick={() => navigate('/reassessment')}>
              <TrendingUp size={18} /> Take Re-Assessment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
