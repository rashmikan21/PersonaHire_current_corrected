import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, Brain, CheckCircle2, ChevronLeft, Gauge, Mic, MicOff, Play, RotateCcw,
  Sparkles, Volume2, AlertTriangle, TrendingUp, TrendingDown
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { interviewQuestions, roles } from '@/data/mockData';
import { useData } from '@/context/DataContext';
import type { AnswerAnalysis, InterviewQuestion } from '@/types';
import { cn } from '@/utils/cn';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type InterviewType = 'Technical' | 'HR' | 'Behavioral';

type SpeechRecognitionResultLike = { [index: number]: { transcript: string } };
type SpeechRecognitionEventLike = Event & { results: { [index: number]: SpeechRecognitionResultLike } };
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

const difficultyConfig: Record<Difficulty, { color: string; bg: string; ring: string }> = {
  Easy: { color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
  Medium: { color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  Hard: { color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200' },
};

const evaluationRules: Record<string, { keywords: string[]; strengths: string[]; improvements: string[]; recommendations: string[] }> = {
  iq1: {
    keywords: ['array', 'linked list', 'contiguous', 'random access', 'insertion', 'deletion', 'o(1)', 'pointer'],
    strengths: ['You compared the two data structures rather than describing only one.', 'You connected the choice of structure to practical operations.'],
    improvements: ['Mention memory layout and random-access complexity explicitly.', 'Explain when frequent insertions or deletions make a linked list useful.'],
    recommendations: ['Revise array vs linked-list time complexities and give one real use case for each.'],
  },
  iq2: {
    keywords: ['requirements', 'url', 'base62', 'database', 'cache', 'redis', 'collision', 'scaling'],
    strengths: ['You addressed system components relevant to a URL shortener.', 'Your answer considered how the service could scale.'],
    improvements: ['Explain how a short URL maps to the original URL.', 'Discuss ID generation, storage, caching and collision handling in a clear order.'],
    recommendations: ['Practice system-design answers using requirements → design → storage → scaling → failure handling.'],
  },
  iq3: {
    keywords: ['slow', 'fast', 'pointer', 'cycle', 'floyd', 'o(n)', 'o(1)', 'linked list'],
    strengths: ['You identified the cycle-detection problem and its pointer-based solution.', 'You discussed complexity, which is important for this question.'],
    improvements: ['State exactly why the slow and fast pointers meet when a cycle exists.', 'Give both time and space complexity and explain the role of each pointer.'],
    recommendations: ['Practice explaining Floyd’s algorithm step-by-step with a small example.'],
  },
  iq4: {
    keywords: ['name', 'degree', 'college', 'skills', 'role', 'interest', 'project', 'experience'],
    strengths: ['Your introduction included information relevant to your career profile.', 'You connected your background to the role.'],
    improvements: ['Keep the introduction structured: present → skills → project/achievement → why this role.', 'Avoid unrelated personal details.'],
    recommendations: ['Prepare a 60–90 second introduction tailored to your target role.'],
  },
  iq5: {
    keywords: ['skills', 'growth', 'learn', 'career', 'responsibility', 'role', 'team', 'leadership'],
    strengths: ['You described a forward-looking career direction.', 'Your answer showed interest in learning and professional growth.'],
    improvements: ['Connect your goals to skills you want to build and responsibilities you want to take on.', 'Avoid focusing only on job title or salary.'],
    recommendations: ['Frame your answer around learning, contribution, increasing responsibility and long-term growth.'],
  },
  iq6: {
    keywords: ['situation', 'task', 'action', 'result', 'challenge', 'problem', 'solution', 'learned'],
    strengths: ['You described a real challenge and your response to it.', 'You focused on actions rather than only describing the problem.'],
    improvements: ['Use the STAR structure and make your personal contribution clear.', 'End with a concrete result or lesson learned.'],
    recommendations: ['Prepare two project examples that can be explained using Situation, Task, Action and Result.'],
  },
  iq7: {
    keywords: ['conflict', 'listen', 'communication', 'team', 'discuss', 'resolve', 'solution', 'respect'],
    strengths: ['You addressed how communication can resolve a team disagreement.', 'Your answer showed awareness of collaboration.'],
    improvements: ['Explain what you personally did to resolve the disagreement.', 'Mention the outcome and what you learned about teamwork.'],
    recommendations: ['Practice conflict examples that demonstrate listening, calm communication and a measurable resolution.'],
  },
  iq8: {
    keywords: ['polymorphism', 'overriding', 'interface', 'class', 'object', 'shape', 'method', 'runtime'],
    strengths: ['You attempted to connect polymorphism with object-oriented behavior.', 'You used or referred to a practical programming concept.'],
    improvements: ['Define polymorphism first, then show how the same interface can produce different behavior.', 'Include a concrete example such as Shape with Circle and Square.'],
    recommendations: ['Practice explaining OOP concepts with one definition and one simple code-level example.'],
  },
  iq9: {
    keywords: ['explain', 'index', 'indexing', 'query', 'execution plan', 'explain', 'cache', 'join', 'scan', 'partition'],
    strengths: ['You identified database-level techniques for improving query performance.', 'You focused on diagnosing the query rather than blindly changing the database.'],
    improvements: ['Start by inspecting the execution plan, then discuss indexes and query rewrites.', 'Mention the trade-off between faster reads and extra index/storage/write cost.'],
    recommendations: ['Practice SQL tuning using EXPLAIN and learn to identify full table scans and missing indexes.'],
  },
  iq10: {
    keywords: ['skills', 'experience', 'project', 'role', 'value', 'contribution', 'team', 'achievement'],
    strengths: ['You highlighted qualities relevant to the role.', 'You explained how your skills could contribute to the team.'],
    improvements: ['Use one specific project or achievement as evidence instead of generic claims.', 'Connect your strongest skill directly to the role requirement.'],
    recommendations: ['Prepare a concise value statement backed by one measurable project or achievement.'],
  },
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#. ]/g, ' ');
}

function evaluateAnswer(question: InterviewQuestion, rawAnswer: string): AnswerAnalysis {
  const answer = normalize(rawAnswer.trim());
  const words = answer.split(/\s+/).filter(Boolean);
  const unknown = /^(i don'?t know|idk|no idea|i have no idea|not sure|i don't know the answer)[.! ]*$/i.test(rawAnswer.trim()) || /\bi don'?t know\b|\bno idea\b|\bnot sure\b/i.test(rawAnswer.trim()) && words.length < 10;
  const rule = evaluationRules[question.id] ?? { keywords: [], strengths: ['You attempted the question.'], improvements: ['Add more specific details and examples.'], recommendations: ['Practice explaining this topic with a structured answer.'] };
  const matched = rule.keywords.filter((keyword) => answer.includes(normalize(keyword))).length;
  const coverage = rule.keywords.length ? matched / rule.keywords.length : 0;
  const lengthFactor = Math.min(1, words.length / 45);

  if (unknown) {
    return {
      technicalAccuracy: question.type === 'Technical' ? 0 : 1,
      answerQuality: 0,
      communication: words.length <= 4 ? 2 : 3,
      problemSolving: 0,
      confidence: 1,
      relevance: 1,
      whatWentWell: 'You were honest about not knowing the answer instead of inventing information.',
      whatNeedsImprovement: `The response did not demonstrate the knowledge needed for “${question.question}”.`,
      recommendation: rule.recommendations[0],
    };
  }

  const accuracy = Math.min(10, Math.max(2, Math.round(coverage * 8 + lengthFactor * 2)));
  const relevance = Math.min(10, Math.max(2, Math.round(coverage * 8 + 2)));
  const communication = Math.min(10, Math.max(3, Math.round(5 + Math.min(3, words.length / 25) - (/\b(um|uh|like|you know)\b/g.test(answer) ? 1 : 0))));
  const answerQuality = Math.min(10, Math.max(2, Math.round((accuracy + relevance + communication) / 3)));
  const problemSolving = question.type === 'Technical' ? Math.min(10, Math.max(2, Math.round(accuracy * 0.75 + (answer.includes('because') || answer.includes('approach') || answer.includes('step') ? 2 : 0)))) : Math.min(10, Math.max(3, answerQuality));
  const confidence = Math.min(10, Math.max(3, Math.round(communication + (answer.length > 180 ? 1 : 0))));
  const strength = rule.strengths[matched % rule.strengths.length];
  const improvement = coverage >= 0.65 && words.length >= 25 ? rule.improvements[1 % rule.improvements.length] : rule.improvements[0];
  const recommendation = coverage >= 0.65 ? rule.recommendations[0] : rule.improvements[rule.improvements.length - 1];

  return { technicalAccuracy: accuracy, answerQuality, communication, problemSolving, confidence, relevance, whatWentWell: strength, whatNeedsImprovement: improvement, recommendation };
}

function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function AIInterviewPage() {
  const { addAssessment, setScores, scores, recordActivity } = useData();
  const [started, setStarted] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [selectedType, setSelectedType] = useState<InterviewType>('Technical');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 years)');
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [analysis, setAnalysis] = useState<AnswerAnalysis | null>(null);
  const [difficultyChangeMsg, setDifficultyChangeMsg] = useState('');
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [allAnalyses, setAllAnalyses] = useState<{ question: string; answer: string; analysis: AnswerAnalysis }[]>([]);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const filteredQuestions = useMemo(() => interviewQuestions.filter((q) => q.type === selectedType), [selectedType]);
  const currentQuestion = filteredQuestions[currentQIdx];
  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;

  const handleStart = () => {
    setStarted(true); setCurrentQIdx(0); setDifficulty('Easy'); setAllAnalyses([]); setInterviewComplete(false); setAnalysis(null); setAnswer(''); setSpeechError('');
    setTimeout(() => speak(filteredQuestions[0]?.question ?? ''), 150);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. Please use the latest Chrome or Edge.');
      return;
    }
    setSpeechError('');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0]?.transcript ?? '';
      setAnswer(transcript.trim());
    };
    recognition.onerror = (event) => { setSpeechError(`Microphone error: ${event.error}. Please allow microphone access and try again.`); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setListening(false); };

  const submitAnswer = () => {
    if (!answer.trim() || !currentQuestion) return;
    stopListening();
    setAnalysis(evaluateAnswer(currentQuestion, answer));
  };

  const nextQuestion = () => {
    if (!currentQuestion || !analysis) return;
    const avg = (analysis.technicalAccuracy + analysis.answerQuality + analysis.communication + analysis.problemSolving + analysis.relevance) / 5;
    const updated = [...allAnalyses, { question: currentQuestion.question, answer, analysis }];
    setAllAnalyses(updated);
    const previous = difficulty;
    const next: Difficulty = avg >= 7.2 ? (difficulty === 'Easy' ? 'Medium' : 'Hard') : avg < 4.5 ? (difficulty === 'Hard' ? 'Medium' : 'Easy') : difficulty;
    setDifficulty(next);
    const level = { Easy: 0, Medium: 1, Hard: 2 };
    if (next !== previous) setDifficultyChangeMsg(level[next] > level[previous] ? 'Difficulty increased because your previous answer was strong.' : 'Difficulty decreased because your previous answer needs improvement.');
    else setDifficultyChangeMsg('Difficulty maintained because your previous answer was around the expected level.');
    if (currentQIdx < filteredQuestions.length - 1) {
      setCurrentQIdx((v) => v + 1); setAnswer(''); setAnalysis(null);
      setTimeout(() => speak(filteredQuestions[currentQIdx + 1]?.question ?? ''), 100);
    } else {
      const finalScore = Math.round(updated.reduce((sum, item) => sum + ((item.analysis.technicalAccuracy + item.analysis.answerQuality + item.analysis.communication + item.analysis.problemSolving + item.analysis.relevance) / 5) * 10, 0) / updated.length);
      addAssessment({ id: crypto.randomUUID(), type: 'AI Interview', category: selectedType, score: finalScore, date: new Date().toISOString().split('T')[0], details: `${updated.length} voice questions · ${selectedRole}` });
      setScores({ ...scores, aiInterview: Math.round((scores.aiInterview + finalScore) / 2) });
      recordActivity('practice', 20);
      setInterviewComplete(true);
    }
  };

  const restart = () => { stopListening(); window.speechSynthesis?.cancel(); setStarted(false); setAnalysis(null); setAnswer(''); setAllAnalyses([]); setInterviewComplete(false); setDifficultyChangeMsg(''); };

  useEffect(() => () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  if (!started) {
    return <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Bot size={24}/></div><div><h2 className="text-2xl font-bold text-slate-800">AI Voice Mock Interview</h2><p className="text-sm text-slate-500">Speak naturally — PersonaHire evaluates each answer and adapts the next question.</p></div></div>
      <Card><h3 className="mb-4 font-bold text-slate-800">Configure Your Interview</h3><div className="space-y-5">
        <div><label className="mb-2 block text-sm font-medium text-slate-600">Job Role</label><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{roles.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-600">Experience Level</label><select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option>Fresher (0-1 years)</option><option>Junior (1-3 years)</option><option>Mid-level (3-5 years)</option></select></div>
        <div><label className="mb-2 block text-sm font-medium text-slate-600">Interview Type</label><div className="grid gap-3 sm:grid-cols-3">{(['Technical','HR','Behavioral'] as InterviewType[]).map((type) => <button key={type} onClick={() => setSelectedType(type)} className={cn('rounded-xl border-2 p-4 text-left', selectedType === type ? 'border-brand-400 bg-brand-50' : 'border-slate-200')}><div className="flex items-center gap-2"><Brain size={18} className="text-brand-600"/><span className="font-semibold text-slate-700">{type}</span></div><p className="mt-1 text-xs text-slate-500">{type === 'Technical' ? 'Technical concepts and problem solving' : type === 'HR' ? 'Career and motivation questions' : 'Situational and teamwork questions'}</p></button>)}</div></div>
      </div><Button fullWidth size="lg" className="mt-6" onClick={handleStart}><Mic size={18}/> Start Voice Interview</Button></Card>
      <Card className="bg-blue-50/50 border-blue-100"><div className="flex gap-3"><Volume2 className="text-blue-600" size={20}/><div><p className="font-semibold text-slate-700">Voice-only answering</p><p className="text-xs text-slate-500">The interviewer speaks the question. Use your microphone to answer; typing is intentionally disabled.</p></div></div></Card>
    </div>;
  }

  if (interviewComplete) {
    const avgScore = Math.round(allAnalyses.reduce((sum, item) => sum + ((item.analysis.technicalAccuracy + item.analysis.answerQuality + item.analysis.communication + item.analysis.problemSolving + item.analysis.relevance) / 5) * 10, 0) / Math.max(1, allAnalyses.length));
    return <div className="mx-auto max-w-4xl space-y-6"><Card className="text-center"><div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50"><span className="text-2xl font-bold text-brand-600">{avgScore}%</span></div><h3 className="text-xl font-bold text-slate-800">Voice Interview Complete</h3><p className="mt-1 text-sm text-slate-500">Your score is based on question-specific answer analysis, not a random score.</p><Button variant="outline" className="mt-4" onClick={restart}><RotateCcw size={16}/> New Interview</Button></Card>
      <div className="space-y-4"><h4 className="font-bold text-slate-700">Question-by-Question Feedback</h4>{allAnalyses.map((item, i) => <Card key={i}><p className="font-semibold text-slate-800">Q{i + 1}. {item.question}</p><p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Your spoken answer: “{item.answer}”</p><div className="mt-4 grid gap-3 sm:grid-cols-5">{[['Accuracy',item.analysis.technicalAccuracy],['Quality',item.analysis.answerQuality],['Communication',item.analysis.communication],['Problem Solving',item.analysis.problemSolving],['Relevance',item.analysis.relevance]].map(([label,value]) => <div key={label as string} className="rounded-lg bg-slate-50 p-2 text-center"><p className="text-xs text-slate-500">{label}</p><p className="font-bold text-slate-700">{value}/10</p></div>)}</div><div className="mt-4 space-y-2 text-sm"><p className="text-emerald-700"><b>What went well:</b> {item.analysis.whatWentWell}</p><p className="text-amber-700"><b>Needs improvement:</b> {item.analysis.whatNeedsImprovement}</p><p className="text-brand-700"><b>Recommendation:</b> {item.analysis.recommendation}</p></div></Card>)}</div></div>;
  }

  const dc = difficultyConfig[difficulty];
  const avgLive = analysis ? Math.round((analysis.technicalAccuracy + analysis.answerQuality + analysis.communication + analysis.problemSolving + analysis.relevance) / 5 * 10) : 0;
  return <div className="mx-auto max-w-4xl space-y-6">
    <div className="flex items-center justify-between"><button onClick={restart} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"><ChevronLeft size={16}/> Exit Interview</button><div className="flex items-center gap-3"><Badge variant="brand">Q {currentQIdx + 1} / {filteredQuestions.length}</Badge><div className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 ring-1', dc.bg, dc.color, dc.ring)}><Gauge size={16}/><span className="text-sm font-semibold">{difficulty}</span></div></div></div>
    {difficultyChangeMsg && <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{difficultyChangeMsg.includes('increased') ? <TrendingUp size={16}/> : difficultyChangeMsg.includes('decreased') ? <TrendingDown size={16}/> : <CheckCircle2 size={16}/>} {difficultyChangeMsg}</div>}
    <Card className="bg-gradient-to-br from-brand-50 to-blue-50/50 border-brand-100"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white animate-pulse-ring"><Bot size={20}/></div><div className="flex-1"><div className="mb-1 flex items-center gap-2"><span className="font-semibold text-slate-800">AI Interviewer</span><Badge variant="success" size="sm">Voice</Badge></div><p className="text-sm text-slate-600">{selectedRole} · {selectedType} · {experienceLevel}</p></div><button title="Speak question" onClick={() => speak(currentQuestion?.question ?? '')} className="rounded-lg p-2 text-brand-600 hover:bg-white"><Volume2 size={20}/></button></div></Card>
    <Card><div className="mb-2 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Brain size={18}/></div><span className="text-sm font-semibold text-slate-500">Question {currentQIdx + 1}</span><Badge variant={difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : 'error'} size="sm">{difficulty}</Badge></div><p className="text-lg font-medium text-slate-800">{currentQuestion?.question}</p></Card>
    <Card><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-800">Your Voice Answer</h3><p className="text-xs text-slate-500">Speak clearly and answer as you would in a real interview.</p></div>{listening && <Badge variant="error">Listening...</Badge>}</div><div className={cn('mt-4 min-h-36 rounded-2xl border-2 p-5', listening ? 'border-brand-300 bg-brand-50/30' : 'border-slate-200 bg-slate-50')}><div className="flex items-center gap-3"><div className={cn('flex h-12 w-12 items-center justify-center rounded-full', listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-500')}>{listening ? <Mic size={22}/> : <MicOff size={22}/>}</div><p className="text-sm text-slate-600">{answer || (listening ? 'Listening to your answer…' : 'Press “Start Speaking” and answer using your microphone.')}</p></div></div><div className="mt-4 flex flex-wrap justify-end gap-3">{!listening ? <Button variant="outline" onClick={startListening}><Mic size={17}/> Start Speaking</Button> : <Button variant="danger" onClick={stopListening}><MicOff size={17}/> Stop Speaking</Button>} {!analysis && <Button onClick={submitAnswer} disabled={!answer.trim()}><Sparkles size={16}/> Analyze Answer</Button>}{analysis && <Button onClick={nextQuestion}>{currentQIdx < filteredQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}</Button>}</div>{speechError && <div className="mt-3 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={17} className="shrink-0"/>{speechError}</div>}</Card>
    {analysis && <Card className="animate-fadeIn"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={20} className="text-brand-600"/><h3 className="font-bold text-slate-800">Question-Specific AI Analysis</h3></div><span className="text-xl font-extrabold text-brand-600">{avgLive}%</span></div><div className="grid gap-4 sm:grid-cols-2">{[['Technical Accuracy',analysis.technicalAccuracy],['Answer Quality',analysis.answerQuality],['Communication',analysis.communication],['Problem Solving',analysis.problemSolving],['Confidence',analysis.confidence],['Relevance',analysis.relevance]].map(([label,value]) => <ProgressBar key={label as string} value={(value as number) * 10} label={label as string} showValue color={(value as number) >= 7 ? 'success' : (value as number) >= 5 ? 'warning' : 'error'}/>)}</div><div className="mt-5 grid gap-3"><div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><b>What went well:</b> {analysis.whatWentWell}</div><div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><b>Needs improvement:</b> {analysis.whatNeedsImprovement}</div><div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800"><b>Recommendation:</b> {analysis.recommendation}</div></div></Card>}
  </div>;
}
