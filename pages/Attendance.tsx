
import React, { useState, useEffect } from 'react';
import { SUBJECTS, DEFAULT_MAX_ABSENCES } from '../constants';
import { AppData } from '../types';
import { Card } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Plus, Minus, Award, Zap, CheckCircle2, X, AlertTriangle, Info, TrendingUp, ListTodo, Percent } from 'lucide-react';

const useAppData = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('liceuAppData');
    return saved ? JSON.parse(saved) : { tasks: [], notes: [], attendance: {}, customSubjectDetails: {}, scheduleOverrides: [], studyActivityDates: [] };
  });

  useEffect(() => {
    localStorage.setItem('liceuAppData', JSON.stringify(data));
  }, [data]);

  return { data, setData };
};

export const Attendance: React.FC = () => {
  const { data, setData } = useAppData();
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const updateAttendance = (subjectId: string, change: number) => {
    const current = data.attendance[subjectId] || { subjectId, present: 0, absent: 0, maxAbsences: DEFAULT_MAX_ABSENCES };
    const newAbsent = Math.max(0, current.absent + change);
    
    setData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [subjectId]: { ...current, absent: newAbsent }
      }
    }));
  };

  // --- Calculations for KPIs ---
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let totalAbsences = 0;
  let totalMaxAbsences = 0;
  
  // Chart Data Preparation - Attendance
  const attendanceChartData = Object.values(SUBJECTS)
    .filter(s => s.id !== 'FREE')
    .map(s => {
        const record = data.attendance[s.id] || { absent: 0, maxAbsences: DEFAULT_MAX_ABSENCES };
        
        totalAbsences += record.absent;
        totalMaxAbsences += record.maxAbsences;

        const isCritical = record.absent >= record.maxAbsences * 0.8;
        return {
            id: s.id,
            name: s.shortName,
            fullName: s.name,
            absent: record.absent,
            remaining: Math.max(0, record.maxAbsences - record.absent),
            maxAbsences: record.maxAbsences,
            isCritical,
            color: s.color
        };
    })
    .sort((a, b) => (b.absent / b.maxAbsences) - (a.absent / a.maxAbsences));

  const globalAttendanceRate = totalMaxAbsences > 0 
    ? Math.round(((totalMaxAbsences - totalAbsences) / totalMaxAbsences) * 100) 
    : 100;

  // Chart Data - Tasks
  const taskChartData = [
      { name: 'Concluídas', value: completedTasks, color: '#10b981' }, // emerald-500
      { name: 'Pendentes', value: pendingTasks, color: '#f59e0b' },   // amber-500
  ];

  // Badges
  const badges = [
      { id: 1, name: 'Iniciante', desc: '1 tarefa feita', icon: CheckCircle2, unlocked: completedTasks >= 1, color: 'text-blue-500' },
      { id: 2, name: 'Focado', desc: '10 tarefas feitas', icon: Zap, unlocked: completedTasks >= 10, color: 'text-yellow-500' },
      { id: 3, name: 'Mestre', desc: '50 tarefas feitas', icon: Award, unlocked: completedTasks >= 50, color: 'text-purple-500' },
  ];

  const editingSubject = editingSubjectId ? SUBJECTS[editingSubjectId] : null;
  const editingRecord = editingSubjectId ? (data.attendance[editingSubjectId] || { absent: 0, maxAbsences: DEFAULT_MAX_ABSENCES }) : null;

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Análise de Desempenho</h1>
        <p className="text-gray-500 dark:text-gray-400">Métricas de frequência e produtividade</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Presença Global</span>
                 <div className={`p-1.5 rounded-lg ${globalAttendanceRate > 85 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <TrendingUp size={16} />
                 </div>
             </div>
             <div>
                 <span className="text-3xl font-bold text-gray-900 dark:text-white">{globalAttendanceRate}%</span>
                 <span className="text-xs text-gray-400 block mt-1">Total de Faltas: {totalAbsences}</span>
             </div>
          </div>

          <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
                 <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tarefas</span>
                 <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                    <ListTodo size={16} />
                 </div>
             </div>
             <div>
                 <span className="text-3xl font-bold text-gray-900 dark:text-white">{taskCompletionRate}%</span>
                 <span className="text-xs text-gray-400 block mt-1">{completedTasks} de {totalTasks} concluídas</span>
             </div>
          </div>
      </div>

      {/* Attendance Chart */}
      <Card className="relative overflow-visible">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Percent size={18} className="text-primary" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Faltas por Disciplina</h3>
             </div>
             <div className="flex items-center text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                 Toque na barra para editar
             </div>
        </div>
        <div className="h-[350px] w-full p-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={attendanceChartData}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    barSize={12}
                    onClick={(state: any) => {
                        if (state && state.activePayload) {
                            setEditingSubjectId(state.activePayload[0].payload.id);
                        }
                    }}
                    className="cursor-pointer"
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.05} />
                    <XAxis type="number" hide domain={[0, 'dataMax']} />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }} 
                        width={60}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{fill: 'rgba(0,0,0,0.05)'}}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-white dark:bg-dark-card p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-600 text-xs z-50">
                                        <p className="font-bold mb-2 text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-1">{d.fullName}</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">Faltas:</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{d.absent}</span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-gray-500">Restantes:</span>
                                                <span className="font-mono text-gray-700 dark:text-gray-300">{d.remaining}</span>
                                            </div>
                                            <div className="flex justify-between gap-4 text-gray-400 text-[10px]">
                                                <span>Limite: {d.maxAbsences}</span>
                                            </div>
                                        </div>
                                        {d.isCritical && (
                                            <div className="mt-2 text-red-500 flex items-center font-bold bg-red-50 dark:bg-red-900/20 p-1 rounded">
                                                <AlertTriangle size={12} className="mr-1" /> Risco Elevado
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="absent" stackId="a" radius={[0, 4, 4, 0]}>
                        {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isCritical ? '#ef4444' : '#3b82f6'} />
                        ))}
                    </Bar>
                    <Bar dataKey="remaining" stackId="a" radius={[0, 4, 4, 0]}>
                         {attendanceChartData.map((entry, index) => (
                            <Cell key={`bg-${index}`} fillOpacity={0.1} fill="#9ca3af" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Chart */}
        <Card className="min-h-[300px]">
             <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Estado das Tarefas</h3>
            </div>
            <div className="h-[200px] w-full relative">
                {totalTasks === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ListTodo size={32} className="mb-2 opacity-20" />
                        <span className="text-sm">Sem dados de tarefas</span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={taskChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {taskChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                )}
                 {totalTasks > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white block">{totalTasks}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                 )}
            </div>
        </Card>

        {/* Achievements List */}
        <Card>
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Conquistas</h3>
            </div>
            <div className="p-2 space-y-2">
                {badges.map(badge => (
                    <div key={badge.id} className={`flex items-center p-3 rounded-lg border transition-all ${badge.unlocked ? 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800 border-transparent opacity-60 grayscale'}`}>
                        <div className={`p-2 rounded-full bg-gray-50 dark:bg-gray-700 mr-3 ${badge.unlocked ? badge.color : 'text-gray-400'}`}>
                            <badge.icon size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{badge.name}</h4>
                            <p className="text-xs text-gray-500">{badge.desc}</p>
                        </div>
                        {badge.unlocked && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
                    </div>
                ))}
            </div>
        </Card>
      </div>


      {/* Edit Modal */}
      {editingSubject && editingRecord && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                 <div className={`h-24 bg-${editingSubject.color} relative p-6 flex justify-between items-start`}>
                     <h2 className="text-2xl font-bold text-white w-3/4 leading-tight">{editingSubject.name}</h2>
                     <button 
                        onClick={() => setEditingSubjectId(null)}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-colors"
                     >
                         <X size={20} />
                     </button>
                 </div>
                 
                 <div className="p-6">
                     <div className="text-center mb-6">
                         <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Faltas Registadas</span>
                         <div className="flex items-center justify-center gap-8 mt-4">
                             <button 
                                onClick={() => updateAttendance(editingSubject.id, -1)}
                                className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
                             >
                                 <Minus size={24} />
                             </button>
                             
                             <div className="flex flex-col items-center">
                                 <span className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
                                     {editingRecord.absent}
                                 </span>
                             </div>

                             <button 
                                onClick={() => updateAttendance(editingSubject.id, 1)}
                                className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors active:scale-95"
                             >
                                 <Plus size={24} />
                             </button>
                         </div>
                     </div>

                     {/* Status Indicator */}
                     <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                         <div className="flex justify-between items-center mb-2 text-sm">
                             <span className="text-gray-500 dark:text-gray-400">Limite Permitido</span>
                             <span className="font-bold text-gray-900 dark:text-white">{editingRecord.maxAbsences}</span>
                         </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-500 ${editingRecord.absent >= editingRecord.maxAbsences * 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (editingRecord.absent / editingRecord.maxAbsences) * 100)}%` }}
                             />
                         </div>
                         {editingRecord.absent >= editingRecord.maxAbsences * 0.8 && (
                             <p className="mt-2 text-xs text-red-500 flex items-center font-medium">
                                 <AlertTriangle size={12} className="mr-1" /> 
                                 Atenção: Risco de reprovação por faltas.
                             </p>
                         )}
                     </div>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};
