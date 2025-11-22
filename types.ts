
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

// New: Digital Library Resource
export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  type: 'LINK' | 'PDF' | 'VIDEO';
  createdAt: string;
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

// --- NEW TOOLS INTERFACES ---

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    subjectId: string; // Optional, can be general
}

export interface SchoolEvent {
    id: string;
    title: string;
    date: string;
    type: 'HOLIDAY' | 'EXAM' | 'OTHER';
}

export interface Question {
    id: string;
    subjectId: string;
    text: string;
    isAnswered: boolean;
}

export interface Contact {
    id: string;
    name: string;
    role: string; // e.g. "Delegado", "Explicações"
    phone: string;
}

// App State Interface for LocalStorage
export interface AppData {
  userName?: string; // New: User profile name
  tasks: Task[];
  notes: Note[];
  grades: Grade[]; 
  resources: Resource[]; // New: List of resources
  attendance: Record<string, AttendanceRecord>; // Keyed by SubjectID
  customSubjectDetails: Record<string, Partial<Subject>>; // User edits to subjects
  scheduleOverrides: ScheduleOverride[]; 
  studyActivityDates: string[]; 
  reminders: Reminder[]; 
  selectedClassId: string;
  
  // New Tool Data
  flashcards: Flashcard[];
  schoolEvents: SchoolEvent[];
  questions: Question[];
  contacts: Contact[];
  // Canvas drawings could be huge, maybe store just one base64 string for the scratchpad
  scratchpadData?: string; 
}
