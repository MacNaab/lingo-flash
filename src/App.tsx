/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  BarChart2,
  Settings,
  Library,
  CheckCircle2,
} from "lucide-react";
import type { Folder, Flashcard, Language } from "@/lib/types";
import { getAllItems, saveItem, deleteItem, initDB } from "@/lib/db";
import { defaultFolders, defaultCards } from "@/lib/initialData";

// Modules refactorisés
import { HomePage } from "./pages/HomePage";
import { StudyPage } from "./pages/StudyPage";
import { StatsPage } from "./pages/StatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CardsPage } from "./pages/CardsPage";
import { useGamification } from "./hooks/useGamification";
import { StreakAnimation } from "./components/gamification/StreakAnimation";

const App: React.FC = () => {
  const [nativeLang, setNativeLang] = useState<Language>("fr");
  const [targetLang, setTargetLang] = useState<Language>("es");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeTab, setActiveTab] = useState<
    "home" | "study" | "stats" | "settings" | "cards"
  >("home");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("lingo-theme") as "light" | "dark") || "light";
  });

  // États de notification
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  // États d'étude
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Gamification
  const { streak, showAnimation, history: streakHistory, clearAnimation } = useGamification();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("lingo-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    const loadData = async () => {
      await initDB();
      const storedFolders = await getAllItems<Folder>("folders");
      const storedCards = await getAllItems<Flashcard>("flashcards");
      const storedSettings = await getAllItems<any>("settings");

      const langSetting = storedSettings.find(
        (s: any) => s.key === "nativeLang",
      );
      if (langSetting) {
        setNativeLang(langSetting.value as Language);
        setTargetLang(langSetting.value === "fr" ? "es" : "fr");
      }

      if (storedFolders.length === 0) {
        for (const f of defaultFolders) await saveItem("folders", f);
        for (const c of defaultCards) await saveItem("flashcards", c);
        setFolders(defaultFolders);
        setCards(defaultCards);
      } else {
        setFolders(storedFolders);
        setCards(storedCards);
      }
    };
    loadData();

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleSpeak = (text: string, lang: Language) => {
    if (isOffline) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "fr" ? "fr-FR" : "es-ES";
    window.speechSynthesis.speak(utterance);
  };

  const handleAddFolder = async (folderData: Omit<Folder, "id">) => {
    const newFolder: Folder = { ...folderData, id: `f-${Date.now()}` };
    await saveItem("folders", newFolder);
    setFolders((prev) => [...prev, newFolder]);
    showToast(
      nativeLang === "fr" ? "📁 Dossier créé !" : "📁 ¡Carpeta creada!",
    );
  };

  const handleDeleteFolder = async (folderId: string) => {
    const getFolderIdsToDelete = (
      id: string,
      allFolders: Folder[],
    ): string[] => {
      let ids = [id];
      const children = allFolders.filter((f) => f.parentId === id);
      for (const child of children)
        ids = [...ids, ...getFolderIdsToDelete(child.id, allFolders)];
      return ids;
    };

    const folderIdsToDelete = getFolderIdsToDelete(folderId, folders);
    const fallbackFolder = folders.find(
      (f) => !folderIdsToDelete.includes(f.id),
    );
    if (!fallbackFolder) return;

    const updatedCards = cards.map((card) => {
      if (folderIdsToDelete.includes(card.folderId)) {
        const newCard = { ...card, folderId: fallbackFolder.id };
        saveItem("flashcards", newCard);
        return newCard;
      }
      return card;
    });

    for (const id of folderIdsToDelete) await deleteItem("folders", id);
    setCards(updatedCards);
    setFolders((prev) => prev.filter((f) => !folderIdsToDelete.includes(f.id)));
    showToast(
      nativeLang === "fr" ? "🗑️ Dossier supprimé" : "🗑️ Carpeta eliminada",
    );
  };

  const handleAddCard = async (cardData: Partial<Flashcard>) => {
    const newCard: Flashcard = {
      id: `c-${Date.now()}`,
      folderId: cardData.folderId || folders[0]?.id || "1",
      fr: cardData.fr || "",
      es: cardData.es || "",
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      repetition: 0,
      status: "new",
    };
    await saveItem("flashcards", newCard);
    setCards((prev) => [newCard, ...prev]);
    showToast(
      nativeLang === "fr" ? "✨ Carte ajoutée !" : "✨ ¡Tarjeta añadida!",
    );
  };

  const handleUpdateCard = async (updatedCard: Flashcard) => {
    await saveItem("flashcards", updatedCard);
    setCards((prev) =>
      prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
    );
    showToast(nativeLang === "fr" ? "📝 Mis à jour !" : "📝 ¡Actualizado!");
  };

  const handleDeleteCard = async (id: string) => {
    await deleteItem("flashcards", id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    showToast(nativeLang === "fr" ? "🗑️ Supprimée" : "🗑️ Eliminada");
  };

  const startStudy = (
    folder: Folder | null,
    onlyDue: boolean,
    mode?: "new" | "review" | "mixed",
  ) => {
    const now = Date.now() + 65000;
    let folderIds: string[] = [];

    if (folder) {
      const getSubfolderIds = (id: string, allFolders: Folder[]): string[] => {
        let ids = [id];
        const children = allFolders.filter((f) => f.parentId === id);
        for (const child of children)
          ids = [...ids, ...getSubfolderIds(child.id, allFolders)];
        return ids;
      };
      folderIds = getSubfolderIds(folder.id, folders);
    }

    let filtered = folder
      ? cards.filter((c) => folderIds.includes(c.folderId))
      : [...cards];

    if (onlyDue) {
      filtered = filtered.filter((c) => c.nextReview <= now);
      if (mode === "new") filtered = filtered.filter((c) => c.status === "new");
      else if (mode === "review")
        filtered = filtered.filter((c) => c.status !== "new");
    }

    if (filtered.length === 0) {
      showToast(
        nativeLang === "fr"
          ? "Rien à réviser ici !"
          : "¡Nada que repasar aquí!",
      );
      return;
    }

    const sorted = filtered.sort((a, b) => {
      const order = { learning: 0, review: 1, new: 2, mastered: 3 };
      if (a.status !== b.status)
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      return a.nextReview - b.nextReview;
    });

    setStudyCards(sorted);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setActiveTab("study");
  };

  const handleRating = async (quality: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const card = studyCards[currentCardIndex];
    // eslint-disable-next-line prefer-const
    let { interval, easeFactor, repetition, status } = card;

    if (quality === 1) easeFactor = Math.max(1.3, easeFactor - 0.2);
    else if (quality === 3) easeFactor = Math.max(1.3, easeFactor - 0.15);
    else if (quality === 5) easeFactor = Math.min(3.0, easeFactor + 0.15);

    let newInterval = 0;
    let newStatus = status;

    if (quality === 1) {
      repetition = 0;
      newInterval = 0;
      newStatus = "learning";
    } else {
      if (repetition === 0) {
        newInterval = quality === 5 ? 4 : 1;
        newStatus = quality === 5 ? "mastered" : "review";
      } else if (repetition === 1) {
        newInterval = 6;
        newStatus = "review";
      } else {
        const modifier = quality === 3 ? 1.2 : quality === 5 ? 1.3 : 1.0;
        newInterval = Math.ceil(interval * easeFactor * modifier);
        newStatus = quality === 5 ? "mastered" : "review";
      }
      repetition++;
    }

    const nextReviewDate = new Date();
    if (newInterval === 0)
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
    else {
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
      nextReviewDate.setHours(4, 0, 0, 0);
    }

    const updatedCard: Flashcard = {
      ...card,
      interval: newInterval,
      easeFactor,
      repetition,
      nextReview: nextReviewDate.getTime(),
      status: newStatus as any,
    };

    await saveItem("flashcards", updatedCard);
    setCards((prev) => prev.map((c) => (c.id === card.id ? updatedCard : c)));

    setTimeout(() => {
      const nextIndex = currentCardIndex + 1;

      // Si la réponse était fausse (revoir), on remet la carte à la fin de la file d'attente locale
      if (quality === 1) {
        setStudyCards((prev) => {
          const updated = [...prev];
          updated.push(updatedCard);
          return updated;
        });
      }

      if (nextIndex < studyCards.length || quality === 1) {
        setCurrentCardIndex(nextIndex);
        setIsFlipped(false);
        setIsAnimating(false);
      } else {
        setActiveTab("home");
        setIsAnimating(false);
      }
    }, 600);
  };

  const toggleNativeLang = async () => {
    const newLang = nativeLang === "fr" ? "es" : "fr";
    setNativeLang(newLang);
    setTargetLang(newLang === "fr" ? "es" : "fr");
    await saveItem("settings", { key: "nativeLang", value: newLang });
  };

  const handleResetApp = async () => {
    const deleteRequest = indexedDB.deleteDatabase("LingoFlashDB");
    deleteRequest.onsuccess = () => {
      window.location.reload();
    };
    deleteRequest.onerror = () => {
      alert("Erreur lors de la suppression de la base de données.");
    };
    deleteRequest.onblocked = () => {
      alert(
        "Veuillez fermer les autres onglets de l'application pour réinitialiser.",
      );
    };
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-screen pb-28 md:pb-8 pt-6 md:pt-12 px-4 md:px-8 mx-auto flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {showAnimation && (
        <StreakAnimation type={showAnimation} onComplete={clearAnimation} />
      )}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-200 transition-all duration-500 transform ${toast.visible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"}`}
      >
        <div className="bg-gray-900/90 dark:bg-gray-100/90 backdrop-blur-md text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 dark:border-black/10">
          <CheckCircle2
            className="text-emerald-400 dark:text-emerald-600"
            size={20}
          />
          <span className="font-bold text-sm tracking-tight">
            {toast.message}
          </span>
        </div>
      </div>

      <main className="flex-1">
        {activeTab === "home" && (
          <HomePage
            nativeLang={nativeLang}
            targetLang={targetLang}
            folders={folders}
            cards={cards}
            onStartStudy={startStudy}
            onToggleLang={toggleNativeLang}
            onAddCard={handleAddCard}
            onAddFolder={handleAddFolder}
            onDeleteFolder={handleDeleteFolder}
            streak={streak}
          />
        )}
        {activeTab === "cards" && (
          <CardsPage
            cards={cards}
            folders={folders}
            nativeLang={nativeLang}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
          />
        )}
        {activeTab === "study" && (
          <StudyPage
            studyCards={studyCards}
            allCards={cards}
            nativeLang={nativeLang}
            targetLang={targetLang}
            isOffline={isOffline}
            currentCardIndex={currentCardIndex}
            isFlipped={isFlipped}
            setIsFlipped={setIsFlipped}
            isAnimating={isAnimating}
            onClose={() => setActiveTab("home")}
            onRate={handleRating}
            onSpeak={handleSpeak}
          />
        )}
        {activeTab === "stats" && (
          <StatsPage cards={cards} folders={folders} nativeLang={nativeLang} history={streakHistory} />
        )}
        {activeTab === "settings" && (
          <SettingsPage
            nativeLang={nativeLang}
            isOffline={isOffline}
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleLang={toggleNativeLang}
            onReset={handleResetApp}
          />
        )}
      </main>

      <div className="mb-20" />

      {activeTab && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 py-3 px-6 rounded-3xl shadow-xl flex justify-around items-center z-50 w-[95%] max-w-lg md:bottom-10">
          {[
            {
              id: "home",
              icon: Home,
              label: nativeLang === "fr" ? "Accueil" : "Inicio",
            },
            {
              id: "cards",
              icon: Library,
              label: nativeLang === "fr" ? "Lib" : "Lib",
            },
            {
              id: "study",
              icon: BookOpen,
              label: nativeLang === "fr" ? "Étude" : "Estudio",
              action: () => startStudy(null, true, "mixed"),
            },
            {
              id: "stats",
              icon: BarChart2,
              label: nativeLang === "fr" ? "Stats" : "Stats",
            },
            {
              id: "settings",
              icon: Settings,
              label: nativeLang === "fr" ? "Ajustes" : "Ajustes",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                tab.action ? tab.action() : setActiveTab(tab.id as any)
              }
              className={`cursor-pointer flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400 scale-110" : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"}`}
            >
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
