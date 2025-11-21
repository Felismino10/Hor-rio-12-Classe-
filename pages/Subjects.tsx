
import React, { useState, useEffect } from 'react';
import { SUBJECTS } from '../constants';
import { Subject, Task, Note, AppData, Grade } from '../types';
import { Card } from '../components/Card';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { ChevronRight, Plus, Trash2, Save, Phone, Mail, FileText, CheckCircle, Users, Star, Zap, Calendar as CalendarIcon, PenTool, CheckSquare, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

const useAppData = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('liceuAppData');
    return saved ? JSON.parse(saved) : { tasks: [], notes: [], grades: [], attendance: {}, customSubjectDetails: {}, scheduleOverrides: [], studyActivityDates: [], selectedClassId: '12-CH' };
  });

  useEffect(() => {
    localStorage.setItem('liceuAppData', JSON.stringify(data));
  }, [data]);

  return { data, setData };
};

export const Subjects: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const { data, setData } = useAppData();
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'tasks' | 'grades'>('details');

  // Form states
  const [noteContent, setNoteContent] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  
  // Grade Form State
  const [gradeName, setGradeName] = useState('');
  const [gradeValue, setGradeValue] = useState<number | ''>('');

  const subjectsList = Object.values(SUBJECTS).filter(s => s.id !== 'FREE');

  // Activity Logger for streaks
  const logActivity = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (!data.studyActivityDates.includes(today)) {
      setData(prev => ({
        ...prev,
        studyActivityDates: [...prev.studyActivityDates, today]
      }));
    }
  };

  const handleAddNote = () => {
    if (!selectedSubject || !noteContent.trim()) return;
    
    const now = new Date();
    const timePrefix = format(now, 'HH:mm');
    const finalContent = `${timePrefix} - ${noteContent}`;

    const newNote: Note = {
      id: Date.now().toString(),
      subjectId: selectedSubject.id,
      content: finalContent,
      createdAt: now.toISOString(),
    };
    setData(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
    setNoteContent('');
    logActivity();
    setActiveTab('notes'); // Auto-switch to notes tab
  };

  const handleAddTask = () => {
    if (!selectedSubject || !taskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      subjectId: selectedSubject.id,
      title: taskTitle,
      dueDate: new Date(taskDueDate).toISOString(),
      isCompleted: false,
      type: 'HOMEWORK',
      priority: taskPriority,
    };
    setData(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    setTaskTitle('');
    setTaskPriority('MEDIUM');
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    logActivity();
    setActiveTab('tasks'); // Auto-switch to tasks tab
  };

  const handleAddGrade = () => {
      if (!selectedSubject || !gradeName.trim() || gradeValue === '') return;
      
      const numericValue = Number(gradeValue);
      if (isNaN(numericValue) || numericValue < 0 || numericValue > 20) {
          alert('A nota deve ser entre 0 e 20 valores.');
          return;
      }

      const newGrade: Grade = {
          id: Date.now().toString(),
          subjectId: selectedSubject.id,
          name: gradeName,
          value: numericValue,
          createdAt: new Date().toISOString()
      };

      setData(prev => ({ ...prev, grades: [newGrade, ...(prev.grades || [])] }));
      setGradeName('');
      setGradeValue('');
      logActivity();
  };

  const deleteGrade = (gradeId: string) => {
      setData(prev => ({
          ...prev,
          grades: (prev.grades || []).filter(g => g.id !== gradeId)
      }));
  };

  const toggleTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
    }));
    logActivity();
  };

  const deleteTask = (taskId: string) => {
      setData(prev => ({
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
  };

  const updateSubjectDetail = (key: keyof Subject, value: any) => {
    if (!selectedSubject) return;
    setData(prev => ({
      ...prev,
      customSubjectDetails: {
        ...prev.customSubjectDetails,
        [selectedSubject.id]: {
          ...prev.customSubjectDetails[selectedSubject.id],
          [key]: value
        }
      }
    }));
  };

  if (selectedSubject) {
    const subjectNotes = data.notes.filter(n => n.subjectId === selectedSubject.id);
    const subjectTasks = data.tasks.filter(t => t.subjectId === selectedSubject.id);
    const subjectGrades = (data.grades || []).filter(g => g.subjectId === selectedSubject.id);
    const customDetails = data.customSubjectDetails[selectedSubject.id] || {};
    const mergedSubject = { ...selectedSubject, ...customDetails };

    // Calculate Average
    const totalGrades = subjectGrades.reduce((sum, g) => sum + g.value, 0);
    const average = subjectGrades.length > 0 ? (totalGrades / subjectGrades.length).toFixed(1) : null;

    return (
      <div className="pb-20 space-y-4">
        <button 
          onClick={() => setSelectedSubject(null)}
          className="text-sm text-gray-500 hover:text-primary flex items-center mb-2"
        >
          ← Voltar à lista
        </button>
        
        <div className={`p-6 rounded-2xl bg-${selectedSubject.color} text-white shadow-lg relative overflow-hidden`}>
          <div className="relative z-10">
              <h1 className="text-3xl font-bold">{selectedSubject.name}</h1>
              <p className="opacity-90">12ª Classe • Ciências Humanas</p>
          </div>
          {/* Priority Badge in Header */}
          {mergedSubject.isPriority && (
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full">
                <Star className="text-yellow-300" fill="currentColor" size={24} />
             </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['details', 'notes', 'tasks', 'grades'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium capitalize border-b-2 whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {tab === 'details' ? 'Estudo' : tab === 'notes' ? 'Notas' : tab === 'tasks' ? 'Tarefas' : 'Notas (Av.)'}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4">
             {/* Smart Study Section */}
             <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                        <Zap size={18} className="mr-2 text-yellow-500" />
                        Modo Foco
                    </h3>
                </div>
                <PomodoroTimer />
             </div>

             {/* Quick Actions */}
             <Card title="Ações Rápidas">
                <div className="space-y-3">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Nota rápida..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
                        />
                        <button 
                            onClick={handleAddNote}
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={() => setActiveTab('tasks')}
                        className="w-full py-2 flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium"
                    >
                        <CheckSquare size={16} />
                        <span>Gerir Tarefas</span>
                    </button>
                </div>
             </Card>

             <Card title="Definições">
               <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                      <span className="text-gray-800 dark:text-white font-medium">Prioridade Alta / Exame</span>
                      <span className="text-xs text-gray-500">Destacar esta disciplina no painel</span>
                  </div>
                  <button 
                    onClick={() => updateSubjectDetail('isPriority', !mergedSubject.isPriority)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${mergedSubject.isPriority ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${mergedSubject.isPriority ? 'translate-x-6' : ''}`} />
                  </button>
               </div>
             </Card>

             <Card title="Metas da Disciplina">
               <textarea
                 className="w-full bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 resize-none"
                 placeholder="Toque para adicionar objetivos..."
                 rows={3}
                 value={mergedSubject.goals || ''}
                 onChange={(e) => updateSubjectDetail('goals', e.target.value)}
               />
             </Card>
             <Card title="Informações do Professor">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Users size={18} className="text-gray-600 dark:text-gray-300"/>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Nome do Professor"
                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full py-1 dark:text-white"
                      value={mergedSubject.teacherName || ''}
                      onChange={(e) => updateSubjectDetail('teacherName', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Phone size={18} className="text-gray-600 dark:text-gray-300"/>
                    </div>
                     <input 
                      type="text" 
                      placeholder="Contacto"
                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none w-full py-1 dark:text-white"
                      value={mergedSubject.teacherContact || ''}
                      onChange={(e) => updateSubjectDetail('teacherContact', e.target.value)}
                    />
                  </div>
                </div>
             </Card>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Nova anotação..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              />
              <button onClick={handleAddNote} className="p-2 bg-primary text-white rounded-lg">
                <Plus size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {subjectNotes.map(note => (
                <div key={note.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg text-sm text-gray-800 dark:text-gray-200 relative group">
                  <p>{note.content}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{format(new Date(note.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              ))}
              {subjectNotes.length === 0 && <p className="text-center text-gray-400 py-8">Sem notas.</p>}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
             <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adicionar Nova Tarefa</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="O que é preciso fazer?"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                    />
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Data de Entrega</label>
                            <input
                                type="date"
                                value={taskDueDate}
                                onChange={(e) => setTaskDueDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Prioridade</label>
                            <select
                                value={taskPriority}
                                onChange={(e) => setTaskPriority(e.target.value as any)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={handleAddTask}
                        className="w-full py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Criar Tarefa
                    </button>
                </div>
             </div>

            <div className="space-y-2">
              {subjectTasks.map(task => (
                <div key={task.id} className="flex items-center p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`mr-3 flex-shrink-0 ${task.isCompleted ? 'text-green-500' : 'text-gray-300'}`}
                  >
                    <CheckCircle size={22} fill={task.isCompleted ? 'currentColor' : 'none'} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                            task.priority === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                            {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                            <CalendarIcon size={10} className="mr-1" />
                            {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                        </span>
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 ml-2">
                      <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {subjectTasks.length === 0 && <p className="text-center text-gray-400 py-8">Sem tarefas.</p>}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
            <div className="space-y-4">
                {/* Average Card */}
                <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-none">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Média Actual</p>
                            <h2 className={`text-4xl font-bold mt-1 ${
                                average ? (Number(average) < 10 ? 'text-red-400' : Number(average) < 14 ? 'text-yellow-400' : 'text-green-400') : 'text-white'
                            }`}>
                                {average || '--'} <span className="text-lg text-gray-500 font-normal">/ 20</span>
                            </h2>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full">
                            <GraduationCap size={32} />
                        </div>
                    </div>
                </Card>

                {/* Add Grade Form */}
                <Card title="Registar Nova Nota">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Descrição (ex: Teste 1)"
                            value={gradeName}
                            onChange={(e) => setGradeName(e.target.value)}
                            className="flex-grow px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                        />
                        <input
                            type="number"
                            placeholder="0-20"
                            min="0"
                            max="20"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:text-white text-sm"
                        />
                        <button 
                            onClick={handleAddGrade}
                            className="bg-primary text-white px-4 rounded-lg hover:bg-blue-600"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </Card>

                {/* Grades List */}
                <div className="space-y-2">
                    {subjectGrades.map(grade => (
                        <div key={grade.id} className="flex items-center justify-between p-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800 dark:text-white">{grade.name}</p>
                                <p className="text-xs text-gray-400">{format(new Date(grade.createdAt), 'dd/MM/yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-lg ${
                                    grade.value < 10 ? 'text-red-500' : grade.value < 14 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                    {grade.value}
                                </span>
                                <button onClick={() => deleteGrade(grade.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {subjectGrades.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            Nenhuma nota registada ainda.
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinas</h1>
        <p className="text-gray-500 dark:text-gray-400">Gerir metas, notas e prioridades</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjectsList.map(subject => {
           const customDetails = data.customSubjectDetails[subject.id] || {};
           const isPriority = customDetails.isPriority;

           return (
            <div 
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`flex items-center p-4 bg-white dark:bg-dark-card rounded-xl border shadow-sm active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden ${isPriority ? 'border-l-4 border-l-red-500 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}
            >
                <div className={`w-10 h-10 rounded-full bg-${subject.color} flex items-center justify-center text-white font-bold text-sm mr-4 shadow-sm`}>
                {subject.shortName.substring(0, 2)}
                </div>
                <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {subject.name}
                    {isPriority && <Star size={14} className="ml-1 text-yellow-500" fill="currentColor" />}
                </h3>
                <p className="text-xs text-gray-500">{subject.shortName}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </div>
           );
        })}
      </div>
    </div>
  );
};
