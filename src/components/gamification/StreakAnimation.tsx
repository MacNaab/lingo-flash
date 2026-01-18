import React, { useEffect, useState } from 'react';
import { Flame, Snowflake, ShieldAlert } from 'lucide-react';
import type { GamificationStatus } from '../../lib/types';

interface StreakAnimationProps {
  type: GamificationStatus | 'extinguish';
  onComplete: () => void;
}

export const StreakAnimation: React.FC<StreakAnimationProps> = ({ type, onComplete }) => {
  const [stage, setStage] = useState<'enter' | 'animate' | 'exit'>('enter');

  useEffect(() => {
    // Sequence: Enter (0ms) -> Animate (500ms) -> Exit (2500ms) -> Complete (3000ms)
    const t1 = setTimeout(() => setStage('animate'), 100);
    const t2 = setTimeout(() => setStage('exit'), 2500);
    const t3 = setTimeout(onComplete, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const getContent = () => {
    switch (type) {
      case 'flame':
        return {
          icon: <Flame className="w-24 h-24 text-orange-500 fill-orange-500 animate-bounce" />,
          title: "Série maintenue !",
          desc: "Une nouvelle flamme s'ajoute à votre collection.",
          color: "bg-orange-500"
        };
      case 'freeze':
        return {
          icon: <Snowflake className="w-24 h-24 text-blue-400 animate-pulse" />,
          title: "Mode Glaçon activé !",
          desc: "Vous avez manqué hier, mais votre série est gelée.",
          color: "bg-blue-400"
        };
      case 'extinguish':
        return {
          icon: <ShieldAlert className="w-24 h-24 text-gray-500" />,
          title: "Série perdue...",
          desc: "Plus de 2 jours d'absence. La flamme s'est éteinte.",
          color: "bg-gray-500"
        };
      default:
        return { icon: null, title: "", desc: "", color: "" };
    }
  };

  const content = getContent();

  if (!content.icon) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-500 ${stage === 'enter' ? 'opacity-0' : stage === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm mx-4 transform transition-transform duration-500 scale-100">
        <div className={`mx-auto w-32 h-32 rounded-full ${content.color}/10 flex items-center justify-center mb-6`}>
          {content.icon}
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{content.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{content.desc}</p>
      </div>
    </div>
  );
};
