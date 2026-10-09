export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface SkillEntry {
  name: string;
  level: SkillLevel;
}

export interface StudentProfile {
  name: string;
  email: string;
  college: string;
  degree: string;
  graduationYear: string;
  preferredRole: string;
  targetCompany: string;
  experienceLevel: string;
  programmingSkills: SkillEntry[];
  technicalSkills: SkillEntry[];
  coreCSEntry: SkillEntry[];
  otherSkills: SkillEntry[];
}

export interface ScoreBreakdown {
  coding: number;
  aptitude: number;
  coreCS: number;
  technical: number;
  professional: number;
  aiInterview: number;
}

export interface CategoryScores {
  aptitude: number;
  coding: number;
  coreCS: number;
  technical: number;
  professional: number;
  aiInterview: number;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  statement: string;
  exampleInput: string;
  exampleOutput: string;
  starterCode: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'Technical' | 'HR' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  idealAnswer: string;
}

export interface AnswerAnalysis {
  technicalAccuracy: number;
  answerQuality: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  relevance: number;
  whatWentWell: string;
  whatNeedsImprovement: string;
  recommendation: string;
}

export interface RecoveryDay {
  day: number;
  topic: string;
  tasks: string[];
  completed: boolean;
}

export interface AssessmentRecord {
  id: string;
  type: string;
  category: string;
  score: number;
  date: string;
  details?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
