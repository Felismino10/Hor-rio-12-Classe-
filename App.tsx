
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { Timetable } from './pages/Timetable';
import { Subjects } from './pages/Subjects';
import { Attendance } from './pages/Attendance';
import { Tools } from './pages/Tools'; // Import Tools
import { AppData, DayOfWeek } from './types';
import { getDayName } from './utils';
import { SUBJECTS, getScheduleForClass } from './constants';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Notification Logic ---
  
  // Helper to safely parse JSON
  const getSavedData = (): AppData => {
      try {
          const saved = localStorage.getItem('liceuAppData');
          return saved ? JSON.parse(saved) : { reminders: [] };
      } catch (e) {
          return { reminders: [] } as any;
      }
  };

  const checkReminders = useCallback(() => {
      const data = getSavedData();
      if (!data.reminders || data.reminders.length === 0) return;

      const now = new Date();
      const currentDay = getDayName(now);
      const currentTimeStr = format(now, 'HH:mm');

      // Get schedule for user selected class (defaults to 12-CH if undefined)
      const activeSchedule = getScheduleForClass(data.selectedClassId);

      // Filter schedule for today
      const todaySlots = activeSchedule.filter(slot => slot.day === currentDay);

      todaySlots.forEach(slot => {
          const reminder = data.reminders.find(r => r.slotId === slot.id && r.active);
          if (reminder) {
              // Calculate trigger time
              // slot.startTime is "HH:mm"
              // We need to see if NOW == (slotTime - minutesBefore)
              const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
              const slotDate = new Date(now);
              slotDate.setHours(slotHour, slotMinute, 0, 0);

              // triggerDate = slotDate - minutesBefore
              const triggerDate = new Date(slotDate.getTime() - reminder.minutesBefore * 60000);
              const triggerTimeStr = format(triggerDate, 'HH:mm');

              if (currentTimeStr === triggerTimeStr) {
                  // Trigger Notification
                  const subject = SUBJECTS[slot.subjectId];
                  const msg = `A aula de ${subject.name} começa em ${reminder.minutesBefore} minutos!`;
                  
                  // Try native notification
                  if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification('Liceu Sumbe TimeTable', { body: msg });
                  } else if ('Notification' in window && Notification.permission !== 'denied') {
                      Notification.requestPermission().then(permission => {
                          if (permission === 'granted') {
                              new Notification('Liceu Sumbe TimeTable', { body: msg });
                          }
                      });
                  } else {
                      // Fallback for when notifications are blocked or not supported in iframe
                      alert(msg); 
                  }
              }
          }
      });
  }, []);

  useEffect(() => {
      // Request permission on mount
      if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
      }

      // Check every minute
      const interval = setInterval(checkReminders, 60000);
      
      // Also check immediately on load (optional, might be annoying if it pops right away)
      // checkReminders();

      return () => clearInterval(interval);
  }, [checkReminders]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      <Router>
        <div className="w-full md:max-w-2xl mx-auto min-h-screen bg-white dark:bg-dark-bg shadow-2xl relative overflow-hidden">
          {/* Mobile Status Bar Placeholder (Safe Area) */}
          <div className="h-safe-top w-full bg-white dark:bg-dark-bg sticky top-0 z-40" />
          
          <main className="p-4">
             <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/stats" element={<Attendance />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <BottomNav />
        </div>
      </Router>
    </div>
  );
};

export default App;
