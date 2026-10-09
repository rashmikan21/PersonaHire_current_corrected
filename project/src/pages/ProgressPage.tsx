import React from "react";

const skills = [
  { name: "Aptitude", score: 68 },
  { name: "Coding & DSA", score: 72 },
  { name: "Core CS", score: 76 },
  { name: "Technical Skills", score: 71 },
  { name: "Professional Skills", score: 78 },
  { name: "AI Interview", score: 80 },
];

const milestones = [
  { label: "Initial Assessment", score: 52 },
  { label: "After Practice", score: 61 },
  { label: "After Recovery Plan", score: 68 },
  { label: "Re-Assessment", score: 74 },
];

const recentActivity = [
  { title: "Aptitude Assessment", detail: "Scored 68% • 2 days ago" },
  { title: "Solved Two Sum", detail: "Easy • Yesterday" },
  { title: "AI Interview", detail: "Scored 80% • 3 days ago" },
];

export function ProgressPage() {
  const overall = 74;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Progress
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Track your placement progress.
          </h1>

          <p className="mt-2 text-slate-500">
            See how your skills and placement readiness improve over time.
          </p>
        </div>

        {/* Overall Readiness */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall Placement Readiness
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold text-slate-900">
                  {overall}%
                </span>

                <span className="mb-2 text-sm font-medium text-green-600">
                  Good progress
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Keep practicing your weaker areas to improve your readiness.
              </p>
            </div>

            <div className="h-32 w-32 rounded-full border-[14px] border-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">
                {overall}%
              </span>
            </div>

          </div>
        </section>

        {/* Skill Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Skill Progress
            </h2>

            <p className="text-sm text-slate-500">
              Your current performance across placement preparation areas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex justify-between">
                  <span className="font-medium text-slate-700">
                    {skill.name}
                  </span>

                  <span className="font-semibold text-slate-900">
                    {skill.score}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Improvement Journey */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Improvement Journey
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your readiness from the initial assessment to the latest
            re-assessment.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {milestones.map((item, index) => (
              <div key={item.label} className="relative">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    {item.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {item.score}%
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                {index < milestones.length - 1 && (
                  <div className="hidden md:block absolute right-[-16px] top-1/2 h-px w-8 bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">🔥 Current Streak</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">7 days</p>
            <p className="mt-1 text-sm text-slate-500">
              Keep practicing every day.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">💻 Problems Solved</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">27</p>
            <p className="mt-1 text-sm text-slate-500">
              12 completed this month.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">⏱ Practice Time</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">42h</p>
            <p className="mt-1 text-sm text-slate-500">
              Across 68 practice sessions.
            </p>
          </div>

        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest placement preparation activities.
              </p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <div
                key={activity.title}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {activity.detail}
                  </p>
                </div>

                <span className="text-sm font-medium text-indigo-600">
                  View
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ProgressPage;