
// Core Data Models

export enum DayOfWeek {
  Monday = 'Segunda-feira',
  Tuesday = 'Terça-feira',
  Wednesday = 'Quarta-feira',
  Thursday = 'Quinta-feira',
  Friday = 'Sexta-feira',
  Saturday = 'Sábado',
  Sunday = 'Domingo'
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string; // Tailwind color class suffix, e.g., 'blue-500'
  teacherName?: string;
  teacherContact?: string;
  goals?: string;
  isPriority?: boolean; // New: High priority for exams
}

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  subjectId: string | 'FREE' | 'BREAK';
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  dueDate: string; // ISO Date string
  isCompleted: boolean;
  type: 'HOMEWORK' | 'EXAM' | 'PROJECT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Note {
  id: string;
  subjectId: string;
  content: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  name: string; // e.g. "Teste 1"
  value: number; // 0-20
  createdAt: string;
}

export interface AttendanceRecord {
  subjectId: string;
  present: number;
  absent: number;
  maxAbsences: number; // Configurable limit
}

// New: Temporary Schedule Override
export interface ScheduleOverride {
  date: string; // ISO Date YYYY-MM-DD
  slotId: string; // The ID of the slot being overridden
  newSubjectId: string;
}

// New: Custom Reminder Configuration
export interface Reminder {
  slotId: string; // Corresponds to TimeSlot.id
  minutesBefore: number; // e.g., 5, 10, 15
  active: boolean;
}

// App State Interface for LocalStorage
export interface AppData {
  tasks: Task[];
  notes: Note[];
  grades: Grade[]; // New: Grades list
  attendance: Record<string, AttendanceRecord>; // Keyed by SubjectID
  customSubjectDetails: Record<string, Partial<Subject>>; // User edits to subjects
  scheduleOverrides: ScheduleOverride[]; // New: List of temporary changes
  studyActivityDates: string[]; // New: List of ISO dates where user was active
  reminders: Reminder[]; // New: User configured reminders
  selectedClassId: string; // New: Selected class schedule ID
}
