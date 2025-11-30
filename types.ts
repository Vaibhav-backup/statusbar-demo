
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

export interface UserProfile {
  name: string;
  wakeUpTime: string;
  sleepTime: string;
  productiveHours: string; // e.g. "morning", "night"
  aura: number; // XP System
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
