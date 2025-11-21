
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Simple alert or logic when timer ends could go here
      // For now we just stop.
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'FOCUS' | 'BREAK') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'FOCUS' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-inner relative overflow-hidden">
      {/* Background Progress */}
      <div 
        className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${mode === 'FOCUS' ? 'bg-primary' : 'bg-green-500'}`}
        style={{ width: `${progress}%` }}
      />

      <div className="flex justify-center space-x-4 mb-4">
        <button 
          onClick={() => switchMode('FOCUS')}
          className={`flex items-center text-xs font-bold px-3 py-1 rounded-full transition-colors ${mode === 'FOCUS' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          <Brain size={12} className="mr-1" /> Foco (25m)
        </button>
        <button 
          onClick={() => switchMode('BREAK')}
          className={`flex items-center text-xs font-bold px-3 py-1 rounded-full transition-colors ${mode === 'BREAK' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          <Coffee size={12} className="mr-1" /> Pausa (5m)
        </button>
      </div>

      <div className="text-center mb-4">
        <span className="text-5xl font-mono font-bold tracking-wider">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex justify-center space-x-3">
        <button 
          onClick={toggleTimer}
          className="w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};
