
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { AppData, Flashcard, Contact, SchoolEvent, Question } from '../types';
import { 
    Brain, PenTool, HelpCircle, Sigma, Calendar as CalendarIcon, Users, 
    Plus, Trash2, ChevronLeft, CheckCircle2, RotateCw, Eraser, Save 
} from 'lucide-react';
import { format } from 'date-fns';

const useAppData = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('liceuAppData');
    // Initialize with defaults if missing new fields
    const parsed = saved ? JSON.parse(saved) : {};
    return {
        flashcards: [],
        schoolEvents: [],
        questions: [],
        contacts: [],
        scratchpadData: '',
        ...parsed
    };
  });

  useEffect(() => {
    localStorage.setItem('liceuAppData', JSON.stringify(data));
  }, [data]);

  return { data, setData };
};

export const Tools: React.FC = () => {
  const { data, setData } = useAppData();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
      { id: 'flashcards', name: 'Flashcards', icon: Brain, color: 'bg-purple-500', desc: 'Memorização Ativa' },
      { id: 'scratchpad', name: 'Rascunho', icon: PenTool, color: 'bg-blue-500', desc: 'Quadro Branco Livre' },
      { id: 'questions', name: 'Dúvidas', icon: HelpCircle, color: 'bg-orange-500', desc: 'Perguntar ao Professor' },
      { id: 'formulas', name: 'Fórmulas', icon: Sigma, color: 'bg-teal-500', desc: 'Resumos Rápidos' },
      { id: 'events', name: 'Eventos', icon: CalendarIcon, color: 'bg-red-500', desc: 'Calendário Escolar' },
      { id: 'contacts', name: 'Turma', icon: Users, color: 'bg-indigo-500', desc: 'Contactos Úteis' },
  ];

  const renderToolContent = () => {
      switch (activeTool) {
          case 'flashcards': return <FlashcardTool data={data} setData={setData} />;
          case 'scratchpad': return <ScratchpadTool data={data} setData={setData} />;
          case 'questions': return <QuestionsTool data={data} setData={setData} />;
          case 'formulas': return <FormulasTool />; // Static content
          case 'events': return <EventsTool data={data} setData={setData} />;
          case 'contacts': return <ContactsTool data={data} setData={setData} />;
          default: return null;
      }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <header className="flex items-center">
        {activeTool ? (
            <button 
                onClick={() => setActiveTool(null)} 
                className="mr-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200"
            >
                <ChevronLeft size={20} className="dark:text-white" />
            </button>
        ) : null}
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTool ? tools.find(t => t.id === activeTool)?.name : 'Ferramentas Extra'}
            </h1>
            {!activeTool && <p className="text-gray-500 dark:text-gray-400">Utilitários para a vida escolar</p>}
        </div>
      </header>

      {!activeTool ? (
          <div className="grid grid-cols-2 gap-4">
              {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="flex flex-col items-center justify-center p-6 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:scale-[1.02] transition-transform"
                  >
                      <div className={`p-4 rounded-full ${tool.color} text-white mb-3 shadow-md`}>
                          <tool.icon size={28} />
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{tool.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{tool.desc}</p>
                  </button>
              ))}
          </div>
      ) : (
          <div className="animate-slide-up">
              {renderToolContent()}
          </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS FOR EACH TOOL ---

const FlashcardTool: React.FC<{data: AppData, setData: any}> = ({data, setData}) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

    const addCard = () => {
        if (!front || !back) return;
        const newCard: Flashcard = {
            id: Date.now().toString(),
            front,
            back,
            subjectId: 'GEN'
        };
        setData((prev: AppData) => ({...prev, flashcards: [newCard, ...(prev.flashcards || [])]}));
        setFront('');
        setBack('');
    };

    const deleteCard = (id: string) => {
        setData((prev: AppData) => ({...prev, flashcards: prev.flashcards.filter(f => f.id !== id)}));
    };

    return (
        <div className="space-y-4">
            <Card title="Novo Flashcard">
                <div className="space-y-3">
                    <input value={front} onChange={e => setFront(e.target.value)} placeholder="Frente (Pergunta)" className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <input value={back} onChange={e => setBack(e.target.value)} placeholder="Verso (Resposta)" className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <button onClick={addCard} className="w-full bg-purple-500 text-white py-2 rounded font-bold">Criar</button>
                </div>
            </Card>
            <div className="grid grid-cols-1 gap-4">
                {(data.flashcards || []).map(card => (
                    <div 
                        key={card.id} 
                        onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}
                        className="h-40 perspective cursor-pointer group relative"
                    >
                        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d bg-white dark:bg-dark-card border dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-center text-center p-4 ${flippedCardId === card.id ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className={`absolute w-full h-full backface-hidden flex items-center justify-center ${flippedCardId === card.id ? 'invisible' : 'visible'}`}>
                                <div>
                                    <span className="text-xs text-purple-500 font-bold uppercase mb-2 block">Pergunta</span>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{card.front}</h3>
                                </div>
                            </div>
                             {/* Back */}
                            <div className={`absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center ${flippedCardId === card.id ? 'visible' : 'invisible'}`}>
                                <div>
                                    <span className="text-xs text-green-500 font-bold uppercase mb-2 block">Resposta</span>
                                    <p className="text-gray-800 dark:text-white">{card.back}</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                            className="absolute top-2 right-2 z-10 p-2 text-gray-300 hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {(data.flashcards || []).length === 0 && <p className="text-center text-gray-400 mt-10">Sem cartões criados.</p>}
            </div>
        </div>
    );
};

const ScratchpadTool: React.FC<{data: AppData, setData: any}> = ({data, setData}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx && data.scratchpadData) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = data.scratchpadData;
            }
            // Set canvas size based on container
            canvas.width = canvas.offsetWidth;
            canvas.height = 400;
            
            // Re-draw if image existed because resize clears it
            if (ctx && data.scratchpadData) {
                 const img = new Image();
                 img.onload = () => ctx.drawImage(img, 0, 0);
                 img.src = data.scratchpadData;
            }
        }
    }, []);

    const startDrawing = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#fff' : '#000';
        ctx.lineCap = 'round';
        setIsDrawing(true);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        saveCanvas();
    };

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            setData((prev: AppData) => ({...prev, scratchpadData: canvas.toDataURL()}));
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setData((prev: AppData) => ({...prev, scratchpadData: ''}));
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500">Desenhe com o dedo ou rato.</p>
                <button onClick={clearCanvas} className="flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                    <Eraser size={12} className="mr-1" /> Limpar
                </button>
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 touch-none cursor-crosshair shadow-inner"
                style={{ height: '400px' }}
            />
        </div>
    );
};

const QuestionsTool: React.FC<{data: AppData, setData: any}> = ({data, setData}) => {
    const [text, setText] = useState('');

    const addQuestion = () => {
        if (!text.trim()) return;
        const newItem: Question = { id: Date.now().toString(), text, subjectId: 'GEN', isAnswered: false };
        setData((prev: AppData) => ({...prev, questions: [newItem, ...(prev.questions || [])]}));
        setText('');
    };

    const toggleAnswered = (id: string) => {
        setData((prev: AppData) => ({
            ...prev,
            questions: prev.questions.map(q => q.id === id ? {...q, isAnswered: !q.isAnswered} : q)
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder="Escreva a sua dúvida..." 
                    className="flex-1 p-3 rounded-lg border dark:bg-dark-card dark:border-gray-700 dark:text-white"
                />
                <button onClick={addQuestion} className="bg-orange-500 text-white p-3 rounded-lg"><Plus /></button>
            </div>
            <div className="space-y-2">
                {(data.questions || []).map(q => (
                    <div key={q.id} className={`p-3 rounded-lg border flex items-center ${q.isAnswered ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 'bg-white dark:bg-dark-card'}`}>
                        <button onClick={() => toggleAnswered(q.id)} className={`mr-3 ${q.isAnswered ? 'text-green-500' : 'text-gray-300'}`}>
                            <CheckCircle2 />
                        </button>
                        <span className={`flex-1 ${q.isAnswered ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>{q.text}</span>
                        <button onClick={() => setData((p: AppData) => ({...p, questions: p.questions.filter(x => x.id !== q.id)}))} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FormulasTool: React.FC = () => {
    const formulas = [
        { title: 'Bhaskara', content: 'x = (-b ± √(b² - 4ac)) / 2a' },
        { title: 'Pitágoras', content: 'a² = b² + c²' },
        { title: 'Área Círculo', content: 'A = π . r²' },
        { title: 'Velocidade Média', content: 'Vm = ΔS / Δt' },
        { title: 'Força (Newton)', content: 'F = m . a' },
        { title: 'Oração', content: 'Sujeito + Verbo + Complemento' },
    ];

    return (
        <div className="grid grid-cols-1 gap-3">
            {formulas.map((f, i) => (
                <div key={i} className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg">
                    <h4 className="font-bold text-teal-700 dark:text-teal-300 text-sm mb-1">{f.title}</h4>
                    <p className="font-mono text-lg text-gray-800 dark:text-gray-200">{f.content}</p>
                </div>
            ))}
        </div>
    );
};

const EventsTool: React.FC<{data: AppData, setData: any}> = ({data, setData}) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');

    const addEvent = () => {
        if (!title || !date) return;
        const newEvent: SchoolEvent = { id: Date.now().toString(), title, date, type: 'OTHER' };
        setData((prev: AppData) => ({...prev, schoolEvents: [...(prev.schoolEvents || []), newEvent].sort((a, b) => a.date.localeCompare(b.date))}));
        setTitle('');
        setDate('');
    };

    return (
        <div className="space-y-4">
            <Card title="Novo Evento">
                <div className="flex gap-2 flex-col sm:flex-row">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Evento (ex: Feriado)" className="flex-1 p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <button onClick={addEvent} className="bg-red-500 text-white py-2 px-4 rounded font-bold">Adicionar</button>
                </div>
            </Card>
            <div className="space-y-2">
                {(data.schoolEvents || []).map(ev => (
                    <div key={ev.id} className="flex items-center p-3 bg-white dark:bg-dark-card border rounded-lg">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg mr-3 text-center min-w-[50px]">
                            <span className="block text-xs font-bold">{format(new Date(ev.date), 'MMM')}</span>
                            <span className="block text-lg font-bold leading-none">{format(new Date(ev.date), 'dd')}</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white">{ev.title}</h4>
                            <p className="text-xs text-gray-500">{format(new Date(ev.date), 'EEEE', { })}</p>
                        </div>
                        <button onClick={() => setData((p: AppData) => ({...p, schoolEvents: p.schoolEvents.filter(x => x.id !== ev.id)}))} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {(data.schoolEvents || []).length === 0 && <p className="text-center text-gray-400">Nenhum evento agendado.</p>}
            </div>
        </div>
    );
};

const ContactsTool: React.FC<{data: AppData, setData: any}> = ({data, setData}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');

    const addContact = () => {
        if (!name || !phone) return;
        const newContact: Contact = { id: Date.now().toString(), name, phone, role: role || 'Estudante' };
        setData((prev: AppData) => ({...prev, contacts: [newContact, ...(prev.contacts || [])]}));
        setName('');
        setPhone('');
        setRole('');
    };

    return (
        <div className="space-y-4">
             <Card title="Adicionar Contacto">
                <div className="space-y-2">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    <div className="flex gap-2">
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefone" className="flex-1 p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                        <input value={role} onChange={e => setRole(e.target.value)} placeholder="Cargo (opcional)" className="flex-1 p-2 rounded border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                    </div>
                    <button onClick={addContact} className="w-full bg-indigo-500 text-white py-2 rounded font-bold">Guardar</button>
                </div>
            </Card>
            <div className="grid grid-cols-1 gap-2">
                {(data.contacts || []).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-white dark:bg-dark-card border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4>
                                <p className="text-xs text-indigo-500">{c.role}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <a href={`tel:${c.phone}`} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{c.phone}</a>
                             <button onClick={() => setData((p: AppData) => ({...p, contacts: p.contacts.filter(x => x.id !== c.id)}))} className="text-xs text-red-400 hover:underline">Remover</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
