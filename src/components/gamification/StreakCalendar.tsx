import React from 'react';
import { Flame, Snowflake, X } from 'lucide-react';
import type { GamificationDay } from '../../lib/types';

interface StreakCalendarProps {
  history: GamificationDay[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ history }) => {
  // Generate last 30 days for grid
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const getStatus = (date: string) => {
    const entry = history.find(h => h.date === date);
    return entry?.status;
  };

  const renderIcon = (status: string | undefined) => {
    switch (status) {
      case 'flame':
        return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case 'freeze':
        return <Snowflake className="w-5 h-5 text-blue-400" />;
      case 'missed': // Implicitly handled if we record 'missed'
        return <X className="w-5 h-5 text-gray-300" />;
      default:
        // No activity recorded or 'missed' naturally
        return <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800" />;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Historique d'activité</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const status = getStatus(date);
          const dayNum = new Date(date).getDate();
          return (
            <div key={date} className="flex flex-col items-center gap-1" title={status ? `${status} - ${new Date(date).toLocaleDateString()}` : new Date(date).toLocaleDateString()}>
               <div className={`w-8 h-8 flex items-center justify-center rounded-full ${status ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
                 {renderIcon(status)}
               </div>
               <span className="text-[10px] text-gray-400">{dayNum}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
