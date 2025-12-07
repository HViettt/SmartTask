// Enum definitions mirroring the ERD
export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum TaskComplexity {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum TaskStatus {
  TODO = 'Todo',
  DOING = 'Doing',
  DONE = 'Done'
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

// User interface mirroring the users table
export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  avatar: string;
  preferences: UserPreferences;
  createdAt: string; // ISO Date string
  updatedAt: string;
}

// Task interface mirroring the tasks table
export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  deadline: string; // ISO Date string YYYY-MM-DD
  priority: TaskPriority;
  complexity: TaskComplexity;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Frontend specific: AI reasoning if available
  aiReasoning?: string;
}

export interface AISuggestionResponse {
  taskId: string;
  suggestedOrder: number;
  reasoning: string;
}

export type TaskFilter = 'all' | TaskStatus;