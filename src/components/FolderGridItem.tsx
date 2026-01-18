import React from "react";
import { Trash2, Target, ChevronRight } from "lucide-react";
import type { Folder, Flashcard, Language } from "@/lib/types";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface FolderGridItemProps {
  folder: Folder;
  folders: Folder[];
  cards: Flashcard[];
  nativeLang: Language;
  onDelete: (id: string) => void;
  onStartStudy: (
    folder: Folder | null,
    onlyDue: boolean,
    mode?: "new" | "review" | "mixed",
  ) => void;
  onNavigate: () => void;
}

export const FolderGridItem: React.FC<FolderGridItemProps> = ({
  folder,
  folders,
  cards,
  nativeLang,
  onDelete,
  onStartStudy,
  onNavigate,
}) => {
  const getSubfolderIds = (id: string, all: Folder[]): string[] => {
    let ids = [id];
    const children = all.filter((f) => f.parentId === id);
    for (const child of children) {
      ids = [...ids, ...getSubfolderIds(child.id, all)];
    }
    return ids;
  };

  const allRelevantIds = getSubfolderIds(folder.id, folders);
  const fCards = cards.filter((c) => allRelevantIds.includes(c.folderId));
  const now = Date.now() + 65000;
  const newC = fCards.filter(
    (c) => c.status === "new" && c.nextReview <= now,
  ).length;
  const revC = fCards.filter(
    (c) => c.status !== "new" && c.nextReview <= now,
  ).length;
  const subfoldersCount = folders.filter(
    (f) => f.parentId === folder.id,
  ).length;

  return (
    <Card className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group relative border-gray-200 dark:border-gray-800 shadow-sm rounded-[1.5rem] overflow-hidden dark:bg-gray-900 flex flex-col">
      <AlertDialog>
        <AlertDialogTrigger className="absolute cursor-pointer top-4 right-4 p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Trash2 size={16} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nativeLang === "fr" ? "Etes-vous sûr?" : "¿Está seguro?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nativeLang === "fr"
                ? `Voulez-vous supprimer définitivement le dossier "${folder.name.fr}" ?`
                : `¿Desea eliminar permanentemente el carpeta "${folder.name.es}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {nativeLang === "fr" ? "Annuler" : "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
              }}
            >
              {nativeLang === "fr" ? "Supprimer" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        onClick={onNavigate}
        className="cursor-pointer p-6 pb-2 group/header"
      >
        <div className="flex items-center justify-between">
          <span className="text-4xl group-hover:rotate-12 transition-transform">
            {folder.icon}
          </span>
          <div className="flex gap-1">
            {subfoldersCount > 0 && (
              <Badge
                variant="outline"
                className="text-[9px] border-indigo-100 dark:border-indigo-900 text-indigo-400"
              >
                {subfoldersCount} 📂
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-none"
            >
              {fCards.length}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <CardTitle className="text-xl font-bold dark:text-gray-100 group-hover/header:text-indigo-600 dark:group-hover/header:text-indigo-400 transition-colors">
            {folder.name[nativeLang]}
          </CardTitle>
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover/header:translate-x-1 transition-transform"
          />
        </div>
        <CardDescription className="font-medium text-gray-400 dark:text-gray-500 mt-1">
          {newC + revC > 0 ? `${newC + revC} dues` : "À jour"}
        </CardDescription>
      </div>

      <CardContent className="mt-auto p-6 pt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onStartStudy(folder, true, "new");
            }}
            disabled={newC === 0}
            className="h-10 text-[10px] uppercase font-black relative dark:bg-gray-800 dark:text-gray-300"
          >
            {nativeLang === "fr" ? "Nouveau" : "Nuevo"}
            {newC > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] border-2 border-white dark:border-gray-900">
                {newC}
              </span>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onStartStudy(folder, true, "review");
            }}
            disabled={revC === 0}
            className="h-10 text-[10px] uppercase font-black relative dark:bg-gray-800 dark:text-gray-300"
          >
            {nativeLang === "fr" ? "Réviser" : "Repasar"}
            {revC > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] border-2 border-white dark:border-gray-900">
                {revC}
              </span>
            )}
          </Button>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onStartStudy(folder, true, "mixed");
          }}
          disabled={newC + revC === 0}
          className="w-full h-11 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-bold transition-colors"
        >
          <Target size={14} className="mr-2" />
          {nativeLang === "fr" ? "Session Mixte" : "Sesión Mixta"}
        </Button>
      </CardContent>
    </Card>
  );
};
