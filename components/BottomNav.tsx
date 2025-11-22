import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Book, LayoutGrid, PieChart } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', icon: Home, label: 'Hoje' },
    { path: '/timetable', icon: Calendar, label: 'Horário' },
    { path: '/subjects', icon: Book, label: 'Aulas' },
    { path: '/tools', icon: LayoutGrid, label: 'Extra' }, // Changed from Tasks to Tools
    { path: '/stats', icon: PieChart, label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full md:max-w-2xl bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
