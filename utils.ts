
import { DayOfWeek, TimeSlot, AppData } from './types';
import { format, getDay, isBefore, isAfter, addDays, differenceInDays } from 'date-fns';
import { SCHOOL_START_DATE, SCHOOL_END_DATE } from './constants';

export const getDayName = (date: Date): DayOfWeek => {
  const dayIndex = getDay(date);
  const map: Record<number, DayOfWeek> = {
    0: DayOfWeek.Sunday,
    1: DayOfWeek.Monday,
    2: DayOfWeek.Tuesday,
    3: DayOfWeek.Wednesday,
    4: DayOfWeek.Thursday,
    5: DayOfWeek.Friday,
    6: DayOfWeek.Saturday,
  };
  return map[dayIndex];
};

// New: Get schedule for a specific date, applying any user overrides
export const getEffectiveDailySchedule = (baseSchedule: TimeSlot[], date: Date, appData: AppData): TimeSlot[] => {
  const dayName = getDayName(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  const daysSlots = baseSchedule.filter(slot => slot.day === dayName);

  return daysSlots.map(slot => {
    const override = appData.scheduleOverrides?.find(o => o.date === dateStr && o.slotId === slot.id);
    if (override) {
      return { ...slot, subjectId: override.newSubjectId };
    }
    return slot;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getCurrentTimeSlot = (schedule: TimeSlot[], overrides: AppData['scheduleOverrides']): TimeSlot | null => {
  const now = new Date();
  const effectiveSchedule = getEffectiveDailySchedule(schedule, now, { scheduleOverrides: overrides } as AppData);
  const currentTimeStr = format(now, 'HH:mm');

  return effectiveSchedule.find(slot => 
    slot.startTime <= currentTimeStr && 
    slot.endTime > currentTimeStr
  ) || null;
};

export const getNextTimeSlot = (schedule: TimeSlot[], overrides: AppData['scheduleOverrides']): TimeSlot | null => {
  const now = new Date();
  const effectiveSchedule = getEffectiveDailySchedule(schedule, now, { scheduleOverrides: overrides } as AppData);
  const currentTimeStr = format(now, 'HH:mm');

  return effectiveSchedule.find(slot => slot.startTime > currentTimeStr) || null;
};

export const calculateTimeLeft = (endTimeStr: string): string => {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  // Use native Date parsing
  const endDateTime = new Date(`${todayStr}T${endTimeStr}`);
  
  const diffMs = endDateTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return "0m";

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${remainingMinutes}m`;
};

export const calculateSchoolYearProgress = (): number => {
  const now = new Date();
  if (isBefore(now, SCHOOL_START_DATE)) return 0;
  if (isAfter(now, SCHOOL_END_DATE)) return 100;

  const totalDuration = SCHOOL_END_DATE.getTime() - SCHOOL_START_DATE.getTime();
  const elapsed = now.getTime() - SCHOOL_START_DATE.getTime();

  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
};

export const calculateStreak = (activityDates: string[]): number => {
  if (!activityDates || activityDates.length === 0) return 0;

  const sortedDates = [...new Set(activityDates)].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Use native Date subtraction
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = format(yesterdayDate, 'yyyy-MM-dd');

  // Check if streak is alive (active today or yesterday)
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const diff = differenceInDays(currentDate, prevDate);
    
    if (diff === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  return streak;
};
