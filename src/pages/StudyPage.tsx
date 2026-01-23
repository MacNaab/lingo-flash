import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Volume2,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Brain,
  ListChecks,
  ArrowLeftRight,
} from "lucide-react";
import type { Flashcard, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface StudyPageProps {
  studyCards: Flashcard[];
  allCards: Flashcard[];
  nativeLang: Language;
  targetLang: Language;
  isOffline: boolean;
  onClose: () => void;
  onRate: (quality: number) => void;
  onSpeak: (text: string, lang: Language) => void;
  currentCardIndex: number;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
  isAnimating: boolean;
}

export const StudyPage: React.FC<StudyPageProps> = ({
  studyCards,
  allCards,
  nativeLang,
  targetLang,
  isOffline,
  onClose,
  onRate,
  onSpeak,
  currentCardIndex,
  isFlipped,
  setIsFlipped,
  isAnimating,
}) => {
  const [feedback, setFeedback] = useState<{ type: number; visible: boolean }>({
    type: 0,
    visible: false,
  });
  const [studyMode, setStudyMode] = useState<"flashcard" | "quiz">("flashcard");
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(
    null,
  );
  const [quizResult, setQuizResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [shouldInvert, setShouldInvert] = useState(false);

  const displayCard = studyCards[currentCardIndex];

  // Déterminer si on inverse la carte (seulement si Maîtrisé, une fois sur deux)
  useEffect(() => {
    if (displayCard) {
      const isMastered = displayCard.status === "mastered";
      // On tire au sort si on inverse pour les cartes maîtrisées
      setShouldInvert(isMastered && Math.random() < 0.5);
    }
  }, [displayCard, displayCard.id]);

  const currentFrontLang = shouldInvert ? targetLang : nativeLang;
  const currentBackLang = shouldInvert ? nativeLang : targetLang;

  // Générer les options du quiz quand la carte change
  useEffect(() => {
    if (displayCard && studyMode === "quiz") {
      /*
      const correctAnswer = displayCard[currentBackLang];
      const otherCards = allCards.filter((c) => c.id !== displayCard.id);

      const distractors = [...otherCards]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((c) => c[currentBackLang]);

      const options = [...distractors, correctAnswer].sort(
        () => 0.5 - Math.random(),
      );
      */
      const generateQuizOptions = () => {
        const correctAnswer = displayCard[currentBackLang];
        const displayCardFolder = displayCard.folderId;
        const folderCards = allCards.filter(
          (c) => c.folderId === displayCardFolder,
        );

        if (folderCards.length < 4) {
          const options = folderCards.map((c) => c[currentBackLang]);
          const remainingCards = allCards.filter(
            (c) => c.folderId !== displayCardFolder,
          );
          const distractors = remainingCards
            .slice(0, 4 - options.length)
            .map((c) => c[currentBackLang]);
          return [...options, ...distractors, correctAnswer].sort(
            () => 0.5 - Math.random(),
          );
        } else {
          const distractors = folderCards
            .filter((c) => c.id !== displayCard.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((c) => c[currentBackLang]);
          return [...distractors, correctAnswer].sort(
            () => 0.5 - Math.random(),
          );
        }
      };

      const options = generateQuizOptions();
      setQuizOptions(options);
      setSelectedQuizOption(null);
      setQuizResult(null);
    }
  }, [displayCard, studyMode, allCards, currentBackLang]);

  if (!displayCard)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 bg-white dark:bg-gray-950 rounded-[3rem]">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {nativeLang === "fr" ? "Session terminée !" : "¡Sesión terminada!"}
        </h2>
        <p className="text-gray-500 mb-8">
          {nativeLang === "fr"
            ? "Excellent travail de mémorisation."
            : "Excelente trabajo de memorización."}
        </p>
        <Button
          onClick={onClose}
          size="lg"
          className="px-10 font-bold rounded-2xl h-14"
        >
          Retour à l'accueil
        </Button>
      </div>
    );

  const handleRateAction = (quality: number) => {
    setFeedback({ type: quality, visible: true });
    setTimeout(() => {
      onRate(quality);
      setFeedback({ type: 0, visible: false });
    }, 250);
  };

  const handleQuizChoice = (choice: string) => {
    if (quizResult) return;
    setSelectedQuizOption(choice);
    const isCorrect = choice === displayCard[currentBackLang];
    setQuizResult(isCorrect ? "correct" : "wrong");

    setTimeout(() => {
      handleRateAction(isCorrect ? 4 : 1);
    }, 1800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          onClick={onClose}
          size="sm"
          className="font-bold dark:text-gray-300"
        >
          <ChevronLeft size={16} className="mr-1" />{" "}
          {nativeLang === "fr" ? "Quitter" : "Salir"}
        </Button>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setStudyMode("flashcard")}
            className={`px-3 py-1.5 cursor-pointer rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${studyMode === "flashcard" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}
          >
            <Brain size={12} /> {nativeLang === "fr" ? "Cartes" : "Cartas"}
          </button>
          <button
            onClick={() => setStudyMode("quiz")}
            className={`px-3 py-1.5 cursor-pointer rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${studyMode === "quiz" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}
          >
            <ListChecks size={12} /> Quiz
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Badge
            variant="secondary"
            className="px-3 py-1 font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest"
          >
            {currentCardIndex + 1}/{studyCards.length}
          </Badge>
        </div>
      </div>

      <Progress
        value={((currentCardIndex + 1) / studyCards.length) * 100}
        className="dark:bg-gray-800"
      />

      {studyMode === "flashcard" ? (
        <>
          <div
            className={`relative w-full h-80 perspective-1000 ${isFlipped ? "flipped" : ""} ${isAnimating ? "animate-card-exit" : "animate-card-enter"}`}
            onClick={() => !feedback.visible && setIsFlipped(!isFlipped)}
          >
            <div
              className={`flashcard-inner relative w-full h-full text-center transition-all duration-200 ${feedback.visible ? "ring-4 ring-indigo-500" : ""}`}
            >
              <div className="flashcard-front absolute inset-0 w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-10 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-6">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-[0.3em] font-black border-indigo-100 dark:border-indigo-900 ${shouldInvert ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}
                  >
                    {currentFrontLang === "fr" ? "FRANÇAIS" : "ESPAÑOL"}
                  </Badge>
                  {shouldInvert && (
                    <ArrowLeftRight
                      size={12}
                      className="text-indigo-400 animate-pulse"
                    />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {displayCard[currentFrontLang]}
                </h2>
                <p className="mt-4 text-xs text-gray-400 font-medium">
                  {nativeLang === "fr"
                    ? "Appuyez pour voir la traduction"
                    : "Pulsa para ver la traducción"}
                </p>
              </div>

              <div className="flashcard-back absolute inset-0 w-full h-full bg-indigo-50 dark:bg-indigo-950 rounded-3xl shadow-xl flex flex-col items-center justify-center p-10 border-2 border-indigo-100 dark:border-indigo-900">
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 font-black mb-6 bg-white dark:bg-gray-900"
                >
                  {currentBackLang === "fr" ? "FRANÇAIS" : "ESPAÑOL"}
                </Badge>
                <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 leading-tight">
                  {displayCard[currentBackLang]}
                </h2>
                <div className="flex gap-4 mt-8">
                  <Button
                    disabled={isOffline}
                    variant="secondary"
                    size="icon"
                    className="rounded-full w-14 h-14 bg-white dark:bg-gray-800 shadow-md hover:scale-110 transition-transform"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(e: any) => {
                      e.stopPropagation();
                      onSpeak(displayCard[targetLang], targetLang);
                    }}
                  >
                    <Volume2
                      size={24}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-300 ${isFlipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            <Button
              variant="destructive"
              className="flex-col h-20 shadow-md rounded-2xl"
              onClick={() => handleRateAction(1)}
            >
              <RotateCcw size={18} />
              <span className="text-[9px] mt-1 uppercase font-black">
                {nativeLang === "fr" ? "Revoir" : "Repetir"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-20 border-amber-500 text-amber-600 dark:text-amber-400 dark:border-amber-900 shadow-md rounded-2xl"
              onClick={() => handleRateAction(3)}
            >
              <X size={18} />
              <span className="text-[9px] mt-1 uppercase font-black">
                {nativeLang === "fr" ? "Dur" : "Difícil"}
              </span>
            </Button>
            <Button
              className="flex-col h-20 font-bold shadow-md bg-indigo-600 rounded-2xl"
              onClick={() => handleRateAction(4)}
            >
              <Check size={18} />
              <span className="text-[9px] mt-1 uppercase font-black">
                {nativeLang === "fr" ? "Bien" : "Bien"}
              </span>
            </Button>
            <Button
              className="flex-col h-20 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md rounded-2xl"
              onClick={() => handleRateAction(5)}
            >
              <Sparkles size={18} />
              <span className="text-[9px] mt-1 uppercase font-black">
                {nativeLang === "fr" ? "Facile" : "Fácil"}
              </span>
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 text-center shadow-sm relative">
            {shouldInvert && (
              <div className="absolute top-4 right-4">
                <ArrowLeftRight size={14} className="text-indigo-400" />
              </div>
            )}
            <Badge
              variant="outline"
              className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-4 border-gray-200 dark:border-gray-800"
            >
              {currentFrontLang === "fr" ? "FRANÇAIS" : "ESPAÑOL"}
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {displayCard[currentFrontLang]}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {quizOptions.map((option, idx) => {
              const isSelected = selectedQuizOption === option;
              const isCorrect = option === displayCard[currentBackLang];
              let btnClass =
                "h-16 flex items-center justify-between px-6 rounded-2xl text-base font-bold transition-all border-2 ";

              if (quizResult) {
                if (isCorrect)
                  btnClass +=
                    "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ";
                else if (isSelected)
                  btnClass +=
                    "bg-red-50 border-red-500 text-red-700 dark:bg-red-950 dark:text-red-300 ";
                else
                  btnClass +=
                    "opacity-50 border-gray-100 dark:border-gray-800 ";
              } else {
                btnClass +=
                  "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 ";
              }

              return (
                <button
                  key={idx}
                  disabled={!!quizResult}
                  onClick={() => handleQuizChoice(option)}
                  className={btnClass}
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mr-4 text-xs text-gray-400 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="truncate">{option}</span>
                  <span>
                    {quizResult && isCorrect && (
                      <Check size={20} className="ml-auto text-emerald-500" />
                    )}
                    {quizResult && isSelected && !isCorrect && (
                      <X size={20} className="ml-auto text-red-500" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              disabled={isOffline}
              variant="ghost"
              className="rounded-full text-gray-400 hover:text-indigo-600"
              onClick={() => {
                const textToSpeak = quizOptions
                  .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
                  .join(". ");
                onSpeak(textToSpeak, targetLang);
              }}
            >
              <Volume2 size={20} className="mr-2" />
              {nativeLang === "fr"
                ? "Écouter les options"
                : "Escuchar las opciones"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
