import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Folder, Language } from "@/lib/types";

interface FolderComboboxProps {
  folders: Folder[];
  nativeLang: Language;
  selectedId: string;
  onSelect: (id: string) => void;
  includeRoot?: boolean;
}

export const FolderCombobox: React.FC<FolderComboboxProps> = ({
  folders,
  nativeLang,
  selectedId,
  onSelect,
  includeRoot,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedFolder = folders.find((f) => f.id === selectedId);
  const roots = folders.filter((f) => !f.parentId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm flex items-center justify-between text-gray-900 dark:text-gray-100 shadow-sm"
      >
        <span className="truncate">
          {selectedId === "" && includeRoot
            ? nativeLang === "fr"
              ? "Dossier racine"
              : "Carpeta raíz"
            : selectedFolder
              ? `${selectedFolder.icon} ${selectedFolder.name[nativeLang]}`
              : nativeLang === "fr"
                ? "Choisir dossier"
                : "Elegir carpeta"}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-105"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-110 max-h-60 overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-200">
            {includeRoot && (
              <button
                type="button"
                onClick={() => {
                  onSelect("");
                  setIsOpen(false);
                }}
                className="w-full p-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl dark:text-gray-100"
              >
                {nativeLang === "fr" ? "Dossier racine" : "Carpeta raíz"}
              </button>
            )}
            {roots.map((f) => (
              <div key={f.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(f.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-sm transition-colors ${selectedId === f.id ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-100"}`}
                >
                  <span className="text-base">{f.icon}</span>
                  <span className="truncate">{f.name[nativeLang]}</span>
                  {selectedId === f.id && (
                    <Check
                      size={14}
                      className="ml-auto text-indigo-600 dark:text-indigo-400"
                    />
                  )}
                </button>
                {folders
                  .filter((child) => child.parentId === f.id)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelect(c.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 pl-9 rounded-xl text-sm transition-colors ${selectedId === c.id ? "bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400"}`}
                    >
                      <span className="text-base">{c.icon}</span>
                      <span className="truncate">{c.name[nativeLang]}</span>
                      {selectedId === c.id && (
                        <Check
                          size={14}
                          className="ml-auto text-indigo-600 dark:text-indigo-400"
                        />
                      )}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
