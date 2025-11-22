
import React, { useState, useEffect } from 'react';
import { SUBJECTS, getScheduleForClass, CLASS_OPTIONS } from '../constants';
import { getCurrentTimeSlot, getNextTimeSlot, getEffectiveDailySchedule, calculateTimeLeft, calculateSchoolYearProgress, calculateStreak, getDayName } from '../utils';
import { Card } from '../components/Card';
import { Clock, MapPin, AlertCircle, Flame, Trophy, ListChecks, Calendar, Settings, X, User, Download, Upload, Save } from 'lucide-react';
import { format } from 'date-fns';
import { AppData } from '../types';

const useAppData = () => {
    const [data, setData] = useState<AppData>(() => {
        const saved = localStorage.getItem('liceuAppData');
        return saved ? JSON.parse(saved) : { tasks: [], notes: [], grades: [], resources: [], attendance: {}, customSubjectDetails: {}, scheduleOverrides: [], studyActivityDates: [], selectedClassId: '12-CH', userName: 'Estudante' };
    });
    
    // Save whenever data changes
    useEffect(() => {
        localStorage.setItem('liceuAppData', JSON.stringify(data));
    }, [data]);

    return { data, setData };
};

export const Dashboard: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const { data, setData } = useAppData();
  const [showSettings, setShowSettings] = useState(false);
  const [tempName, setTempName] = useState(data.userName || 'Estudante');
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  // Update temp name when modal opens
  useEffect(() => {
      if(showSettings) setTempName(data.userName || 'Estudante');
  }, [showSettings, data.userName]);

  // Get Schedule based on selected Class
  const activeSchedule = getScheduleForClass(data.selectedClassId);

  // Get Schedule with Overrides
  const effectiveTodaySchedule = getEffectiveDailySchedule(activeSchedule, now, data);
  const currentSlot = getCurrentTimeSlot(activeSchedule, data.scheduleOverrides);
  const nextSlot = getNextTimeSlot(activeSchedule, data.scheduleOverrides);

  const currentSubject = currentSlot ? SUBJECTS[currentSlot.subjectId] : null;
  const nextSubject = nextSlot ? SUBJECTS[nextSlot.subjectId] : null;

  // Gamification Stats
  const yearProgress = calculateSchoolYearProgress();
  const streak = calculateStreak(data.studyActivityDates);
  const pendingTasks = data.tasks.filter(t => !t.isCompleted).length;
  
  // Workload indicator
  let workloadColor = 'bg-green-500';
  let workloadText = 'Leve';
  if (pendingTasks > 5) { workloadColor = 'bg-yellow-500'; workloadText = 'Moderada'; }
  if (pendingTasks > 10) { workloadColor = 'bg-red-500'; workloadText = 'Pesada'; }

  // Progress bar calculation for current slot
  let progress = 0;
  if (currentSlot) {
    const start = parseInt(currentSlot.startTime.replace(':', ''));
    const end = parseInt(currentSlot.endTime.replace(':', ''));
    const curr = parseInt(format(now, 'HHmm'));
    progress = Math.min(100, Math.max(0, ((curr - start) / (end - start)) * 100));
  }

  // Manual formatting for Portuguese date
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const formattedDate = `${getDayName(now)}, ${now.getDate()} de ${months[now.getMonth()]}`;
  const timeString = format(now, 'HH:mm');

  const handleClassChange = (classId: string) => {
      setData(prev => ({ ...prev, selectedClassId: classId }));
  };

  const saveName = () => {
      setData(prev => ({ ...prev, userName: tempName }));
      alert('Nome atualizado!');
  };

  // --- Backup & Restore Logic ---
  const handleExportData = () => {
      const dataStr = JSON.stringify(data);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liceu-sumbe-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedData = JSON.parse(event.target?.result as string);
              // Simple validation check
              if (importedData && Array.isArray(importedData.tasks)) {
                  if (window.confirm('Isto irá substituir todos os dados atuais pelos do ficheiro. Tem a certeza?')) {
                      setData(importedData);
                      alert('Dados restaurados com sucesso!');
                      setShowSettings(false);
                  }
              } else {
                  alert('Ficheiro de backup inválido.');
              }
          } catch (err) {
              alert('Erro ao ler o ficheiro.');
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 relative animate-fade-in">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-3">
             {/* Logo Added Here */}
             <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-1 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <img src="https://cdn-icons-png.flaticon.com/512/4305/4305432.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    Olá, {data.userName || 'Estudante'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 capitalize text-sm">
                    {formattedDate}
                </p>
             </div>
             <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary mb-1 transition-colors">
                 <Settings size={18} />
             </button>
        </div>
        <div className="flex items-center gap-3">
             {/* Digital Clock */}
             <div className="text-4xl font-mono font-bold tracking-tighter text-gray-800 dark:text-white leading-none hidden xs:block sm:block">
                {timeString}
             </div>

             <div className="flex flex-col items-center justify-center px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800 h-full animate-pulse-slow">
                <div className="flex items-center text-orange-500 font-bold">
                    <Flame size={16} className={`mr-1 ${streak > 0 ? 'fill-orange-500 animate-pulse' : ''}`} />
                    <span>{streak}</span>
                </div>
                <span className="text-[10px] text-orange-400 uppercase font-bold leading-none">Dias</span>
             </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-dark-card rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <Settings size={18} /> Definições
                      </h3>
                      <button onClick={() => setShowSettings(false)}><X size={24} className="text-gray-500" /></button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto space-y-6">
                      {/* Profile Section */}
                      <section>
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                              <User size={12} /> Perfil
                          </h4>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={tempName} 
                                onChange={(e) => setTempName(e.target.value)}
                                className="flex-1 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="O teu nome"
                              />
                              <button onClick={saveName} className="p-2 bg-primary text-white rounded-lg">
                                  <Save size={18} />
                              </button>
                          </div>
                      </section>

                      {/* Class Selection */}
                      <section>
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Turma / Horário</h4>
                           <div className="space-y-2">
                              {CLASS_OPTIONS.map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => handleClassChange(opt.id)}
                                    className={`w-full p-3 text-left rounded-lg border text-sm font-medium transition-colors ${
                                        data.selectedClassId === opt.id 
                                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20 text-primary' 
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  >
                                      {opt.label}
                                  </button>
                              ))}
                          </div>
                      </section>

                      {/* Data Management */}
                      <section className="pt-4 border-t border-gray-100 dark:border-gray-700">
                           <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Backup & Dados</h4>
                           <div className="grid grid-cols-2 gap-3">
                               <button 
                                    onClick={handleExportData}
                                    className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                               >
                                   <Download size={20} className="text-gray-600 dark:text-gray-300 mb-1" />
                                   <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Exportar</span>
                               </button>
                               <label className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                   <Upload size={20} className="text-gray-600 dark:text-gray-300 mb-1" />
                                   <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Restaurar</span>
                                   <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                               </label>
                           </div>
                           <p className="text-[10px] text-gray-400 mt-2 text-center leading-tight">
                               Guarde o ficheiro JSON num local seguro. Ao restaurar, os dados atuais serão substituídos.
                           </p>
                      </section>
                  </div>
              </div>
          </div>
      )}

      {/* Current Class Hero Card */}
      <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {currentSlot && currentSubject ? (
          <div className={`p-6 rounded-2xl text-white shadow-lg bg-gradient-to-br from-${currentSubject.color.split('-')[0]}-500 to-${currentSubject.color.split('-')[0]}-700 relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl animate-pulse-slow"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="px-2 py-1 bg-white/20 rounded-md text-sm font-medium backdrop-blur-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                A Decorrer
              </span>
              <span className="text-2xl font-bold tracking-tight font-mono">
                {calculateTimeLeft(currentSlot.endTime)}
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-1 relative z-10">{currentSubject.name}</h2>
            <div className="flex items-center space-x-2 opacity-90 text-sm relative z-10">
              <Clock size={16} />
              <span>{currentSlot.startTime} - {currentSlot.endTime}</span>
              <span className="mx-2">•</span>
              <MapPin size={16} />
              <span>Sala 06</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6 h-1.5 bg-black/20 rounded-full overflow-hidden relative z-10">
              <div 
                className="h-full bg-white/90 rounded-full transition-all duration-500 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-0">
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle size={48} className="mb-2 opacity-50" />
              <h3 className="text-lg font-medium">Sem aulas agora</h3>
              <p className="text-sm">Aproveite para descansar ou estudar.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Motivation & Progress Row */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
         <Card className="flex flex-col justify-between min-h-[100px] relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ano Letivo</span>
                <Calendar size={16} className="text-primary" />
            </div>
            <div>
                <div className="flex items-end space-x-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{yearProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${yearProgress}%` }} />
                </div>
            </div>
         </Card>

         <Card className="flex flex-col justify-between min-h-[100px]">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Carga Semanal</span>
                <ListChecks size={16} className={workloadText === 'Pesada' ? 'text-red-500' : 'text-green-500'} />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white block">{pendingTasks}</span>
                <span className="text-xs text-gray-500">Tarefas pendentes</span>
                <div className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block text-white ${workloadColor}`}>
                    {workloadText}
                </div>
            </div>
         </Card>
      </div>

      {/* Next Class Preview */}
      {nextSlot && nextSubject && (
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Card title="A Seguir">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-${nextSubject.color}`}>
                {nextSubject.shortName.substring(0, 2)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {nextSubject.name}
                    {/* Priority indicator */}
                    {(data.customSubjectDetails[nextSubject.id]?.isPriority) && (
                        <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Prioridade Alta"></span>
                    )}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nextSlot.startTime} - {nextSlot.endTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                Em {calculateTimeLeft(nextSlot.startTime).replace('m', ' min')}
              </span>
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* Daily Timeline */}
      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <Card title="Linha do Tempo Hoje">
        <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6 my-2">
          {effectiveTodaySchedule.map((slot, index) => {
            const subject = SUBJECTS[slot.subjectId];
            const isPast = slot.endTime < format(now, 'HH:mm');
            const isCurrent = slot === currentSlot;
            const customDetails = data.customSubjectDetails[subject.id] || {};

            return (
              <div key={index} className={`relative transition-opacity duration-500 ${isPast ? 'opacity-50' : ''}`}>
                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-dark-card transition-transform duration-300 ${isCurrent ? 'bg-primary scale-125' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-0.5">
                    {slot.startTime}
                  </span>
                  <span className={`font-medium flex items-center ${isCurrent ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                    {subject.name}
                    {customDetails.isPriority && <Trophy size={12} className="ml-2 text-yellow-500" />}
                  </span>
                  <span className="text-xs text-gray-500">
                    {slot.endTime}
                  </span>
                </div>
              </div>
            );
          })}
          {effectiveTodaySchedule.length === 0 && (
            <p className="text-sm text-gray-500">Sem aulas agendadas para hoje.</p>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
};
