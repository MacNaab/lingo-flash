import React, { useState, useMemo } from "react";
import { Plus, FolderPlus, ChevronRight, Home, LayoutGrid } from "lucide-react";
import type { Folder, Flashcard, Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DailyProgress } from "@/components/DailyProgress";
import { FolderGridItem } from "@/components/FolderGridItem";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderCombobox } from "@/components/FolderCombobox";
import { FolderBrowser } from "@/components/FolderBrowser";

interface HomePageProps {
  nativeLang: Language;
  targetLang: Language;
  folders: Folder[];
  cards: Flashcard[];
  onStartStudy: (
    folder: Folder | null,
    onlyDue: boolean,
    mode?: "new" | "review" | "mixed",
  ) => void;
  onToggleLang: () => void;
  onAddCard: (card: Partial<Flashcard>) => void;
  onAddFolder: (folder: Omit<Folder, "id">) => void;
  onDeleteFolder: (id: string) => void;
  streak: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  nativeLang,
  targetLang,
  folders,
  cards,
  onStartStudy,
  onToggleLang,
  onAddCard,
  onAddFolder,
  onDeleteFolder,
  streak,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({ fr: "", es: "", folderId: "" });
  const [newFolder, setNewFolder] = useState({
    nameFr: "",
    nameEs: "",
    icon: "📚",
    parentId: "",
  });

  /*
  const currentFolder = useMemo(
    () =>
      currentFolderId ? folders.find((f) => f.id === currentFolderId) : null,
    [currentFolderId, folders],
  );
  */

  const handleFolderSelection = (id: string) => {
    const selectedFolder = folders.find((folder) => folder.id === id);
    if (selectedFolder) {
      setNewFolder({ ...newFolder, parentId: id, icon: selectedFolder.icon });
    } else {
      setNewFolder({ ...newFolder, parentId: id });
    }
  };

  const displayedFolders = useMemo(
    () => folders.filter((f) => f.parentId === (currentFolderId || undefined)),
    [currentFolderId, folders],
  );

  const breadcrumbs = useMemo(() => {
    const crumbs: Folder[] = [];
    let tempId = currentFolderId;
    while (tempId) {
      const f = folders.find((folder) => folder.id === tempId);
      if (f) {
        crumbs.unshift(f);
        tempId = f.parentId || null;
      } else {
        tempId = null;
      }
    }
    return crumbs;
  }, [currentFolderId, folders]);

  const dailyStats = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const nowBuffer = Date.now() + 65000;
    const cardsDoneToday = cards.filter(
      (c) => c.repetition > 0 && c.nextReview > endOfToday.getTime(),
    ).length;
    const cardsRemaining = cards.filter(
      (c) => c.nextReview <= nowBuffer,
    ).length;
    const total = cardsDoneToday + cardsRemaining;
    return {
      done: cardsDoneToday,
      remaining: cardsRemaining,
      progress: total > 0 ? Math.round((cardsDoneToday / total) * 100) : 0,
    };
  }, [cards]);

  const handleOpenFolderModal = () => {
    setNewFolder((prev) => ({ ...prev, parentId: currentFolderId || "" }));
  };

  const handleNavigateFromBrowser = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {nativeLang === "fr" ? "Bonjour !" : "¡Hola!"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
            {nativeLang === "fr"
              ? "C'est une belle journée pour apprendre !"
              : "¡Es un gran día para aprender!"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StreakDisplay streak={streak} />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-bold bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300"
              >
                <LayoutGrid size={16} className="mr-2" />
                {nativeLang === "fr" ? "Parcourir" : "Explorar"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {nativeLang === "fr"
                    ? "Explorateur de dossiers"
                    : "Explorador de carpetas"}
                </DialogTitle>
                <DialogDescription />
                <FolderBrowser
                  folders={folders}
                  cards={cards}
                  nativeLang={nativeLang}
                  onSelectFolder={handleNavigateFromBrowser}
                />
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
              >
                <FolderPlus size={16} className="mr-2" />
                {nativeLang === "fr" ? "Dossier" : "Carpeta"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {nativeLang === "fr" ? "Nouveau Dossier" : "Nueva Carpeta"}
                </DialogTitle>
                <DialogDescription />
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddFolder({
                      name: { fr: newFolder.nameFr, es: newFolder.nameEs },
                      icon: newFolder.icon,
                      parentId: newFolder.parentId || undefined,
                    });
                  }}
                >
                  <FolderCombobox
                    folders={folders}
                    nativeLang={nativeLang}
                    selectedId={newFolder.parentId}
                    onSelect={(id) => {
                      handleFolderSelection(id);
                      // setNewFolder({ ...newFolder, parentId: id });
                    }}
                    includeRoot
                  />
                  <input
                    required
                    placeholder="Nom (FR)"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100"
                    value={newFolder.nameFr}
                    onChange={(e) =>
                      setNewFolder({ ...newFolder, nameFr: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Nombre (ES)"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100"
                    value={newFolder.nameEs}
                    onChange={(e) =>
                      setNewFolder({ ...newFolder, nameEs: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      "👋", // id: '1' - Salutations et vie sociale
                      "💬", // id: '1.1' - Conversations basiques
                      "🙂", // id: '1.2' - Présentations
                      "😊", // id: '1.3' - Émotions et sentiments

                      "🍽️", // id: '2' - Nourriture et gastronomie
                      "🍎", // id: '2.1' - Fruits et légumes
                      "☕", // id: '2.2' - Boissons
                      "🍴", // id: '2.3' - Repas et restaurants
                      "👨‍🍳", // id: '2.4' - Cuisine et recettes

                      "✈️", // id: '3' - Voyages et transports
                      "🚆", // id: '3.1' - Transports publics
                      "🏨", // id: '3.2' - Hébergement
                      "🏖️", // id: '3.3' - Tourisme et activités
                      "🛃", // id: '3.4' - Aéroport et douane

                      "🏠", // id: '4' - Maison et vie quotidienne
                      "🚪", // id: '4.1' - Pièces de la maison
                      "🛋️", // id: '4.2' - Meubles et objets
                      "🧹", // id: '4.3' - Tâches ménagères
                      "🌳", // id: '4.4' - Jardin et extérieur

                      "💼", // id: '5' - Travail et études
                      "👨‍🏫", // id: '5.1' - Professions
                      "💻", // id: '5.2' - Bureau et équipement
                      "📊", // id: '5.3' - Réunions et présentations

                      "❤️", // id: '6' - Santé et bien-être
                      "👤", // id: '6.1' - Corps humain
                      "🏥", // id: '6.2' - Médecin et symptômes
                      "⚽", // id: '6.3' - Sport et exercice

                      "🎭", // id: '7' - Culture et loisirs
                      "🎨", // id: '7.1' - Arts et spectacles
                      "🎵", // id: '7.2' - Musique et instruments
                      "📚", // id: '7.3' - Lecture et médias
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setNewFolder({ ...newFolder, icon: emoji })
                        }
                        className={`h-10 w-10 flex items-center justify-center rounded-lg ${newFolder.icon === emoji ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-600 border-2" : "bg-gray-50 dark:bg-gray-800"}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <DialogClose asChild>
                    <Button type="submit" className="w-full h-14 font-bold">
                      {nativeLang === "fr" ? "Créer" : "Crear"}
                    </Button>
                  </DialogClose>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
              >
                <Plus size={16} className="mr-2" />
                {nativeLang === "fr" ? "Carte" : "Tarjeta"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {nativeLang === "fr" ? "Nouvelle Carte" : "Nueva Tarjeta"}
                </DialogTitle>
                <DialogDescription />
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddCard(newCard);
                    setNewCard({ ...newCard, fr: "", es: "" });
                  }}
                >
                  <FolderCombobox
                    folders={folders}
                    nativeLang={nativeLang}
                    selectedId={newCard.folderId}
                    onSelect={(id) => setNewCard({ ...newCard, folderId: id })}
                  />
                  <textarea
                    required
                    placeholder="Français"
                    className="w-full h-24 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100"
                    value={newCard.fr}
                    onChange={(e) =>
                      setNewCard({ ...newCard, fr: e.target.value })
                    }
                  />
                  <textarea
                    required
                    placeholder="Español"
                    className="w-full h-24 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100"
                    value={newCard.es}
                    onChange={(e) =>
                      setNewCard({ ...newCard, es: e.target.value })
                    }
                  />
                  <DialogClose asChild>
                    <Button type="submit" className="w-full h-14 font-bold">
                      {nativeLang === "fr" ? "Créer" : "Crear"}
                    </Button>
                  </DialogClose>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            onClick={onToggleLang}
            size="sm"
            className="font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 dark:bg-gray-800"
          >
            {nativeLang.toUpperCase()} ↔ {targetLang.toUpperCase()}
          </Button>
        </div>
      </header>

      {!currentFolderId && (
        <DailyProgress
          stats={dailyStats}
          nativeLang={nativeLang}
          onStartMixed={() => onStartStudy(null, true, "mixed")}
          onStartNew={() => onStartStudy(null, true, "new")}
          hasNewCards={cards.some((c) => c.status === "new")}
        />
      )}

      <div className="space-y-4">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-sm font-bold">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`flex cursor-pointer items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${!currentFolderId ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <Home size={14} />
            <span>{nativeLang === "fr" ? "Racine" : "Raíz"}</span>
          </button>

          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
              <button
                onClick={() => setCurrentFolderId(crumb.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${currentFolderId === crumb.id ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                {crumb.icon} {crumb.name[nativeLang]}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedFolders.map((folder) => (
            <FolderGridItem
              key={folder.id}
              folder={folder}
              folders={folders}
              cards={cards}
              nativeLang={nativeLang}
              onDelete={onDeleteFolder}
              onStartStudy={onStartStudy}
              onNavigate={() => setCurrentFolderId(folder.id)}
            />
          ))}

          {displayedFolders.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                {nativeLang === "fr"
                  ? "Aucun sous-dossier ici"
                  : "No hay subcarpetas aquí"}
              </p>
              <Button
                variant="link"
                className="mt-2 text-indigo-600 font-black"
                onClick={handleOpenFolderModal}
              >
                {nativeLang === "fr"
                  ? "+ Ajouter un dossier"
                  : "+ Añadir carpeta"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
