
import { useData } from '@/context/DataContext';

type SkillAssessment = {
  name: string;
  score: number;
  assessed: boolean;
  matches: string[];
};

export function ProgressPage() {
  const {
    scores,
    assessments,
    streak,
    problemsSolved,
  } = useData();

  const hasMatchingAssessment = (matches: string[]) =>
    assessments.some((assessment) => {
      const type = String(assessment.type ?? '').toLowerCase();
      return matches.some((match) => type.includes(match));
    });

  const skills: SkillAssessment[] = [
    {
      name: 'Aptitude',
      score: scores.aptitude,
      assessed: hasMatchingAssessment(['aptitude']),
      matches: ['aptitude'],
    },
    {
      name: 'Coding & DSA',
      score: scores.coding,
      assessed: hasMatchingAssessment(['coding', 'dsa']),
      matches: ['coding', 'dsa'],
    },
    {
      name: 'Technical Skills',
      score: scores.technical,
      assessed: hasMatchingAssessment(['technical']),
      matches: ['technical'],
    },
    {
      name: 'AI Interview',
      score: scores.aiInterview,
      assessed: hasMatchingAssessment(['ai interview', 'interview']),
      matches: ['ai interview', 'interview'],
    },
  ];

  const completed = skills.filter((skill) => skill.assessed);

  const readiness =
    completed.length > 0
      ? Math.round(
          completed.reduce((total, skill) => total + skill.score, 0) /
            completed.length
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            PERSONAHIRE
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Your Placement Progress
          </h1>
          <p className="mt-2 text-slate-600">
            Track your skills using your completed assessments.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Overall Placement Readiness
          </p>

          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="text-5xl font-bold text-slate-900">
              {readiness === null ? '—' : `${readiness}%`}
            </span>
            <span className="mb-2 text-sm text-slate-500">
              {completed.length} of {skills.length} assessments completed
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${readiness ?? 0}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-600">
            {readiness === null
              ? 'Complete your first assessment to start tracking your progress.'
              : 'Keep practicing to improve your placement readiness.'}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Skill Progress
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Scores appear when matching assessment records exist.
          </p>

          <div className="mt-6 space-y-5">
            {skills.map((skill) => {
              const score = skill.assessed
                ? Math.min(100, Math.max(0, skill.score))
                : null;

              return (
                <div key={skill.name}>
                  <div className="mb-2 flex justify-between gap-3">
                    <span className="font-medium text-slate-700">
                      {skill.name}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {score === null ? 'Not assessed' : `${score}%`}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Current Streak</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {streak} {streak === 1 ? 'day' : 'days'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Practice regularly to build your streak.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Problems Solved</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {problemsSolved}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Problems recorded as solved in PersonaHire.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {readiness === null
              ? 'Your journey starts here'
              : 'Keep improving'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {readiness === null
              ? 'Start an assessment or solve a coding problem to begin.'
              : 'Review your results and practice your weaker areas.'}
          </p>
        </section>
      </div>
    </main>
  );
}

export default ProgressPage;
