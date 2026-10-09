import { createContext, useContext, useState, type ReactNode } from 'react';
import type { StudentProfile, SkillLevel, ScoreBreakdown, AssessmentRecord, RecoveryDay } from '@/types';
import { defaultRecoveryPlan, mockAssessmentHistory } from '@/data/mockData';

interface DataContextType {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
  updateProfileField: <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => void;
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

const defaultScores: ScoreBreakdown = {
  coding: 58,
  aptitude: 72,
  coreCS: 78,
  technical: 65,
  professional: 74,
  aiInterview: 68,
};

const initialScoresValue: ScoreBreakdown = {
  coding: 41,
  aptitude: 52,
  coreCS: 60,
  technical: 48,
  professional: 58,
  aiInterview: 55,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<StudentProfile | null>(null);
  const [scores, setScores] = useState<ScoreBreakdown>(defaultScores);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(mockAssessmentHistory);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryDay[]>(defaultRecoveryPlan);
  const [recoveryPlanGenerated, setRecoveryPlanGenerated] = useState(false);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem('personahire_streak') || 7));
  const [practiceMinutes, setPracticeMinutes] = useState(() => Number(localStorage.getItem('personahire_practice_minutes') || 42));
  const [problemsSolved, setProblemsSolved] = useState(() => Number(localStorage.getItem('personahire_problems_solved') || 27));

  const recordActivity = (kind: 'practice' | 'coding' = 'practice', minutes = 10) => {
    const today = new Date().toISOString().slice(0, 10);
    const last = localStorage.getItem('personahire_last_activity');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (last !== today) {
      const nextStreak = last === yesterday ? streak + 1 : 1;
      setStreak(nextStreak);
      localStorage.setItem('personahire_streak', String(nextStreak));
      localStorage.setItem('personahire_last_activity', today);
    }
    const nextMinutes = practiceMinutes + minutes;
    setPracticeMinutes(nextMinutes);
    localStorage.setItem('personahire_practice_minutes', String(nextMinutes));
    if (kind === 'coding') {
      const nextProblems = problemsSolved + 1;
      setProblemsSolved(nextProblems);
      localStorage.setItem('personahire_problems_solved', String(nextProblems));
    }
  };

  const setProfile = (p: StudentProfile) => setProfileState(p);

  const updateProfileField: <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => void = (key, value) => {
    setProfileState((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const addAssessment = (a: AssessmentRecord) => {
    setAssessments((prev) => [a, ...prev]);
  };

  const toggleRecoveryDay = (day: number) => {
    setRecoveryPlan((prev) =>
      prev.map((d) => (d.day === day ? { ...d, completed: !d.completed } : d))
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
        initialScores: initialScoresValue,
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
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export type { SkillLevel };
