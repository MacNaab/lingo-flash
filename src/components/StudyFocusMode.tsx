import React from "react";
import {
  Volume2,
  RotateCcw,
  Check,
  Sparkles,
  X,
  X as CloseIcon,
} from "lucide-react";
import type { Flashcard, Language } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudyFocusModeProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onClose: () => void;
  onRate: (q: number) => void;
  onSpeak: (t: string, l: Language) => void;
  nativeLang: Language;
  targetLang: Language;
  isOffline: boolean;
}

export const StudyFocusMode: React.FC<StudyFocusModeProps> = ({
  card,
  isFlipped,
  onFlip,
  onClose,
  onRate,
  onSpeak,
  nativeLang,
  targetLang,
  isOffline,
}) => {
  return (
    <div className="fixed inset-0 z-250 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <CloseIcon size={24} />
        </button>
        <div
          className={`relative w-full aspect-4/3 perspective-1000 ${isFlipped ? "flipped" : ""}`}
          onClick={onFlip}
        >
          <div className="flashcard-inner relative w-full h-full text-center transform-style-3d cursor-pointer">
            <div className="flashcard-front absolute inset-0 w-full h-full bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12">
              <Badge
                variant="outline"
                className="text-xs uppercase tracking-[0.4em] border-indigo-100 dark:border-indigo-900 text-indigo-400 font-black mb-10"
              >
                {nativeLang === "fr" ? "FRANÇAIS" : "ESPAÑOL"}
              </Badge>
              <div className="overflow-hidden">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {card[nativeLang]}
                </h2>
              </div>
            </div>
            <div className="flashcard-back absolute inset-0 w-full h-full bg-indigo-600 dark:bg-indigo-900 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12">
              <Badge
                variant="secondary"
                className="text-xs uppercase tracking-[0.4em] bg-white/10 text-white border-none font-black mb-10"
              >
                {targetLang === "fr" ? "FRANÇAIS" : "ESPAÑOL"}
              </Badge>
              <div className="overflow-hidden">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight animate-in fade-in slide-in-from-top-4 duration-700">
                  {card[targetLang]}
                </h2>
              </div>
              <div className="mt-12 flex gap-4">
                <Button
                  disabled={isOffline}
                  variant="secondary"
                  className="rounded-full w-16 h-16 bg-white/10 hover:bg-white/20 border-none group"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onSpeak(card[targetLang], targetLang);
                  }}
                >
                  <Volume2
                    size={32}
                    className="text-white group-hover:scale-110 transition-transform"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`mt-10 grid grid-cols-4 gap-4 transition-all duration-300 ${isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          {[
            { q: 1, icon: RotateCcw, color: "red", label: "Revoir" },
            { q: 3, icon: X, color: "yellow", label: "Dur" },
            { q: 4, icon: Check, color: "indigo", label: "Bien" },
            { q: 5, icon: Sparkles, color: "emerald", label: "Facile" },
          ].map((b) => (
            <button
              key={b.q}
              onClick={() => onRate(b.q)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-${b.color}-500/20 border border-${b.color}-500/30 flex items-center justify-center text-${b.color}-500 group-hover:bg-${b.color}-500 group-hover:text-white transition-all`}
              >
                <b.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-white/60 uppercase">
                {b.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
