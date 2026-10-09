import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import type { MCQQuestion } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { LostMarksExplanation } from '@/components/shared/LostMarksExplanation';

interface MCQAssessmentProps {
  questions: MCQQuestion[];
  title: string;
  onComplete: (score: number, total: number) => void;
}

export function MCQAssessment({ questions, title, onComplete }: MCQAssessmentProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    if (submitted || showResults) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitted, showResults]);

  const handleSelect = (optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSubmitted(false);
      setTimeLeft(60);
    } else {
      const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
      onComplete(correct, questions.length);
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setTimeLeft(60);
  };

  if (showResults) {
    const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correct / questions.length) * 100);
    const avgScore = score / 10;

    return (
      <div className="space-y-6">
        <Card className="text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${score >= 70 ? 'bg-emerald-100' : score >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
            <span className={`text-2xl font-bold ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Assessment Complete</h3>
          <p className="text-slate-500 mt-1">You scored {correct} out of {questions.length} correctly</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw size={16} /> Retry
            </Button>
          </div>
        </Card>

        <LostMarksExplanation
          scores={[
            { label: 'Technical Accuracy', value: Math.round(avgScore + 1) },
            { label: 'Answer Structure', value: Math.round(avgScore) },
            { label: 'Problem Solving', value: Math.round(avgScore - 0.5) },
            { label: 'Communication', value: Math.round(avgScore + 0.5) },
          ]}
          mainIssue={score >= 70
            ? 'Minor errors in a few questions — some answers were correct but reasoning could be more precise.'
            : 'Several concepts need review. Focus on understanding the fundamental principles behind each question.'}
          recommendation={score >= 70
            ? 'Review the questions you got wrong and practice similar problems to solidify your understanding.'
            : 'Go back to the study material for this topic. Practice more questions and focus on understanding why each answer is correct.'}
        />

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-700">Question Review</h4>
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <Card key={q.id} className="p-4">
                <div className="mb-2 flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Q{i + 1}. {q.question}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className={isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                        Your answer: {userAnswer ? q.options.find((o) => o.id === userAnswer)?.text : 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-600">
                          Correct answer: {q.options.find((o) => o.id === q.correctAnswer)?.text}
                        </p>
                      )}
                      <p className="mt-1 text-slate-500"><span className="font-medium">Explanation:</span> {q.explanation}</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <Badge variant="brand">{currentIdx + 1} / {questions.length}</Badge>
        </div>
        <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${timeLeft <= 10 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
          <Clock size={16} />
          <span className="font-semibold tabular-nums">{timeLeft}s</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-slate-800">{currentQ.question}</p>
      </div>

      <div className="space-y-2.5">
        {currentQ.options.map((opt) => {
          const isSelected = answers[currentQ.id] === opt.id;
          const isCorrect = opt.id === currentQ.correctAnswer;
          let style = 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50';

          if (submitted) {
            if (isCorrect) style = 'border-emerald-400 bg-emerald-50';
            else if (isSelected) style = 'border-red-400 bg-red-50';
            else style = 'border-slate-200 opacity-60';
          } else if (isSelected) {
            style = 'border-brand-400 bg-brand-50';
          }

          return (
            <button
              key={opt.id}
              disabled={submitted}
              onClick={() => handleSelect(opt.id)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${style}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                isSelected || (submitted && isCorrect) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {opt.id.toUpperCase()}
              </span>
              <span className="text-sm text-slate-700">{opt.text}</span>
              {submitted && isCorrect && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
              {submitted && isSelected && !isCorrect && <XCircle size={18} className="ml-auto text-red-500" />}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="mt-4 rounded-xl bg-blue-50 p-3 border border-blue-100">
          <p className="text-sm text-slate-600"><span className="font-semibold">Explanation:</span> {currentQ.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!answers[currentQ.id]}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </Card>
  );
}
