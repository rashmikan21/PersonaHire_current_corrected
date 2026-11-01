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

export type InterviewCategory =
  | 'Technical'
  | 'HR'
  | 'Behavioral'
  | 'Programming Concepts';

export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewEvaluation {
  overallScore: number;
  relevanceScore: number;
  technicalAccuracyScore: number;
  completenessScore: number;
  communicationScore: number;
  strengths: string[];
  missingConcepts: string[];
  mistakes: string[];
  improvementSuggestions: string[];
  sampleImprovedAnswer: string;
}

export interface InterviewTurnRecord {
  questionId: string;
  question: string;
  answer: string;
  difficulty: InterviewDifficulty;
  evaluation: InterviewEvaluation;
}

export interface InterviewReport {
  totalQuestionsAttempted: number;
  averageScore: number;
  technicalKnowledgePerformance: number;
  communicationPerformance: number;
  strongAreas: string[];
  weakAreas: string[];
  frequentlyMissingConcepts: string[];
  personalizedRecommendations: string[];
  readinessAssessment: string;
}

export interface InterviewSessionRecord {
  id: string;
  role: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  date: string;
  turns: InterviewTurnRecord[];
  report: InterviewReport;
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
