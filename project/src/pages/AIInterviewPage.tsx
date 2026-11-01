import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  LoaderCircle,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useData } from '@/context/DataContext';
import type {
  InterviewCategory,
  InterviewDifficulty,
  InterviewEvaluation,
  InterviewReport,
  InterviewSessionRecord,
  InterviewTurnRecord,
} from '@/types';
import { cn } from '@/utils/cn';

type InterviewQuestionPayload = {
  sessionId: string;
  questionId: string;
  question: string;
  role: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  questionNumber: number;
  totalQuestions: number;
};

type LoadingAction = 'starting' | 'evaluating' | 'next' | 'report' | null;

type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = Event & {
  results: {
    length: number;
    [index: number]: { [resultIndex: number]: SpeechRecognitionResultLike };
  };
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const roles = [
  'Software Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Python Developer',
  'Java Developer',
];

const categories: InterviewCategory[] = [
  'Technical',
  'HR',
  'Behavioral',
  'Programming Concepts',
];

const difficulties: InterviewDifficulty[] = ['Easy', 'Medium', 'Hard'];

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Cannot connect to PersonaHire. Check that the Flask backend is running.');
  }

  let payload: { message?: string };
  try {
    payload = await response.json() as { message?: string };
  } catch {
    throw new Error('The server returned an unreadable response. Please try again.');
  }

  if (!response.ok) {
    throw new Error(payload.message || 'The interview request failed. Please try again.');
  }

  return payload as T;
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-800">{score}/10</p>
      <ProgressBar
        value={score * 10}
        color={score >= 7 ? 'success' : score >= 5 ? 'warning' : 'error'}
        size="sm"
      />
    </div>
  );
}

function FeedbackList({ title, items, tone }: {
  title: string;
  items: string[];
  tone: 'success' | 'warning' | 'brand';
}) {
  const colors = {
    success: 'border-emerald-100 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-100 bg-amber-50 text-amber-900',
    brand: 'border-brand-100 bg-brand-50 text-brand-900',
  };

  return (
    <div className={cn('rounded-lg border p-4', colors[tone])}>
      <h4 className="text-sm font-bold">{title}</h4>
      {items.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm">None identified.</p>
      )}
    </div>
  );
}

export function AIInterviewPage() {
  const { completeInterviewSession, interviewSessions } = useData();
  const [role, setRole] = useState(roles[0]);
  const [category, setCategory] = useState<InterviewCategory>('Technical');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Medium');
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestionPayload | null>(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [turns, setTurns] = useState<InterviewTurnRecord[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState<LoadingAction>(null);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const SpeechRecognition = typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. Use a recent Chrome or Edge, or type your answer.');
      return;
    }

    setSpeechError('');
    try {
      const recognition = new SpeechRecognition();
      const existingAnswer = answer.trim();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length }, (_, index) =>
          event.results[index][0]?.transcript ?? ''
        ).join(' ').trim();
        setAnswer([existingAnswer, transcript].filter(Boolean).join(' '));
      };
      recognition.onerror = (event) => {
        setSpeechError(`Microphone error: ${event.error}. Check microphone permission and try again.`);
        setListening(false);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch {
      setSpeechError('Could not start microphone input. Check browser permission and try again.');
    }
  };

  const startInterview = async () => {
    setLoading('starting');
    setError('');
    setSpeechError('');
    setTurns([]);
    setEvaluation(null);
    setReport(null);
    setAnswer('');
    try {
      const question = await postJson<InterviewQuestionPayload>(
        '/api/interviews/questions',
        { role, category, difficulty },
      );
      setActiveQuestion(question);
      speak(question.question);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not start the interview.');
    } finally {
      setLoading(null);
    }
  };

  const submitAnswer = async () => {
    if (!activeQuestion || !answer.trim() || evaluation || loading) return;
    stopListening();
    setLoading('evaluating');
    setError('');
    try {
      const result = await postJson<{
        questionNumber: number;
        evaluation: InterviewEvaluation;
      }>('/api/interviews/evaluate', {
        sessionId: activeQuestion.sessionId,
        questionId: activeQuestion.questionId,
        answer: answer.trim(),
      });
      const nextEvaluation = result.evaluation;
      setEvaluation(nextEvaluation);
      setTurns((current) => [...current, {
        questionId: activeQuestion.questionId,
        question: activeQuestion.question,
        answer: answer.trim(),
        difficulty: activeQuestion.difficulty,
        evaluation: nextEvaluation,
      }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not evaluate this answer.');
    } finally {
      setLoading(null);
    }
  };

  const loadNextQuestion = async () => {
    if (!activeQuestion || loading) return;
    setLoading('next');
    setError('');
    try {
      const question = await postJson<InterviewQuestionPayload>(
        '/api/interviews/questions',
        { sessionId: activeQuestion.sessionId },
      );
      setActiveQuestion(question);
      setAnswer('');
      setEvaluation(null);
      speak(question.question);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load the next question.');
    } finally {
      setLoading(null);
    }
  };

  const finishInterview = async () => {
    if (!activeQuestion || !evaluation || loading) return;
    setLoading('report');
    setError('');
    try {
      const result = await postJson<{
        sessionId: string;
        report: InterviewReport;
      }>('/api/interviews/report', { sessionId: activeQuestion.sessionId });
      const completedSession: InterviewSessionRecord = {
        id: result.sessionId,
        role,
        category,
        difficulty,
        date: new Date().toISOString().slice(0, 10),
        turns,
        report: result.report,
      };
      completeInterviewSession(completedSession);
      setReport(result.report);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not generate the interview report.');
    } finally {
      setLoading(null);
    }
  };

  const resetInterview = () => {
    stopListening();
    window.speechSynthesis?.cancel();
    setActiveQuestion(null);
    setAnswer('');
    setEvaluation(null);
    setTurns([]);
    setReport(null);
    setError('');
    setSpeechError('');
  };

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  if (report) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Interview Performance Report</h2>
            <p className="mt-1 text-sm text-slate-500">{role} · {category} · {difficulty}</p>
          </div>
          <Button variant="outline" onClick={resetInterview}>
            <RotateCcw size={16} /> New Interview
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm text-brand-100">Overall interview score</p>
              <p className="mt-1 text-4xl font-extrabold">{report.averageScore}/10</p>
            </div>
            <div className="text-sm text-brand-50">
              <p>{report.totalQuestionsAttempted} questions attempted</p>
              <p className="mt-1">{report.readinessAssessment}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card><p className="text-sm text-slate-500">Questions attempted</p><p className="mt-2 text-2xl font-bold text-slate-800">{report.totalQuestionsAttempted}</p></Card>
          <Card><p className="text-sm text-slate-500">Technical knowledge</p><p className="mt-2 text-2xl font-bold text-slate-800">{report.technicalKnowledgePerformance}/10</p></Card>
          <Card><p className="text-sm text-slate-500">Communication</p><p className="mt-2 text-2xl font-bold text-slate-800">{report.communicationPerformance}/10</p></Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card><FeedbackList title="Strong areas" items={report.strongAreas} tone="success" /></Card>
          <Card><FeedbackList title="Areas to improve" items={report.weakAreas} tone="warning" /></Card>
          <Card><FeedbackList title="Frequently missing concepts" items={report.frequentlyMissingConcepts} tone="warning" /></Card>
          <Card><FeedbackList title="Personalized recommendations" items={report.personalizedRecommendations} tone="brand" /></Card>
        </div>

        <section className="space-y-4">
          <h3 className="font-bold text-slate-800">Question review</h3>
          {turns.map((turn, index) => (
            <Card key={turn.questionId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h4 className="font-semibold text-slate-800">Q{index + 1}. {turn.question}</h4>
                <Badge variant={turn.evaluation.overallScore >= 7 ? 'success' : 'warning'}>
                  {turn.evaluation.overallScore}/10
                </Badge>
              </div>
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{turn.answer}</p>
              <p className="mt-3 text-sm text-slate-700"><b>Improved answer:</b> {turn.evaluation.sampleImprovedAnswer}</p>
            </Card>
          ))}
        </section>
      </div>
    );
  }

  if (!activeQuestion) {
    const latestSession = interviewSessions[0];
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Bot size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI Mock Interview</h2>
            <p className="text-sm text-slate-500">Practice with role-specific questions and answer-by-answer feedback.</p>
          </div>
        </div>

        <Card>
          <h3 className="mb-5 font-bold text-slate-800">Configure your interview</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Job role
              <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">
                {roles.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600">
              Interview category
              <select value={category} onChange={(event) => setCategory(event.target.value as InterviewCategory)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600 sm:col-span-2">
              Difficulty
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as InterviewDifficulty)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 sm:max-w-xs">
                {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button fullWidth size="lg" className="mt-6" onClick={startInterview} disabled={loading !== null}>
            {loading === 'starting' ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading === 'starting' ? 'Generating first question...' : 'Start Mock Interview'}
          </Button>
        </Card>

        <Card className="border-blue-100 bg-blue-50/50">
          <div className="flex gap-3"><Volume2 className="shrink-0 text-blue-600" size={20} /><div>
            <p className="font-semibold text-slate-700">Speak or type your answer</p>
            <p className="mt-1 text-xs text-slate-500">Voice input uses your browser’s speech recognition. A text response is always available as an alternative.</p>
          </div></div>
        </Card>

        {latestSession && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm font-semibold text-slate-700">Previous interview</p><p className="mt-1 text-xs text-slate-500">{latestSession.role} · {latestSession.category} · {latestSession.date}</p></div>
              <Badge variant="brand">{latestSession.report.averageScore}/10</Badge>
            </div>
          </Card>
        )}
      </div>
    );
  }

  const progress = (activeQuestion.questionNumber / activeQuestion.totalQuestions) * 100;
  const isLastQuestion = activeQuestion.questionNumber === activeQuestion.totalQuestions;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={resetInterview} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ChevronLeft size={16} /> Exit interview
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="brand">Question {activeQuestion.questionNumber} / {activeQuestion.totalQuestions}</Badge>
          <Badge variant={difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : 'error'}>{difficulty}</Badge>
        </div>
      </div>

      <ProgressBar value={progress} label="Interview progress" showValue color="brand" />

      <Card className="bg-gradient-to-br from-brand-50 to-blue-50/50 border-brand-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><Bot size={20} /></div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2"><span className="font-semibold text-slate-800">AI Interviewer</span><Badge variant="success" size="sm">Live evaluation</Badge></div>
            <p className="text-sm text-slate-600">{role} · {category}</p>
          </div>
          <button title="Speak question" aria-label="Speak question" onClick={() => speak(activeQuestion.question)} className="rounded-lg p-2 text-brand-600 hover:bg-white"><Volume2 size={20} /></button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Bot size={18} /></div><span className="text-sm font-semibold text-slate-500">Question {activeQuestion.questionNumber}</span></div>
        <p className="text-lg font-medium text-slate-800">{activeQuestion.question}</p>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-bold text-slate-800">Your answer</h3><p className="text-xs text-slate-500">Type below or use speech recognition.</p></div>
          {listening && <Badge variant="error">Listening...</Badge>}
        </div>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={loading === 'evaluating' || loading === 'report'}
          rows={5}
          maxLength={6000}
          placeholder="Write your answer here, or start speaking..."
          className="mt-4 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{answer.length}/6000</span>
          <div className="flex flex-wrap justify-end gap-3">
            {!listening ? (
              <Button variant="outline" onClick={startListening} disabled={loading !== null || !!evaluation}><Mic size={17} /> Start speaking</Button>
            ) : (
              <Button variant="danger" onClick={stopListening}><MicOff size={17} /> Stop speaking</Button>
            )}
            {!evaluation && (
              <Button onClick={submitAnswer} disabled={!answer.trim() || loading !== null}>
                {loading === 'evaluating' ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading === 'evaluating' ? 'Evaluating answer...' : 'Submit answer'}
              </Button>
            )}
          </div>
        </div>
        {speechError && <p role="alert" className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle size={17} className="shrink-0" />{speechError}</p>}
        {error && <p role="alert" className="mt-3 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={17} className="shrink-0" />{error}</p>}
      </Card>

      {evaluation && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-brand-600" /><h3 className="font-bold text-slate-800">AI answer evaluation</h3></div>
            <span className="text-2xl font-extrabold text-brand-600">{evaluation.overallScore}/10</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreTile label="Relevance" score={evaluation.relevanceScore} />
            <ScoreTile label="Technical accuracy" score={evaluation.technicalAccuracyScore} />
            <ScoreTile label="Completeness" score={evaluation.completenessScore} />
            <ScoreTile label="Communication" score={evaluation.communicationScore} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <FeedbackList title="Strengths" items={evaluation.strengths} tone="success" />
            <FeedbackList title="Missing concepts" items={evaluation.missingConcepts} tone="warning" />
            <FeedbackList title="Mistakes or misconceptions" items={evaluation.mistakes} tone="warning" />
            <FeedbackList title="Specific improvement suggestions" items={evaluation.improvementSuggestions} tone="brand" />
          </div>
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h4 className="text-sm font-bold text-blue-900">Sample improved answer</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm text-blue-900">{evaluation.sampleImprovedAnswer}</p>
          </div>
          <div className="mt-5 flex justify-end">
            {isLastQuestion ? (
              <Button onClick={finishInterview} disabled={loading !== null}>
                {loading === 'report' ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {loading === 'report' ? 'Generating report...' : 'Finish and view report'}
              </Button>
            ) : (
              <Button onClick={loadNextQuestion} disabled={loading !== null}>
                {loading === 'next' ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading === 'next' ? 'Generating next question...' : 'Next question'}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
