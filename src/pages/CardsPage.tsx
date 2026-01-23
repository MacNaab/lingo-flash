import React, { useState, useMemo } from "react";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  Save,
  Check,
  ChevronDown,
  ArrowUpDown,
  Clock,
  Type as TypeIcon,
  CalendarDays,
  Maximize2,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Flashcard, Folder, Language } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@//components/ui/button";
import { Badge } from "@//components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

interface CardsPageProps {
  cards: Flashcard[];
  folders: Folder[];
  nativeLang: Language;
  onUpdateCard: (card: Flashcard) => void;
  onDeleteCard: (id: string) => void;
}

type SortOption = "newest" | "alpha-fr" | "alpha-es" | "review";


const ITEMS_PER_PAGE = 15;

export const CardsPage: React.FC<CardsPageProps> = ({
  cards,
  folders,
  nativeLang,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(
    new Set(),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [focusCard, setFocusCard] = useState<Flashcard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFolderIds, sortBy]);

  const toggleFolder = (id: string) => {
    const newSet = new Set(selectedFolderIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedFolderIds(newSet);
  };

  const statusLabels: Record<string, { fr: string; es: string }> = {
    new: { fr: "Nouveau", es: "Nuevo" },
    learning: { fr: "Apprentissage", es: "Aprendizaje" },
    review: { fr: "Révision", es: "Revisión" },
    mastered: { fr: "Maîtrisé", es: "Maestría" },
  };

  const sortedAndFilteredCards = useMemo(() => {
    const filtered = cards.filter((card) => {
      const matchesSearch =
        card.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.es.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFolder = true;
      if (selectedFolderIds.size > 0) {
        const currentFolder = folders.find((f) => f.id === card.folderId);
        matchesFolder =
          selectedFolderIds.has(card.folderId) ||
          (!!currentFolder?.parentId &&
            selectedFolderIds.has(currentFolder.parentId));
      }

      return matchesSearch && matchesFolder;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "alpha-fr":
          return a.fr.localeCompare(b.fr);
        case "alpha-es":
          return a.es.localeCompare(b.es);
        case "review":
          return a.nextReview - b.nextReview;
        case "newest":
        default:
          return b.id.localeCompare(a.id);
      }
    });
  }, [cards, searchTerm, selectedFolderIds, folders, sortBy]);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      onUpdateCard(editingCard);
      setEditingCard(null);
    }
  };

  const rootFolders = folders.filter((f) => !f.parentId);

  const sortLabels = {
    newest: { fr: "Plus récent", es: "Más reciente", icon: Clock },
    "alpha-fr": { fr: "Français (A-Z)", es: "Francés (A-Z)", icon: TypeIcon },
    "alpha-es": { fr: "Español (A-Z)", es: "Español (A-Z)", icon: TypeIcon },
    review: {
      fr: "Prochaine révision",
      es: "Próximo repaso",
      icon: CalendarDays,
    },
  };

  const totalPages = Math.ceil(sortedAndFilteredCards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCards = sortedAndFilteredCards.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Filter className="text-indigo-600" />
          {nativeLang === "fr" ? "Ma Bibliothèque" : "Mi Biblioteca"}
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={nativeLang === "fr" ? "Rechercher..." : "Buscar..."}
              className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all hover:border-indigo-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
              >
                <ArrowUpDown size={16} className="text-indigo-500" />
                <span className="hidden sm:inline">
                  {sortLabels[sortBy][nativeLang]}
                </span>
              </button>

              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-55"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-60 p-2 animate-in slide-in-from-top-2 duration-200">
                    {(Object.keys(sortLabels) as SortOption[]).map((option) => {
                      const Icon = sortLabels[option].icon;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${sortBy === option ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                        >
                          <Icon
                            size={16}
                            className={
                              sortBy === option
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }
                          />
                          {sortLabels[option][nativeLang]}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="relative flex-1 sm:flex-none sm:w-48">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 text-sm flex items-center justify-between focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:border-gray-800 dark:text-gray-100"
              >
                <span className="truncate">
                  {selectedFolderIds.size === 0
                    ? nativeLang === "fr"
                      ? "Dossiers"
                      : "Carpetas"
                    : `${selectedFolderIds.size} 📁`}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-55"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full mt-2 left-0 sm:right-0 w-full sm:w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-60 max-h-80 overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-2 mb-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        {nativeLang === "fr" ? "Filtrer" : "Filtrar"}
                      </span>
                      {selectedFolderIds.size > 0 && (
                        <button
                          onClick={() => setSelectedFolderIds(new Set())}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400"
                        >
                          {nativeLang === "fr" ? "Reset" : "Limpiar"}
                        </button>
                      )}
                    </div>
                    {rootFolders.map((folder) => {
                      const children = folders.filter(
                        (f) => f.parentId === folder.id,
                      );
                      const isSelected = selectedFolderIds.has(folder.id);

                      return (
                        <div key={folder.id} className="space-y-1">
                          <button
                            onClick={() => toggleFolder(folder.id)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-sm ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"}`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-gray-600"}`}
                            >
                              {isSelected && (
                                <Check size={10} className="text-white" />
                              )}
                            </div>
                            <span className="text-base">{folder.icon}</span>
                            <span className="truncate">
                              {folder.name[nativeLang]}
                            </span>
                          </button>

                          {children.map((child) => {
                            const isChildSelected = selectedFolderIds.has(
                              child.id,
                            );
                            return (
                              <button
                                key={child.id}
                                onClick={() => toggleFolder(child.id)}
                                className={`w-full flex items-center gap-3 p-2.5 pl-9 rounded-xl transition-colors text-sm ${isChildSelected ? "bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChildSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 dark:border-gray-600"}`}
                                >
                                  {isChildSelected && (
                                    <Check size={8} className="text-white" />
                                  )}
                                </div>
                                <span>{child.icon}</span>
                                <span className="truncate">
                                  {child.name[nativeLang]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCards.map((card) => (
          <Card
            key={card.id}
            className="group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all overflow-hidden relative border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md"
          >
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <Badge
                  variant="secondary"
                  className="text-[9px] font-black uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400"
                >
                  {
                    folders.find((f) => f.id === card.folderId)?.name[
                      nativeLang
                    ]
                  }
                </Badge>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    onClick={() => setFocusCard(card)}
                  >
                    <Maximize2 size={14} />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {nativeLang === "fr"
                            ? "Modifier la carte"
                            : "Editar tarjeta"}
                        </DialogTitle>
                        <DialogDescription />
                          {editingCard && (
                            <form
                              onSubmit={handleUpdateSubmit}
                              className="space-y-6"
                            >
                              <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-500 tracking-widest dark:text-gray-400">
                                  {nativeLang === "fr" ? "Dossier" : "Carpeta"}
                                </label>
                                <FolderCombobox
                                  folders={folders}
                                  nativeLang={nativeLang}
                                  selectedId={editingCard.folderId}
                                  onSelect={(id) =>
                                    setEditingCard({
                                      ...editingCard,
                                      folderId: id,
                                    })
                                  }
                                />
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest dark:text-gray-400">
                                    Français
                                  </label>
                                  <textarea
                                    required
                                    className="w-full h-24 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm font-medium dark:text-gray-100"
                                    value={editingCard.fr}
                                    onChange={(e) =>
                                      setEditingCard({
                                        ...editingCard,
                                        fr: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest dark:text-gray-400">
                                    Español
                                  </label>
                                  <textarea
                                    required
                                    className="w-full h-24 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-sm font-medium dark:text-gray-100"
                                    value={editingCard.es}
                                    onChange={(e) =>
                                      setEditingCard({
                                        ...editingCard,
                                        es: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogClose asChild>
                                <Button
                                  type="submit"
                                  className="w-full gap-2 font-bold h-14 rounded-xl shadow-lg text-base"
                                >
                                  <Save size={20} />{" "}
                                  {nativeLang === "fr"
                                    ? "Mettre à jour"
                                    : "Actualizar"}
                                </Button>
                              </DialogClose>
                            </form>
                          )}
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger className="h-8 w-8 ml-2 cursor-pointer text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {nativeLang === "fr"
                            ? "Etes-vous sûr?"
                            : "¿Está seguro?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {nativeLang === "fr"
                            ? `Voulez-vous supprimer définitivement la carte "${card.fr}" ?`
                            : `¿Desea eliminar permanentemente la tarjeta "${card.es}"?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {nativeLang === "fr" ? "Annuler" : "Cancelar"}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteCard(card.id)}
                        >
                          {nativeLang === "fr" ? "Supprimer" : "Eliminar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="space-y-4">
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                    Français
                  </label>
                  <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight text-lg">
                    {card.fr}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-right-2 duration-300">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">
                    Español
                  </label>
                  <p className="font-black text-indigo-600 dark:text-indigo-400 leading-tight text-lg">
                    {card.es}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 text-[9px] font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(card.nextReview).toLocaleDateString()}
                </span>
                <span className="uppercase font-black text-indigo-400">
                  {statusLabels[card.status][nativeLang]}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedAndFilteredCards.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
          <div className="text-4xl mb-4 opacity-20">🔍</div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            {nativeLang === "fr"
              ? "Aucune carte trouvée"
              : "No se encontraron tarjetas"}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 mt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {nativeLang === "fr" ? "Affichage de" : "Mostrando"}{" "}
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedAndFilteredCards.length)}
            </span>{" "}
            {nativeLang === "fr" ? "sur" : "de"}{" "}
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {sortedAndFilteredCards.length}
            </span>{" "}
            {nativeLang === "fr" ? "cartes" : "tarjetas"}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 hidden sm:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {currentPage}
              </span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 hidden sm:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {focusCard && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="fixed inset-0 bg-gray-900/90 backdrop-blur-md"
            onClick={() => setFocusCard(null)}
          />
          <Card className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-none">
            <button
              onClick={() => setFocusCard(null)}
              className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors z-10"
            >
              <CloseIcon size={24} />
            </button>
            <CardContent className="p-12 md:p-20 text-center space-y-12">
              <div>
                <Badge
                  variant="secondary"
                  className="px-6 py-1.5 font-black uppercase tracking-[0.2em] mb-8 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                >
                  {
                    folders.find((f) => f.id === focusCard.folderId)?.name[
                      nativeLang
                    ]
                  }
                </Badge>
                <div className="space-y-4">
                  <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">
                    FRANÇAIS
                  </span>
                  <h3 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {focusCard.fr}
                  </h3>
                </div>
              </div>

              <div className="w-24 h-1 bg-linear-to-r from-transparent via-indigo-100 dark:via-indigo-900 to-transparent mx-auto" />

              <div className="space-y-4">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">
                  ESPAÑOL
                </span>
                <h3 className="text-4xl md:text-6xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                  {focusCard.es}
                </h3>
              </div>

              <div className="pt-8 flex flex-wrap justify-center gap-4">
                <Badge
                  variant="outline"
                  className="px-4 py-1 text-[10px] font-black uppercase text-gray-400 border-gray-100 dark:border-gray-800"
                >
                  STATUS: {statusLabels[focusCard.status][nativeLang]}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-1 text-[10px] font-black uppercase text-gray-400 border-gray-100 dark:border-gray-800"
                >
                  {nativeLang === "fr" ? "PROCHAIN" : "PRÓXIMO"}:{" "}
                  {new Date(focusCard.nextReview).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
