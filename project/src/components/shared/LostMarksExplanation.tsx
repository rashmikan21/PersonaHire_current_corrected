
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface AnswerReviewItem {
  question: string;
  options: string[];
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface LostMarksExplanationProps {
  answers: AnswerReviewItem[];
}

export function LostMarksExplanation({
  answers,
}: LostMarksExplanationProps) {
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
