
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import type {
  StudentProfile,
  SkillLevel,
  ScoreBreakdown,
  AssessmentRecord,
  RecoveryDay,
  InterviewSessionRecord,
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
  interviewSessions: InterviewSessionRecord[];
  completeInterviewSession: (session: InterviewSessionRecord) => void;
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

interface SavedStudentData {
  profile: StudentProfile | null;
  scores: ScoreBreakdown;
  assessments: AssessmentRecord[];
  interviewSessions: InterviewSessionRecord[];
  recoveryPlan: RecoveryDay[];
  recoveryPlanGenerated: boolean;
  streak: number;
  practiceMinutes: number;
  problemsSolved: number;
  lastActivity: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function emptyStudentData(): SavedStudentData {
  return {
    profile: null,
    scores: { ...emptyScores },
    assessments: [],
    interviewSessions: [],
    recoveryPlan: defaultRecoveryPlan.map(day => ({
      ...day,
      completed: false,
    })),
    recoveryPlanGenerated: false,
    streak: 0,
    practiceMinutes: 0,
    problemsSolved: 0,
    lastActivity: null,
  };
}

function storageKey(email: string) {
  return `personahire_student_${email.trim().toLowerCase()}`;
}

function loadStudentData(email: string): SavedStudentData {
  const fresh = emptyStudentData();

  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return fresh;

    const saved = JSON.parse(raw);

    return {
      ...fresh,
      ...saved,
      scores: { ...emptyScores, ...(saved.scores ?? {}) },
      assessments: Array.isArray(saved.assessments)
        ? saved.assessments
        : [],
      interviewSessions: Array.isArray(saved.interviewSessions)
        ? saved.interviewSessions
        : [],
      recoveryPlan: Array.isArray(saved.recoveryPlan)
        ? saved.recoveryPlan
        : fresh.recoveryPlan,
      streak: Number(saved.streak) || 0,
      practiceMinutes: Number(saved.practiceMinutes) || 0,
      problemsSolved: Number(saved.problemsSolved) || 0,
    };
  } catch {
    return fresh;
  }
}

export function DataProvider({
  children,
}: {
  children: ReactNode;
}) {
  // AuthContext should provide the current user's email via this key.
  const [email, setEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem('personahire_current_email');
    } catch {
      return null;
    }
  });

  const [studentData, setStudentData] =
    useState<SavedStudentData>(() =>
      email ? loadStudentData(email) : emptyStudentData()
    );

  useEffect(() => {
    const syncUser = () => {
      const nextEmail = localStorage.getItem(
        'personahire_current_email'
      );

      if ((nextEmail || null) !== email) {
        setEmail(nextEmail);
        setStudentData(
          nextEmail ? loadStudentData(nextEmail) : emptyStudentData()
        );
      }
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('personahire-auth-changed', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('personahire-auth-changed', syncUser);
    };
  }, [email]);

  const save = useCallback((next: SavedStudentData) => {
    setStudentData(next);

    if (email) {
      try {
        localStorage.setItem(storageKey(email), JSON.stringify(next));
      } catch (error) {
        console.error('Could not save PersonaHire progress:', error);
      }
    }
  }, [email]);

  const profile = studentData.profile;
  const scores = studentData.scores;
  const assessments = studentData.assessments;
  const interviewSessions = studentData.interviewSessions;
  const recoveryPlan = studentData.recoveryPlan;
  const recoveryPlanGenerated = studentData.recoveryPlanGenerated;
  const streak = studentData.streak;
  const practiceMinutes = studentData.practiceMinutes;
  const problemsSolved = studentData.problemsSolved;

  const setProfile = (p: StudentProfile) => {
    save({ ...studentData, profile: p });
  };

  const updateProfileField: DataContextType['updateProfileField'] = (
    key,
    value
  ) => {
    if (!profile) return;
    save({
      ...studentData,
      profile: { ...profile, [key]: value },
    });
  };

  const setScores = (s: ScoreBreakdown) => {
    save({ ...studentData, scores: s });
  };

  const addAssessment = (assessment: AssessmentRecord) => {
    save({
      ...studentData,
      assessments: [assessment, ...assessments],
    });
  };

  const completeInterviewSession = (session: InterviewSessionRecord) => {
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000)
      .toLocaleDateString('en-CA');
    const nextStreak =
      studentData.lastActivity === today
        ? studentData.streak
        : studentData.lastActivity === yesterday
          ? studentData.streak + 1
          : 1;
    const score = Math.round(session.report.averageScore * 10);

    save({
      ...studentData,
      interviewSessions: [session, ...interviewSessions],
      assessments: [
        {
          id: session.id,
          type: 'AI Interview',
          category: session.category,
          score,
          date: session.date,
          details: `${session.role} · ${session.report.totalQuestionsAttempted} questions`,
        },
        ...assessments,
      ],
      scores: { ...studentData.scores, aiInterview: score },
      streak: nextStreak,
      lastActivity: today,
      practiceMinutes: studentData.practiceMinutes + 20,
    });
  };

  const toggleRecoveryDay = (day: number) => {
    save({
      ...studentData,
      recoveryPlan: recoveryPlan.map(item =>
        item.day === day
          ? { ...item, completed: !item.completed }
          : item
      ),
    });
  };

  const setRecoveryPlanGenerated = (value: boolean) => {
    save({ ...studentData, recoveryPlanGenerated: value });
  };

  const recordActivity = (
    kind: 'practice' | 'coding' = 'practice',
    minutes = 10
  ) => {
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000)
      .toLocaleDateString('en-CA');

    const lastActivity = studentData.lastActivity;
    const safeMinutes = Math.max(0, Number(minutes) || 0);

    const nextStreak =
      lastActivity === today
        ? streak
        : lastActivity === yesterday
          ? streak + 1
          : 1;

    save({
      ...studentData,
      streak: nextStreak,
      lastActivity: today,
      practiceMinutes: practiceMinutes + safeMinutes,
      problemsSolved:
        problemsSolved + (kind === 'coding' ? 1 : 0),
    });
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
        interviewSessions,
        completeInterviewSession,
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
