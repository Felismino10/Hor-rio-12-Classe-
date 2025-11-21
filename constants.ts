
import { DayOfWeek, Subject, TimeSlot } from './types';

// School Year Config
export const SCHOOL_START_DATE = new Date('2025-09-02');
export const SCHOOL_END_DATE = new Date('2026-06-15');

// Subject Definitions
export const SUBJECTS: Record<string, Subject> = {
  'LIT': { id: 'LIT', name: 'Literatura', shortName: 'Lit', color: 'amber-500' },
  'ING': { id: 'ING', name: 'Língua Inglesa', shortName: 'Inglês', color: 'blue-500' },
  'GEO': { id: 'GEO', name: 'Geografia', shortName: 'Geo', color: 'emerald-500' },
  'EFI': { id: 'EFI', name: 'Educação Física', shortName: 'Ed. Física', color: 'lime-500' },
  'FRA': { id: 'FRA', name: 'Língua Francesa', shortName: 'Francês', color: 'indigo-500' },
  'POR': { id: 'POR', name: 'Língua Portuguesa', shortName: 'Português', color: 'rose-500' },
  'PSA': { id: 'PSA', name: 'Psicologia/Sociologia/Antropologia', shortName: 'Psi/Soc', color: 'purple-500' },
  'EMP': { id: 'EMP', name: 'Empreendedorismo', shortName: 'Empreend.', color: 'cyan-500' },
  'HIS': { id: 'HIS', name: 'História', shortName: 'Hist', color: 'orange-500' },
  'FIL': { id: 'FIL', name: 'Filosofia', shortName: 'Filo', color: 'teal-500' },
  'MAT': { id: 'MAT', name: 'Matemática', shortName: 'Mat', color: 'indigo-600' }, // Extra for 11th grade example
  'FREE': { id: 'FREE', name: 'Vago / Estudo Livre', shortName: 'Livre', color: 'slate-400' },
};

// Generate IDs for slots
const createSlot = (day: DayOfWeek, start: string, end: string, subjId: string): TimeSlot => ({
  id: `${day}-${start}`,
  day,
  startTime: start,
  endTime: end,
  subjectId: subjId,
});

// 12th Grade Human Sciences Schedule
const SCHEDULE_12_CH: TimeSlot[] = [
  // Segunda-feira
  createSlot(DayOfWeek.Monday, '07:00', '07:45', 'EFI'),
  createSlot(DayOfWeek.Monday, '18:10', '18:50', 'LIT'),
  createSlot(DayOfWeek.Monday, '19:00', '19:45', 'LIT'),
  createSlot(DayOfWeek.Monday, '19:50', '20:35', 'ING'),
  createSlot(DayOfWeek.Monday, '20:40', '21:25', 'ING'),
  createSlot(DayOfWeek.Monday, '21:30', '22:15', 'GEO'),
  createSlot(DayOfWeek.Monday, '22:20', '23:05', 'FREE'),

  // Terça-feira
  createSlot(DayOfWeek.Tuesday, '18:10', '18:50', 'FREE'),
  createSlot(DayOfWeek.Tuesday, '19:00', '19:45', 'FRA'),
  createSlot(DayOfWeek.Tuesday, '19:50', '20:35', 'POR'),
  createSlot(DayOfWeek.Tuesday, '20:40', '21:25', 'POR'),
  createSlot(DayOfWeek.Tuesday, '21:30', '22:15', 'PSA'),
  createSlot(DayOfWeek.Tuesday, '22:20', '23:05', 'PSA'),

  // Quarta-feira
  createSlot(DayOfWeek.Wednesday, '18:10', '18:50', 'ING'),
  createSlot(DayOfWeek.Wednesday, '19:00', '19:45', 'ING'),
  createSlot(DayOfWeek.Wednesday, '19:50', '20:35', 'GEO'),
  createSlot(DayOfWeek.Wednesday, '20:40', '21:25', 'GEO'),
  createSlot(DayOfWeek.Wednesday, '21:30', '22:15', 'EMP'),
  createSlot(DayOfWeek.Wednesday, '22:20', '23:05', 'EMP'),

  // Quinta-feira
  createSlot(DayOfWeek.Thursday, '18:10', '18:50', 'HIS'),
  createSlot(DayOfWeek.Thursday, '19:00', '19:45', 'HIS'),
  createSlot(DayOfWeek.Thursday, '19:50', '20:35', 'FIL'),
  createSlot(DayOfWeek.Thursday, '20:40', '21:25', 'FIL'),
  createSlot(DayOfWeek.Thursday, '21:30', '22:15', 'FREE'),
  createSlot(DayOfWeek.Thursday, '22:20', '23:05', 'FREE'),

  // Sexta-feira
  createSlot(DayOfWeek.Friday, '07:50', '08:35', 'EFI'),
  createSlot(DayOfWeek.Friday, '18:10', '18:50', 'POR'),
  createSlot(DayOfWeek.Friday, '19:00', '19:45', 'POR'),
  createSlot(DayOfWeek.Friday, '19:50', '20:35', 'FRA'),
  createSlot(DayOfWeek.Friday, '20:40', '21:25', 'FRA'),
  createSlot(DayOfWeek.Friday, '21:30', '22:15', 'HIS'),
  createSlot(DayOfWeek.Friday, '22:20', '23:05', 'FREE'),
];

// Mock 11th Grade Schedule (Example)
const SCHEDULE_11_CH: TimeSlot[] = [
    // Just a slight variation for demonstration
    createSlot(DayOfWeek.Monday, '18:10', '18:50', 'MAT'),
    createSlot(DayOfWeek.Monday, '19:00', '19:45', 'MAT'),
    createSlot(DayOfWeek.Monday, '19:50', '20:35', 'POR'),
    createSlot(DayOfWeek.Monday, '20:40', '21:25', 'POR'),
    // ... (would be full schedule)
];

export const CLASS_OPTIONS = [
    { id: '12-CH', label: '12ª Classe - Ciências Humanas' },
    { id: '11-CH', label: '11ª Classe - Ciências Humanas (Demo)' },
];

export const SCHEDULES: Record<string, TimeSlot[]> = {
    '12-CH': SCHEDULE_12_CH,
    '11-CH': SCHEDULE_11_CH
};

// Helper to get schedule (fallback to 12-CH)
export const getScheduleForClass = (classId?: string): TimeSlot[] => {
    return SCHEDULES[classId || '12-CH'] || SCHEDULE_12_CH;
};

export const DEFAULT_MAX_ABSENCES = 10;

// Keep legacy export for compatibility if needed, but prefer getScheduleForClass
export const WEEKLY_SCHEDULE = SCHEDULE_12_CH;
