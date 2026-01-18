import React from 'react';
import { Flame } from 'lucide-react';

interface StreakDisplayProps {
  streak: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-full font-medium text-sm border border-orange-200 dark:border-orange-900/50">
      <Flame className="w-4 h-4 fill-orange-500" />
      <span>{streak}</span>
    </div>
  );
};
