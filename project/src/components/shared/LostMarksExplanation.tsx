
import { CheckCircle2, XCircle, BookOpen, AlertCircle, Lightbulb, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export interface AnswerReviewItem {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface ScoreItem {
  label: string;
  value: number;
  max?: number;
}

export interface LostMarksExplanationProps {
  answers?: AnswerReviewItem[];
  scores?: ScoreItem[];
  mainIssue?: string;
  recommendation?: string;
}

export function LostMarksExplanation({
  answers,
  scores,
  mainIssue,
  recommendation,
}: LostMarksExplanationProps) {
  if (scores && scores.length > 0) {
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
              <ProgressBar
                value={s.value}
                max={s.max || 10}
                color={s.value >= 7 ? 'success' : s.value >= 5 ? 'warning' : 'error'}
                size="sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {mainIssue && (
            <div className="rounded-xl bg-white p-3 border border-amber-100">
              <div className="mb-1 flex items-center gap-1.5">
                <AlertCircle size={15} className="text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">Main Issue</span>
              </div>
              <p className="text-sm text-slate-600">{mainIssue}</p>
            </div>
          )}
          {recommendation && (
            <div className="rounded-xl bg-white p-3 border border-brand-100">
              <div className="mb-1 flex items-center gap-1.5">
                <Lightbulb size={15} className="text-brand-600" />
                <span className="text-sm font-semibold text-slate-700">Recommendation</span>
              </div>
              <p className="text-sm text-slate-600">{recommendation}</p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (!answers || answers.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Answer Review
          </h3>
          <p className="text-sm text-slate-500">
            Review your answers and understand the correct solutions.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {answers.map((item, index) => {
          const isCorrect =
            item.selectedAnswer.trim().toLowerCase() ===
            item.correctAnswer.trim().toLowerCase();

          return (
            <div
              key={`${index}-${item.question}`}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="mb-3 flex items-start gap-2">
                {isCorrect ? (
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <XCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                )}

                <div>
                  <p className="font-semibold text-slate-800">
                    Question {index + 1}: {item.question}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Correct answer' : 'Incorrect answer'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-7">
                {item.options.map((option, optionIndex) => {
                  const isSelected =
                    option.trim().toLowerCase() ===
                    item.selectedAnswer.trim().toLowerCase();

                  const isAnswer =
                    option.trim().toLowerCase() ===
                    item.correctAnswer.trim().toLowerCase();

                  return (
                    <div
                      key={`${optionIndex}-${option}`}
                      className={`rounded-lg border p-3 text-sm ${
                        isAnswer
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : isSelected
                            ? 'border-red-300 bg-red-50 text-red-800'
                            : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {option}
                      {isAnswer && (
                        <span className="ml-2 font-semibold">
                          — Correct answer
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="ml-2 font-semibold">
                          — Your answer
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Explanation
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default LostMarksExplanation;
