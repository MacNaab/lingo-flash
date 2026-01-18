import React from "react";
import type { Language } from "@/lib/types";
import {
  Settings,
  Globe,
  Database,
  Trash2,
  Heart,
  Moon,
  Sun,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

interface SettingsPageProps {
  nativeLang: Language;
  isOffline: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  nativeLang,
  isOffline,
  theme,
  onToggleTheme,
  onToggleLang,
  onReset,
}) => {
  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-500 dark:text-gray-100">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="text-gray-600 dark:text-gray-400" size={24} />
        {nativeLang === "fr" ? "Réglages" : "Ajustes"}
      </h2>

      <Card className="overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                {nativeLang === "fr" ? "Langue Natale" : "Idioma Nativo"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {nativeLang === "fr"
                  ? "Langue pour les définitions"
                  : "Idioma para definiciones"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onToggleLang}
            className="min-w-25 font-black border-2 border-indigo-100 dark:border-indigo-900 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {nativeLang.toUpperCase()}
          </Button>
        </CardContent>

        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              {theme === "light" ? <Sun size={24} /> : <Moon size={24} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                {nativeLang === "fr" ? "Apparence" : "Apariencia"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {theme === "light"
                  ? nativeLang === "fr"
                    ? "Mode Clair"
                    : "Modo Claro"
                  : nativeLang === "fr"
                    ? "Mode Sombre"
                    : "Modo Oscuro"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onToggleTheme}
            className="min-w-25 font-black border-2 border-indigo-100 dark:border-indigo-900 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {theme === "light"
              ? nativeLang === "fr"
                ? "CLAIR"
                : "CLARO"
              : nativeLang === "fr"
                ? "SOMBRE"
                : "OSCURO"}
          </Button>
        </CardContent>

        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isOffline ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"}`}
            >
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100">
                {nativeLang === "fr" ? "Connexion" : "Conexión"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {isOffline ? "Mode Hors-ligne" : "Mode Connecté"}
              </p>
            </div>
          </div>
          <Badge
            variant={isOffline ? "destructive" : "default"}
            className="px-4 py-1 font-black uppercase tracking-widest shadow-sm"
          >
            {isOffline ? "OFFLINE" : "ONLINE"}
          </Badge>
        </CardContent>
      </Card>

      <Card className="p-8 border-red-100 dark:border-red-900 bg-red-50/20 dark:bg-red-950/10 shadow-sm border-2 border-dashed">
        <h4 className="font-black text-red-600 dark:text-red-400 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Trash2 size={16} />{" "}
          {nativeLang === "fr" ? "Zone de Danger" : "Zona de Peligro"}
        </h4>
        <p className="text-sm text-red-700/80 dark:text-red-400/80 mb-8 font-semibold leading-relaxed">
          {nativeLang === "fr"
            ? "La réinitialisation supprimera définitivement vos dossiers et vos statistiques stockés sur cet appareil."
            : "El reinicio eliminará permanentemente sus carpetas y estadísticas locales."}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full font-bold shadow-lg h-12"
            >
              {nativeLang === "fr"
                ? "Réinitialiser toutes les données"
                : "Reiniciar todos los datos"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {nativeLang === "fr" ? "Etes-vous sûr?" : "¿Está seguro?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {nativeLang === "fr"
                  ? "Voulez-vous vraiment supprimer définitivement toutes vos données et les réinitialiser?"
                  : "¿Realmente quieres eliminar permanentemente todos tus datos y restablecerlos?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {nativeLang === "fr" ? "Annuler" : "Cancelar"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={onReset}>
                {nativeLang === "fr" ? "Réinitialiser" : "Reiniciar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>

      <div className="pt-10 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
          <Heart
            size={16}
            className="fill-red-400 text-red-400 dark:fill-red-900 dark:text-red-900"
          />
          <span className="text-sm font-bold tracking-tight">
            LingoFlash v0.1
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 px-6"
        >
          {nativeLang === "fr"
            ? "Application 100% Locale"
            : "Aplicación 100% Local"}
        </Badge>
      </div>
    </div>
  );
};
