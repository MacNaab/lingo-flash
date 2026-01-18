import React from "react";
import { ChevronRight, Folder as FolderIcon, Home } from "lucide-react";
import type { Folder, Flashcard, Language } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface FolderBrowserProps {
  folders: Folder[];
  cards: Flashcard[];
  nativeLang: Language;
  onSelectFolder: (id: string | null) => void;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({
  folders,
  cards,
  nativeLang,
  onSelectFolder,
}) => {
  const rootFolders = folders.filter((f) => !f.parentId);

  /*
  const getSubfolderCount = (parentId: string) => {
    return folders.filter((f) => f.parentId === parentId).length;
  };
  */

  const getCardCount = (folderId: string) => {
    // Compte uniquement les cartes directes du dossier pour la clarté dans l'arbre
    return cards.filter((c) => c.folderId === folderId).length;
  };

  const FolderRow: React.FC<{ folder: Folder; level: number }> = ({
    folder,
    level,
  }) => {
    const children = folders.filter((f) => f.parentId === folder.id);
    const cardCount = getCardCount(folder.id);

    return (
      <div className="flex flex-col">
        <button
          onClick={() => onSelectFolder(folder.id)}
          className="flex cursor-pointer items-center group py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border-l-2 border-transparent hover:border-indigo-500"
          style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}
        >
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <span className="text-xl shrink-0 transition-transform group-hover:scale-125">
              {folder.icon}
            </span>
            <span className="font-bold text-gray-700 dark:text-gray-200 truncate">
              {folder.name[nativeLang]}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {cardCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-white dark:bg-gray-800 text-[9px] font-black h-5 border border-gray-100 dark:border-gray-800"
              >
                {cardCount}
              </Badge>
            )}
            <ChevronRight
              size={14}
              className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
            />
          </div>
        </button>
        {children.length > 0 && (
          <div className="flex flex-col">
            {children.map((child) => (
              <FolderRow key={child.id} folder={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
      <button
        onClick={() => onSelectFolder(null)}
        className="w-full cursor-pointer flex items-center gap-3 py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all font-bold text-gray-700 dark:text-gray-200"
      >
        <Home size={18} className="text-indigo-600 dark:text-indigo-400" />
        <span>{nativeLang === "fr" ? "Racine (Tout)" : "Raíz (Todo)"}</span>
      </button>

      <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-4" />

      {rootFolders.length > 0 ? (
        <div className="flex flex-col">
          {rootFolders.map((folder) => (
            <FolderRow key={folder.id} folder={folder} level={0} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <FolderIcon size={40} className="mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400 font-medium">
            {nativeLang === "fr"
              ? "Aucun dossier créé"
              : "No hay carpetas creadas"}
          </p>
        </div>
      )}
    </div>
  );
};
