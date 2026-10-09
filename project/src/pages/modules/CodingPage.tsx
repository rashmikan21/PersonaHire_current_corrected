import { useMemo, useState } from 'react';
import { Code2, Play, CheckCircle2, XCircle, Clock, ChevronLeft, Trophy, Timer, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { LostMarksExplanation } from '@/components/shared/LostMarksExplanation';
import { codingProblems } from '@/data/mockData';
import { useData } from '@/context/DataContext';
import { cn } from '@/utils/cn';

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';
const difficultyColors: Record<string, string> = { Easy: 'text-emerald-600 bg-emerald-50', Medium: 'text-amber-600 bg-amber-50', Hard: 'text-red-600 bg-red-50' };
const languages = ['C++', 'Java', 'Python', 'JavaScript', 'C', 'C#', 'Go', 'Rust', 'Kotlin', 'TypeScript'];
const timeLimits: Record<string, number> = { Easy: 30, Medium: 45, Hard: 60 };

function starterFor(language: string, title: string, original: string) {
  const templates: Record<string, string> = {
    'C++': `#include <bits/stdc++.h>\nusing namespace std;\n\n// ${title}\n\nclass Solution {\npublic:\n    // Write your solution here\n};`,
    Java: `import java.util.*;\n\nclass Solution {\n    // ${title}\n    // Write your solution here\n}`,
    Python: `class Solution:\n    # ${title}\n    def solve(self):\n        # Write your solution here\n        pass`,
    JavaScript: original,
    C: `#include <stdio.h>\n\n// ${title}\nint main() {\n    // Write your solution here\n    return 0;\n}`,
    'C#': `using System;\n\npublic class Solution {\n    // ${title}\n    // Write your solution here\n}`,
    Go: `package main\n\nimport "fmt"\n\nfunc main() {\n    // ${title}\n    fmt.Println("Write your solution here")\n}`,
    Rust: `fn main() {\n    // ${title}\n    // Write your solution here\n}`,
    Kotlin: `class Solution {\n    // ${title}\n    // Write your solution here\n}`,
    TypeScript: `function solve(): void {\n  // ${title}\n  // Write your solution here\n}\n`,
  };
  return templates[language] ?? original;
}

export function CodingPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('All');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [language, setLanguage] = useState('C++');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'running' | 'pass' | 'fail'>('idle');
  const [showExplanation, setShowExplanation] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { addAssessment, recordActivity } = useData();

  const topics = ['Arrays', 'Strings', 'Linked Lists', 'Stack', 'Queue', 'HashMap', 'Trees', 'Searching', 'Sorting', 'Recursion', 'Dynamic Programming', 'Problem Solving'];
  const filtered = useMemo(() => codingProblems.filter((p) => (difficulty === 'All' || p.difficulty === difficulty) && (!selectedTopic || p.topic === selectedTopic)), [difficulty, selectedTopic]);
  const problem = codingProblems.find((p) => p.id === selectedProblem);
  const minutes = problem ? timeLimits[problem.difficulty] : 30;

  const selectProblem = (id: string) => {
    const p = codingProblems.find((item) => item.id === id);
    if (!p) return;
    setSelectedProblem(id); setLanguage('C++'); setCode(starterFor('C++', p.title, p.starterCode)); setResult('idle'); setShowExplanation(false); setElapsed(0);
  };
  const changeLanguage = (next: string) => { setLanguage(next); if (problem) setCode(starterFor(next, problem.title, problem.starterCode)); };
  const validateLanguage = (source: string, selected: string) => {
    const text = source.trim();
    const markers: Record<string, RegExp[]> = {
      'C++': [/^\s*#include\s*[<"]/m, /\busing\s+namespace\s+std\b/, /\bstd::/, /\bvector\s*</, /\bint\s+main\s*\(/],
      Java: [/\bpublic\s+class\b/, /\bimport\s+java\./, /\bSystem\.out\./, /\bpublic\s+static\s+void\s+main\b/],
      Python: [/^\s*(from|import)\s+\w+/m, /^\s*def\s+\w+\s*\(/m, /\bprint\s*\(/, /\bNone\b/],
      JavaScript: [/\b(const|let|var)\s+\w+/, /=>/, /\bconsole\.log\s*\(/, /\bfunction\s+\w+\s*\(/],
      C: [/^\s*#include\s*<stdio\.h>/m, /\bprintf\s*\(/, /\bint\s+main\s*\(/],
      'C#': [/\busing\s+System\b/, /\bConsole\.Write/, /\bpublic\s+class\b/],
      Go: [/\bpackage\s+main\b/, /\bfunc\s+main\s*\(/, /\bfmt\./],
      Rust: [/\bfn\s+main\s*\(/, /\bprintln!\s*\(/, /\blet\s+mut\b/],
      Kotlin: [/\bfun\s+main\s*\(/, /\bval\s+\w+/, /\bprintln\s*\(/],
      TypeScript: [/\binterface\s+\w+/, /:\s*(string|number|boolean|void|any)(\[\])?\b/, /\bfunction\s+\w+\s*\([^)]*:\s*\w+/],
    };
    const other: Record<string, RegExp[]> = {
      Python: [/\bdef\s+\w+\s*\(/, /\bprint\s*\(/, /\bNone\b/, /\bTrue\b|\bFalse\b/],
      JavaScript: [/=>/, /\bconsole\.log\s*\(/, /\b(const|let|var)\b/],
      'C++': [/#include\s*[<"]/, /\busing\s+namespace\s+std\b/, /\bstd::/],
      Java: [/\bpublic\s+class\b/, /\bSystem\.out\./],
      C: [/#include\s*<stdio\.h>/, /\bprintf\s*\(/],
      'C#': [/\busing\s+System\b/, /\bConsole\.Write/],
      Go: [/\bpackage\s+main\b/, /\bfunc\s+main\b/],
      Rust: [/\bfn\s+main\b/, /\bprintln!\b/],
      Kotlin: [/\bfun\s+main\b/, /\bprintln\b/],
      TypeScript: [/\binterface\b/, /:\s*(string|number|boolean|void)\b/],
    };
    const selectedMatches = (markers[selected] || []).some((rx) => rx.test(text));
    const foreignMatches = Object.entries(other).filter(([lang]) => lang !== selected).some(([, patterns]) => patterns.some((rx) => rx.test(text)));
    return selectedMatches && !foreignMatches;
  };

  const submit = () => {
    if (!problem) return;
    const languageValid = validateLanguage(code, language);
    setResult('running');
    setTimeout(() => {
      if (!languageValid) {
        setResult('fail'); setShowExplanation(true);
        addAssessment({ id: crypto.randomUUID(), type: 'Coding', category: problem.topic, score: 0, date: new Date().toISOString().split('T')[0], details: `${problem.title} · ${language} · Wrong language` });
        return;
      }
      const hasSolution = code.trim().length > 80 && !/Write your solution here|Your code here/i.test(code);
      const passed = hasSolution && code.length > 140;
      setResult(passed ? 'pass' : 'fail'); setShowExplanation(true);
      addAssessment({ id: crypto.randomUUID(), type: 'Coding', category: problem.topic, score: passed ? 90 : 45, date: new Date().toISOString().split('T')[0], details: `${problem.title} · ${language} · ${passed ? 'Passed' : 'Needs improvement'}` });
      if (passed) recordActivity('coding', timeLimits[problem.difficulty]);
    }, 700);
  };

  if (problem) return <div className="mx-auto max-w-7xl space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><button onClick={() => setSelectedProblem(null)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"><ChevronLeft size={16}/> Problem List</button><div className="flex items-center gap-2"><Badge variant="brand">{problem.topic}</Badge><span className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold', difficultyColors[problem.difficulty])}>{problem.difficulty}</span><Badge variant="default"><Timer size={13}/> {minutes} min</Badge></div></div>
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="min-h-[600px]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Problem</p><h2 className="mt-1 text-2xl font-bold text-slate-800">{problem.title}</h2></div><Trophy className="text-slate-300"/></div><p className="mt-5 text-sm leading-6 text-slate-600">{problem.statement}</p><div className="mt-5 space-y-3"><div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-xs font-bold uppercase text-slate-400">Example Input</p><code className="text-sm text-slate-700">{problem.exampleInput}</code></div><div className="rounded-xl bg-slate-50 p-4"><p className="mb-2 text-xs font-bold uppercase text-slate-400">Example Output</p><code className="text-sm text-slate-700">{problem.exampleOutput}</code></div></div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="flex gap-2"><Lightbulb size={18} className="text-blue-600"/><div><p className="text-sm font-semibold text-blue-800">LeetCode-style tip</p><p className="text-xs text-blue-700">Think about time complexity, edge cases and whether a better data structure can reduce the runtime.</p></div></div></div></Card>
      <Card className="flex min-h-[600px] flex-col bg-slate-950 text-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3"><div className="flex items-center gap-2"><Code2 size={18}/><span className="font-semibold">Code Editor</span></div><select value={language} onChange={(e) => changeLanguage(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">{languages.map((l) => <option key={l}>{l}</option>)}</select></div><div className="mt-3 flex items-center justify-between text-xs text-slate-400"><span>{language} · {problem.difficulty} Problem</span><span className="flex items-center gap-1"><Clock size={13}/> {String(Math.floor(elapsed / 60)).padStart(2,'0')}:{String(elapsed % 60).padStart(2,'0')} / {minutes}:00</span></div><textarea value={code} onChange={(e) => { setCode(e.target.value); setElapsed((v) => Math.min(v + 1, minutes * 60)); }} spellCheck={false} className="mt-3 min-h-[420px] flex-1 resize-none rounded-xl border border-slate-800 bg-[#0b1220] p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-brand-500"/><div className="mt-3 flex items-center justify-between"><span className="text-xs text-slate-500">Multi-language editor · Language-aware MVP validation</span><Button onClick={submit} disabled={result === 'running'}><Play size={16}/>{result === 'running' ? 'Running...' : 'Submit'}</Button></div></Card>
    </div>
    {showExplanation && <div className="space-y-4"><Card className={result === 'pass' ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}><div className="flex items-center gap-3">{result === 'pass' ? <CheckCircle2 size={28} className="text-emerald-500"/> : <XCircle size={28} className="text-red-500"/>}<div><h3 className="font-bold text-slate-800">{result === 'pass' ? 'Accepted' : 'Solution needs improvement'}</h3><p className="text-sm text-slate-600">{result === 'pass' ? 'Your solution passed the frontend test.' : 'Your submission was not accepted. Check the selected language, syntax, algorithm and edge cases.'}</p></div></div></Card><LostMarksExplanation scores={[{label:'Algorithm',value:result==='pass'?9:5},{label:'Code Quality',value:result==='pass'?8:5},{label:'Problem Solving',value:result==='pass'?9:4},{label:'Edge Cases',value:result==='pass'?8:3}]} mainIssue={result==='pass' ? 'The solution is accepted. Consider whether the time and space complexity can be improved further.' : (!validateLanguage(code, language) ? `The selected language is ${language}, but the submitted code appears to use another language. Rewrite it in ${language}.` : `The ${problem.title} solution needs more complete logic or edge-case handling.`)} recommendation={result==='pass' ? 'Try the next difficulty level and compare time and space complexity.' : (!validateLanguage(code, language) ? `Use the ${language} starter template and submit again.` : 'Break the problem into smaller steps, test boundary cases, then submit again.')}/></div>}
  </div>;

  return <div className="mx-auto max-w-6xl space-y-6"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Code2 size={24}/></div><div><h2 className="text-2xl font-bold text-slate-800">Coding & DSA</h2><p className="text-sm text-slate-500">Practice like a coding platform with difficulty filters and multiple languages.</p></div></div>
    <Card><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-700">Difficulty</p><div className="mt-2 flex flex-wrap gap-2">{(['All','Easy','Medium','Hard'] as Difficulty[]).map((d) => <button key={d} onClick={() => setDifficulty(d)} className={cn('rounded-lg px-4 py-2 text-sm font-semibold', difficulty===d ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600')}>{d}</button>)}</div></div><Badge variant="info">{filtered.length} problems</Badge></div></Card>
    {!selectedTopic && <div className="flex flex-wrap gap-2">{topics.map((t) => <button key={t} onClick={() => setSelectedTopic(t)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600">{t}</button>)}</div>}
    {selectedTopic && <button onClick={() => setSelectedTopic(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"><ChevronLeft size={15}/> All topics</button>}
    <div className="space-y-3">{filtered.map((p, i) => <Card key={p.id} hover onClick={() => selectProblem(p.id)}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">{i+1}</span><div><h3 className="font-semibold text-slate-800">{p.title}</h3><p className="text-xs text-slate-500">{p.topic}</p></div></div><div className="flex items-center gap-2"><span className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold', difficultyColors[p.difficulty])}>{p.difficulty}</span><Badge variant="default"><Timer size={13}/> {timeLimits[p.difficulty]} min</Badge></div></div></Card>)}{filtered.length===0 && <Card className="py-12 text-center text-slate-400">No problems match this filter.</Card>}</div>
  </div>;
}
