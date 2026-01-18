import React from "react";
import { Flame, Trophy, Sparkles, Zap } from "lucide-react";
import type { Language } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface DailyProgressProps {
  stats: { done: number; remaining: number; progress: number };
  nativeLang: Language;
  onStartMixed: () => void;
  onStartNew: () => void;
  hasNewCards: boolean;
}

export const DailyProgress: React.FC<DailyProgressProps> = ({
  stats,
  nativeLang,
  onStartMixed,
  onStartNew,
  hasNewCards,
}) => {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-6 shadow-sm overflow-hidden relative group transition-colors">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none text-gray-900 dark:text-white">
        <Trophy size={140} />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={364.4}
              strokeDashoffset={364.4 - (364.4 * stats.progress) / 100}
              strokeLinecap="round"
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {stats.progress}%
            </span>
            <span className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-tighter">
              Objectif
            </span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Flame
              size={20}
              className="text-orange-500 fill-orange-500 animate-pulse"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {nativeLang === "fr" ? "Progression du jour" : "Progreso de hoy"}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto md:mx-0">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.done}
              </div>
              <div className="text-[10px] font-bold text-emerald-700/60 dark:text-emerald-400/60 uppercase">
                {nativeLang === "fr" ? "Complétées" : "Completadas"}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-900/50">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.remaining}
              </div>
              <div className="text-[10px] font-bold text-indigo-700/60 dark:text-indigo-400/60 uppercase">
                {nativeLang === "fr" ? "Restantes" : "Restantes"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button
            onClick={onStartMixed}
            disabled={stats.remaining === 0}
            className="h-12 px-8 font-bold rounded-2xl shadow-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 group relative overflow-hidden"
          >
            <Zap size={18} className="mr-2 fill-yellow-400 text-yellow-400" />
            {nativeLang === "fr" ? "Réviser Tout" : "Repasar Todo"}
          </Button>
          <Button
            variant="outline"
            onClick={onStartNew}
            disabled={!hasNewCards}
            className="h-12 px-8 font-bold rounded-2xl border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 dark:bg-gray-800"
          >
            <Sparkles size={18} className="mr-2" />
            {nativeLang === "fr" ? "Apprendre Nouvelles" : "Aprender Nuevas"}
          </Button>
        </div>
      </div>
    </section>
  );
};
