
import { useMemo, useState } from 'react';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Trophy,
  Timer,
  Lightbulb,
  LoaderCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, Button } from '@/components/ui/Badge';
import { codingProblems } from '@/data/mockData';
import { useData } from '@/context/DataContext';
import { cn } from '@/utils/cn';

type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

type JudgeResult = {
  status: string;
  message: string;
  passed: number;
  total: number;
  compileOutput?: string;
  failedTest?: string;
};

const difficultyColors: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  Hard: 'text-red-600 bg-red-50',
};

const languages = [
  'C++',
  'Java',
  'Python',
  'JavaScript',
  'C',
  'C#',
  'Go',
  'Rust',
  'Kotlin',
  'TypeScript',
];

const timeLimits: Record<string, number> = {
  Easy: 30,
  Medium: 45,
  Hard: 60,
};

function starterFor(
  language: string,
  title: string,
  original: string,
) {
  const templates: Record<string, string> = {
    'C++': `#include <bits/stdc++.h>
using namespace std;

// ${title}
class Solution {
public:
    // Write your solution here
};`,

    Java: `import java.util.*;

// ${title}
class Solution {
    // Write your solution here
}`,

    Python: `# ${title}
class Solution:
    def solve(self):
        # Write your solution here
        pass`,

    JavaScript: original,

    C: `#include <stdio.h>

// ${title}
int main() {
    // Write your solution here
    return 0;
}`,

    'C#': `using System;

// ${title}
public class Solution {
    // Write your solution here
}`,

    Go: `package main

import "fmt"

// ${title}
func main() {
    // Write your solution here
    fmt.Println("")
}`,

    Rust: `// ${title}
fn main() {
    // Write your solution here
}`,

    Kotlin: `// ${title}
fun main() {
    // Write your solution here
}`,

    TypeScript: original,
  };

  return templates[language] ?? original;
}

function validateLanguage(code: string, language: string) {
  const checks: Record<string, RegExp[]> = {
    Java: [
      /\bpublic\s+class\b|\bclass\s+Solution\b/,
      /\bSystem\.out\b|\breturn\b/,
    ],
    'C++': [
      /#include\b/,
      /\busing\s+namespace\s+std\b|\bstd::/,
    ],
    Python: [
      /\bdef\b|\bclass\b|\bprint\s*\(/,
    ],
    JavaScript: [
      /\bfunction\b|\bconst\b|\blet\b|\bconsole\.log\b|\breturn\b/,
    ],
    C: [
      /#include\s*<stdio\.h>/,
      /\bint\s+main\s*\(/,
    ],
    'C#': [
      /\busing\s+System\b/,
      /\bclass\b|\bConsole\./,
    ],
    Go: [
      /\bpackage\s+main\b/,
      /\bfunc\s+main\s*\(/,
    ],
    Rust: [
      /\bfn\s+main\s*\(/,
    ],
    Kotlin: [
      /\bfun\s+main\s*\(/,
    ],
    TypeScript: [
      /\b(const|let|function|interface|type)\b/,
    ],
  };

  const otherLanguagePatterns: Record<string, RegExp> = {
    Java: /\bSystem\.out\.println\b|\bpublic\s+static\s+void\s+main\b/,
    'C++': /#include\s*<iostream>|#include\s*<bits\/stdc\+\+\.h>/,
    Python: /^\s*def\s+\w+\s*\(|^\s*print\s*\(/m,
    JavaScript: /\bconsole\.log\s*\(|\bfunction\s+\w+\s*\(/,
    C: /#include\s*<stdio\.h>/,
    'C#': /\bConsole\.WriteLine\b/,
    Go: /\bpackage\s+main\b/,
    Rust: /\bfn\s+main\s*\(/,
    Kotlin: /\bfun\s+main\s*\(/,
    TypeScript: /\binterface\s+\w+|\btype\s+\w+\s*=/,
  };

  const selectedChecks = checks[language] ?? [];

  const hasExpectedSyntax =
    selectedChecks.length === 0 ||
    selectedChecks.some((pattern) => pattern.test(code));

  if (!hasExpectedSyntax) return false;

  for (const [otherLanguage, pattern] of Object.entries(
    otherLanguagePatterns,
  )) {
    if (otherLanguage !== language && pattern.test(code)) {
      return false;
    }
  }

  return true;
}

export function CodingPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>('All');

  const [selectedTopic, setSelectedTopic] =
    useState<string | null>(null);

  const [selectedProblem, setSelectedProblem] =
    useState<string | null>(null);

  const [language, setLanguage] = useState('C++');
  const [code, setCode] = useState('');

  const [result, setResult] = useState<
    'idle' | 'running' | 'pass' | 'fail'
  >('idle');

  const [showResult, setShowResult] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [feedback, setFeedback] = useState<JudgeResult>({
    status: '',
    message: '',
    passed: 0,
    total: 0,
  });

  const { addAssessment, recordActivity } = useData();

  const topics = [
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stack',
    'Queue',
    'HashMap',
    'Trees',
    'Searching',
    'Sorting',
    'Recursion',
    'Dynamic Programming',
    'Problem Solving',
  ];

  const filtered = useMemo(
    () =>
      codingProblems.filter(
        (problem) =>
          (difficulty === 'All' ||
            problem.difficulty === difficulty) &&
          (!selectedTopic ||
            problem.topic === selectedTopic),
      ),
    [difficulty, selectedTopic],
  );

  const problem = codingProblems.find(
    (item) => item.id === selectedProblem,
  );

  const minutes = problem
    ? timeLimits[problem.difficulty]
    : 30;

  const resetResult = () => {
    setResult('idle');
    setShowResult(false);
    setFeedback({
      status: '',
      message: '',
      passed: 0,
      total: 0,
    });
  };

  const selectProblem = (id: string) => {
    const selected = codingProblems.find(
      (item) => item.id === id,
    );

    if (!selected) return;

    setSelectedProblem(id);
    setLanguage('C++');
    setCode(
      starterFor(
        'C++',
        selected.title,
        selected.starterCode,
      ),
    );

    setElapsed(0);
    resetResult();
  };

  const changeLanguage = (nextLanguage: string) => {
    setLanguage(nextLanguage);

    if (problem) {
      setCode(
        starterFor(
          nextLanguage,
          problem.title,
          problem.starterCode,
        ),
      );
    }

    resetResult();
  };

  // SIMULATED SUBMISSION: does not execute code or check test cases.
  const submit = () => {
    if (!problem || result === 'running') return;

    if (!code.trim()) {
      setResult('fail');
      setFeedback({
        status: 'Empty Submission',
        message: 'Write your solution before submitting.',
        passed: 0,
        total: 0,
      });
      setShowResult(true);
      return;
    }

    setResult('running');
    setShowResult(false);

    window.setTimeout(() => {
      const languageValid = validateLanguage(code, language);

      if (!languageValid) {
        setResult('fail');

        setFeedback({
          status: 'Wrong Language or Syntax',
          message:
            'The code does not appear to match the selected language. Check the language selector and your syntax.',
          passed: 0,
          total: 0,
        });

        setShowResult(true);

        addAssessment({
          id: crypto.randomUUID(),
          type: 'Coding',
          category: problem.topic,
          score: 0,
          date: new Date().toISOString().slice(0, 10),
          details:
            `${problem.title} · ${language} · Wrong language`,
        });

        return;
      }

      const hasSolution =
        code.trim().length > 80 &&
        !/Write your solution here|Your code here/i.test(code);

      const passed =
        hasSolution && code.length > 140;

      const score = passed ? 90 : 45;

      setResult(passed ? 'pass' : 'fail');

      setFeedback({
        status: passed ? 'Accepted' : 'Wrong Answer',
        message: passed
          ? 'Your submission passed the simulated frontend check.'
          : 'Your solution needs improvement. Add your implementation and try again.',
        passed: passed ? 1 : 0,
        total: 1,
      });

      setShowResult(true);

      addAssessment({
        id: crypto.randomUUID(),
        type: 'Coding',
        category: problem.topic,
        score,
        date: new Date().toISOString().slice(0, 10),
        details:
          `${problem.title} · ${language} · ${
            passed ? 'Passed' : 'Needs improvement'
          }`,
      });

      if (passed) {
        recordActivity(
          'coding',
          timeLimits[problem.difficulty],
        );
      }
    }, 700);
  };

  if (problem) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              setSelectedProblem(null);
              resetResult();
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
          >
            <ChevronLeft size={16} />
            Problem List
          </button>

          <div className="flex items-center gap-2">
            <Badge variant="brand">{problem.topic}</Badge>

            <span
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold',
                difficultyColors[problem.difficulty],
              )}
            >
              {problem.difficulty}
            </span>

            <Badge variant="default">
              <Timer size={13} />
              {minutes} min
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="min-h-[600px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Problem
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-800">
                  {problem.title}
                </h2>
              </div>

              <Trophy className="text-slate-300" />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {problem.statement}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                  Example Input
                </p>
                <code className="text-sm text-slate-700">
                  {problem.exampleInput}
                </code>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                  Example Output
                </p>
                <code className="text-sm text-slate-700">
                  {problem.exampleOutput}
                </code>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex gap-2">
                <Lightbulb
                  size={18}
                  className="shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    LeetCode-style tip
                  </p>

                  <p className="text-xs text-blue-700">
                    Think about time complexity, edge cases,
                    and whether a better data structure can
                    reduce runtime.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex min-h-[600px] flex-col bg-slate-950 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={18} />
                <span className="font-semibold">
                  Code Editor
                </span>
              </div>

              <select
                value={language}
                onChange={(event) =>
                  changeLanguage(event.target.value)
                }
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                {language} · {problem.difficulty} Problem
              </span>

              <span className="flex items-center gap-1">
                <Clock size={13} />
                {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
                {String(elapsed % 60).padStart(2, '0')} / {minutes}:00
              </span>
            </div>

            <textarea
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                resetResult();
              }}
              spellCheck={false}
              aria-label="Code editor"
              className="mt-3 min-h-[420px] flex-1 resize-y rounded-xl border border-slate-800 bg-[#0b1220] p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-brand-500"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Simulated frontend submission — code is not executed.
              </span>

              <Button
                onClick={submit}
                disabled={result === 'running'}
              >
                {result === 'running' ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Play size={16} />
                )}

                {result === 'running'
                  ? 'Checking...'
                  : 'Submit'}
              </Button>
            </div>
          </Card>
        </div>

        {showResult && (
          <Card
            className={
              result === 'pass'
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-red-200 bg-red-50/50'
            }
          >
            <div className="flex items-start gap-3">
              {result === 'pass' ? (
                <CheckCircle2
                  size={28}
                  className="shrink-0 text-emerald-600"
                />
              ) : (
                <XCircle
                  size={28}
                  className="shrink-0 text-red-600"
                />
              )}

              <div className="min-w-0">
                <h3 className="font-bold text-slate-800">
                  {feedback.status}
                </h3>

                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {feedback.message}
                </p>

                {feedback.total > 0 && (
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Simulated checks passed: {feedback.passed}/
                    {feedback.total}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          <Code2 size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Coding &amp; DSA
          </h2>

          <p className="text-sm text-slate-500">
            Practice coding problems with difficulty filters
            and language selection.
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Difficulty
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setDifficulty(item)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm font-semibold',
                      difficulty === item
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>

          <Badge variant="info">
            {filtered.length} problems
          </Badge>
        </div>
      </Card>

      {!selectedTopic && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600"
            >
              {topic}
            </button>
          ))}
        </div>
      )}

      {selectedTopic && (
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
        >
          <ChevronLeft size={15} />
          All topics
        </button>
      )}

      <div className="space-y-3">
        {filtered.map((item, index) => (
          <Card
            key={item.id}
            hover
            onClick={() => selectProblem(item.id)}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
                  {index + 1}
                </span>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {item.topic}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold',
                    difficultyColors[item.difficulty],
                  )}
                >
                  {item.difficulty}
                </span>

                <Badge variant="default">
                  <Timer size={13} />
                  {timeLimits[item.difficulty]} min
                </Badge>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="py-12 text-center text-slate-400">
            No problems match this filter.
          </Card>
        )}
      </div>
    </div>
  );
}

export default CodingPage;
