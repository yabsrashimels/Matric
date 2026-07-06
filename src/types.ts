export interface Question {
  id: number;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  year: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  incorrectExplanations: { [option: string]: string };
  reference: string;
  hint: string;
  time: string; // estimated time to solve
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyXp: number;
  dailyGoal: number; // XP goal
  completedQuestionIds: number[];
  correctAnswersCount: number;
  wrongAnswersCount: number;
  favorites: number[]; // question ids
  subjectProgress: { [subjectName: string]: { answered: number; correct: number } };
  notes: { [questionId: number]: string };
  studyPlanner: StudyPlanTask[];
  unlockedBadges: string[]; // Badge IDs
}

export interface StudyPlanTask {
  id: string;
  day: string; // e.g., "Monday", "Tuesday"
  task: string;
  subject: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  avatar: string;
  isCurrentUser?: boolean;
}
