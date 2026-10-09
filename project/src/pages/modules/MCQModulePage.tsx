import { useState } from 'react';
import { ChevronLeft, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MCQAssessment } from '@/components/shared/MCQAssessment';
import { useData } from '@/context/DataContext';
import type { MCQQuestion } from '@/types';

interface MCQModulePageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  topics: string[];
  questionsByTopic: Record<string, MCQQuestion[]>;
  category: string;
  scoreKey: 'aptitude' | 'coreCS' | 'technical' | 'professional';
  updateScore: (key: 'aptitude' | 'coreCS' | 'technical' | 'professional', value: number) => void;
}

export function MCQModulePage({
  title,
  description,
  icon,
  topics,
  questionsByTopic,
  category,
  scoreKey,
  updateScore,
}: MCQModulePageProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { addAssessment } = useData();

  const handleComplete = (score: number, total: number) => {
    const pct = Math.round((score / total) * 100);
    addAssessment({
      id: crypto.randomUUID(),
      type: category,
      category: selectedTopic || title,
      score: pct,
      date: new Date().toISOString().split('T')[0],
      details: `${total} questions, ${score} correct`,
    });
    updateScore(scoreKey, pct);
  };

  if (selectedTopic) {
    const questions = questionsByTopic[selectedTopic];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ChevronLeft size={16} /> Back to topics
        </button>
        <MCQAssessment
          questions={questions}
          title={selectedTopic}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const qCount = questionsByTopic[topic]?.length || 0;
          return (
            <Card
              key={topic}
              hover
              onClick={() => setSelectedTopic(topic)}
              className="group"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                  <ListChecks size={20} />
                </div>
                <Badge variant="brand">{qCount} Qs</Badge>
              </div>
              <h3 className="mt-3 font-bold text-slate-800">{topic}</h3>
              <p className="mt-1 text-sm text-slate-500">Timed MCQ assessment with explanations</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
