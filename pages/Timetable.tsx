
import React, { useState, useEffect } from 'react';
import { SUBJECTS, getScheduleForClass } from '../constants';
import { DayOfWeek, AppData, TimeSlot } from '../types';
import { Card } from '../components/Card';
import { Edit3, X, Save, RotateCcw, Bell, BellOff, Clock } from 'lucide-react';
import { format } from 'date-fns';

const useAppData = () => {
    const [data, setData] = useState<AppData>(() => {
        const saved = localStorage.getItem('liceuAppData');
        return saved ? JSON.parse(saved) : { tasks: [], notes: [], grades: [], attendance: {}, customSubjectDetails: {}, scheduleOverrides: [], studyActivityDates: [], reminders: [], selectedClassId: '12-CH' };
    });
    
    useEffect(() => {
        localStorage.setItem('liceuAppData', JSON.stringify(data));
    }, [data]);

    return { data, setData };
};

export const Timetable: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlotForEdit, setSelectedSlotForEdit] = useState<TimeSlot | null>(null);
  const [selectedSlotForReminder, setSelectedSlotForReminder] = useState<TimeSlot | null>(null);
  
  const { data, setData } = useAppData();
  const days = Object.values(DayOfWeek).filter(d => d !== DayOfWeek.Saturday && d !== DayOfWeek.Sunday);

  // Get Active Schedule based on class ID
  const activeSchedule = getScheduleForClass(data.selectedClassId);

  const today = new Date();
  const targetDateStr = format(today, 'yyyy-MM-dd'); 

  const rawSchedule = activeSchedule.filter(slot => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const displayedSchedule = rawSchedule.map(slot => {
     const override = data.scheduleOverrides?.find(o => o.slotId === slot.id); 
     const reminder = data.reminders?.find(r => r.slotId === slot.id && r.active);

     if (override) {
         return { ...slot, subjectId: override.newSubjectId, isOverridden: true, reminder };
     }
     return { ...slot, reminder };
  });

  const handleOverride = (slot: TimeSlot, newSubjectId: string) => {
      const newOverride = {
          date: targetDateStr,
          slotId: slot.id,
          newSubjectId: newSubjectId
      };
      
      const filtered = data.scheduleOverrides.filter(o => o.slotId !== slot.id);
      setData(prev => ({
          ...prev,
          scheduleOverrides: [...filtered, newOverride]
      }));
      setSelectedSlotForEdit(null);
  };

  const handleReset = (slotId: string) => {
      setData(prev => ({
          ...prev,
          scheduleOverrides: prev.scheduleOverrides.filter(o => o.slotId !== slotId)
      }));
  };

  const saveReminder = (minutes: number) => {
      if (!selectedSlotForReminder) return;

      const newReminder = {
          slotId: selectedSlotForReminder.id,
          minutesBefore: minutes,
          active: true
      };

      // Remove existing reminder for this slot then add new one
      const filtered = (data.reminders || []).filter(r => r.slotId !== selectedSlotForReminder.id);
      
      setData(prev => ({
          ...prev,
          reminders: [...filtered, newReminder]
      }));
      setSelectedSlotForReminder(null);
  };

  const removeReminder = () => {
      if (!selectedSlotForReminder) return;
      setData(prev => ({
          ...prev,
          reminders: (prev.reminders || []).filter(r => r.slotId !== selectedSlotForReminder.id)
      }));
      setSelectedSlotForReminder(null);
  };

  return (
    <div className="space-y-4 pb-20">
       <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Horário</h1>
        <button 
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-full transition-colors ${editMode ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
            {editMode ? <Save size={20} /> : <Edit3 size={20} />}
        </button>
      </header>
      
        {/* Day Selector */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {day.replace('-feira', '')}
            </button>
          ))}
        </div>

      {editMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800 mb-2">
              Modo de Edição: Toque numa aula para alterar temporariamente.
          </div>
      )}

      <div className="space-y-3">
        {displayedSchedule.length > 0 ? (
          displayedSchedule.map((slot, idx) => {
            const subject = SUBJECTS[slot.subjectId];
            // @ts-ignore
            const isOverridden = slot.isOverridden;
            // @ts-ignore
            const reminder = slot.reminder;

            return (
              <Card 
                key={idx} 
                className={`transform transition-all ${editMode ? 'ring-2 ring-offset-2 ring-primary cursor-pointer hover:scale-[0.99]' : ''}`}
              >
                <div 
                    className="flex items-center relative"
                    onClick={() => editMode ? setSelectedSlotForEdit(slot) : null}
                >
                  {isOverridden && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10">
                          Alterado
                      </div>
                  )}
                  
                  <div className={`w-1.5 h-12 rounded-full mr-4 bg-${subject.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">{subject.name}</h3>
                      <div className="flex items-center gap-2">
                          {/* Reminder Button */}
                          {!editMode && (
                             <button
                                onClick={(e) => { e.stopPropagation(); setSelectedSlotForReminder(slot); }}
                                className={`p-1.5 rounded-full transition-colors ${reminder ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                             >
                                 {reminder ? <Bell size={16} fill="currentColor" /> : <Bell size={16} />}
                             </button>
                          )}
                          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {slot.startTime}
                          </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.teacherName || (subject.id === 'FREE' ? 'Tempo livre' : 'Prof. Não Atribuído')}
                        </p>
                        {editMode && isOverridden && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleReset(slot.id); }}
                                className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                            >
                                <RotateCcw size={14} />
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Sem aulas neste dia.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedSlotForEdit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-dark-card rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-white">Substituir Aula</h3>
                      <button onClick={() => setSelectedSlotForEdit(null)}><X size={24} className="text-gray-500" /></button>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                      <p className="text-sm text-gray-500 mb-4">Selecione a disciplina para substituir o horário das {selectedSlotForEdit.startTime}:</p>
                      <div className="grid grid-cols-2 gap-2">
                          {Object.values(SUBJECTS).map(subj => (
                              <button
                                key={subj.id}
                                onClick={() => handleOverride(selectedSlotForEdit, subj.id)}
                                className={`p-3 rounded-lg border text-sm font-medium text-left flex items-center ${subj.id === selectedSlotForEdit.subjectId ? 'ring-2 ring-primary border-primary' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                              >
                                  <div className={`w-3 h-3 rounded-full bg-${subj.color} mr-2`} />
                                  <span className="truncate dark:text-white">{subj.shortName}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Reminder Modal */}
      {selectedSlotForReminder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end sm:justify-center items-end sm:items-center p-0 sm:p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-dark-card rounded-t-xl sm:rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Bell className="text-primary" size={20} />
                         <h3 className="font-bold text-gray-900 dark:text-white">Definir Lembrete</h3>
                      </div>
                      <button onClick={() => setSelectedSlotForReminder(null)}><X size={24} className="text-gray-500" /></button>
                  </div>
                  <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          Será notificado antes da aula das <span className="font-bold">{selectedSlotForReminder.startTime}</span> começar.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                          {[5, 10, 15, 30].map(mins => (
                              <button
                                key={mins}
                                onClick={() => saveReminder(mins)}
                                className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                              >
                                  <Clock size={20} className="mb-1 text-gray-500 dark:text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{mins} min</span>
                              </button>
                          ))}
                      </div>

                      <button 
                        onClick={removeReminder}
                        className="w-full py-3 rounded-lg text-red-500 bg-red-50 dark:bg-red-900/10 font-medium flex items-center justify-center"
                      >
                          <BellOff size={18} className="mr-2" />
                          Desativar Lembrete
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
