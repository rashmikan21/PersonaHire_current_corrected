import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import type {
  StudentProfile,
  SkillLevel,
  ScoreBreakdown,
  AssessmentRecord,
  RecoveryDay,
} from '@/types';

import { defaultRecoveryPlan } from '@/data/mockData';

interface DataContextType {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
  updateProfileField: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K]
  ) => void;
  scores: ScoreBreakdown;
  setScores: (s: ScoreBreakdown) => void;
  initialScores: ScoreBreakdown;
  assessments: AssessmentRecord[];
  addAssessment: (a: AssessmentRecord) => void;
  recoveryPlan: RecoveryDay[];
  toggleRecoveryDay: (day: number) => void;
  recoveryPlanGenerated: boolean;
  setRecoveryPlanGenerated: (v: boolean) => void;
  streak: number;
  practiceMinutes: number;
  problemsSolved: number;
  recordActivity: (kind?: 'practice' | 'coding', minutes?: number) => void;
}

const emptyScores: ScoreBreakdown = {
  coding: 0,
  aptitude: 0,
  coreCS: 0,
  technical: 0,
  professional: 0,
  aiInterview: 0,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

function readStoredNumber(key: string): number {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return 0;

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);

  const [scores, setScores] = useState<ScoreBreakdown>({
    ...emptyScores,
  });

  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryDay[]>(
    () => defaultRecoveryPlan.map((day) => ({ ...day, completed: false }))
  );

  const [recoveryPlanGenerated, setRecoveryPlanGenerated] = useState(false);

  const [streak, setStreak] = useState(() =>
    readStoredNumber('personahire_v2_streak')
  );

  const [practiceMinutes, setPracticeMinutes] = useState(() =>
    readStoredNumber('personahire_v2_practice_minutes')
  );

  const [problemsSolved, setProblemsSolved] = useState(() =>
    readStoredNumber('personahire_v2_problems_solved')
  );

  const recordActivity = (
    kind: 'practice' | 'coding' = 'practice',
    minutes = 10
  ) => {
    const safeMinutes = Number.isFinite(minutes)
      ? Math.max(0, minutes)
      : 0;

    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000)
      .toLocaleDateString('en-CA');

    let nextStreak = streak;

    try {
      const lastActivity = localStorage.getItem(
        'personahire_v2_last_activity'
      );

      if (lastActivity !== today) {
        nextStreak =
          lastActivity === yesterday ? streak + 1 : 1;

        setStreak(nextStreak);
        localStorage.setItem(
          'personahire_v2_streak',
          String(nextStreak)
        );

        localStorage.setItem(
          'personahire_v2_last_activity',
          today
        );
      }

      const nextMinutes = practiceMinutes + safeMinutes;

      setPracticeMinutes(nextMinutes);
      localStorage.setItem(
        'personahire_v2_practice_minutes',
        String(nextMinutes)
      );

      if (kind === 'coding') {
        const nextProblems = problemsSolved + 1;

        setProblemsSolved(nextProblems);
        localStorage.setItem(
          'personahire_v2_problems_solved',
          String(nextProblems)
        );
      }
    } catch (error) {
      console.error('Could not save activity:', error);
    }
  };

  const setProfile = (p: StudentProfile) => {
    setProfileState(p);
  };

  const updateProfileField: DataContextType['updateProfileField'] = (
    key,
    value
  ) => {
    setProfileState((previous) =>
      previous ? { ...previous, [key]: value } : previous
    );
  };

  const addAssessment = (assessment: AssessmentRecord) => {
    setAssessments((previous) => [assessment, ...previous]);
  };

  const toggleRecoveryDay = (day: number) => {
    setRecoveryPlan((previous) =>
      previous.map((item) =>
        item.day === day
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        setProfile,
        updateProfileField,
        scores,
        setScores,
        initialScores: { ...emptyScores },
        assessments,
        addAssessment,
        recoveryPlan,
        toggleRecoveryDay,
        recoveryPlanGenerated,
        setRecoveryPlanGenerated,
        streak,
        practiceMinutes,
        problemsSolved,
        recordActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }

  return context;
}

export type { SkillLevel };