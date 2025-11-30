
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum EnergyLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum TaskCategory {
  Work = 'Work',
  Study = 'Study',
  Health = 'Health',
  Personal = 'Personal',
  Break = 'Break'
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  priority: Priority;
  category: TaskCategory;
  energyRequired: EnergyLevel;
  deadline?: string;
  completed: boolean;
  completedAt?: string; // ISO Date string
  timeSpent?: number; // Minutes spent on task
}

export interface ScheduleItem {
  id: string;
  timeSlot: string; // e.g., "09:00 - 10:00"
  taskId: string;
  title: string;
  category: TaskCategory;
  description: string; // AI generated reasoning or tip
  isBreak: boolean;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export type Theme = 'cyber' | 'y2k' | 'brat' | 'cozy' | 'drift' | 'vapor' | 'acid' | 'goth' | 'cloud' | 'retro' | 'glitch' | 'luxe' | 'void' | 'sunset' | 'mint';

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  productiveHours: string; // e.g. "morning", "night"
  aura: number; // XP System
  pomodoroSettings?: PomodoroSettings;
  theme: Theme;
  streak: number;
  lastLoginDate: string; // YYYY-MM-DD
}

export interface AnalysisData {
  name: string;
  value: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onUndo?: () => void;
}

export type WidgetType = 'dailyVibe' | 'moodTracker' | 'taskForm' | 'brainDump' | 'questLog' | 'timeline' | 'aura' | 'focusTimer';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
}

export interface DashboardLayout {
  leftCol: DashboardWidget[];
  rightCol: DashboardWidget[];
}