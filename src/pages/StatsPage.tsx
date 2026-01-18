import React from "react";
import { BarChart2, TrendingUp, Award, Layers, FolderOpen } from "lucide-react";
import type { Flashcard, Folder, Language, GamificationDay } from "@/lib/types";
import { StreakCalendar } from "../components/gamification/StreakCalendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsPageProps {
  cards: Flashcard[];
  folders: Folder[];
  nativeLang: Language;
  history: GamificationDay[];
}

export const StatsPage: React.FC<StatsPageProps> = ({
  cards,
  folders,
  nativeLang,
  history,
}) => {
  const total = cards.length;
  const mastered = cards.filter((c) => c.status === "mastered").length;
  const review = cards.filter((c) => c.status === "review").length;
  const learning = cards.filter((c) => c.status === "learning").length;
  const newCards = cards.filter((c) => c.status === "new").length;

  const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;

  const getPercent = (count: number, totalCount: number) =>
    totalCount > 0 ? (count / totalCount) * 100 : 0;

  const statusColors: Record<string, string> = {
    mastered: "bg-emerald-500",
    review: "bg-indigo-500",
    learning: "bg-amber-400",
    new: "bg-gray-200 dark:bg-gray-700",
  };

  const statusData = [
    {
      id: "mastered",
      label: nativeLang === "fr" ? "Maîtrisé" : "Maestría",
      count: mastered,
      color: statusColors.mastered,
      text: "text-emerald-600",
    },
    {
      id: "review",
      label: nativeLang === "fr" ? "Révision" : "Repaso",
      count: review,
      color: statusColors.review,
      text: "text-indigo-600",
    },
    {
      id: "learning",
      label: nativeLang === "fr" ? "Apprentissage" : "Aprendizaje",
      count: learning,
      color: statusColors.learning,
      text: "text-amber-500",
    },
    {
      id: "new",
      label: nativeLang === "fr" ? "Nouveau" : "Nuevo",
      count: newCards,
      color: statusColors.new,
      text: "text-gray-400",
    },
  ];

  // Calcul des stats par dossier
  const folderStats = folders
    .map((folder) => {
      const folderCards = cards.filter((c) => c.folderId === folder.id);
      const fTotal = folderCards.length;
      return {
        name: folder.name[nativeLang],
        icon: folder.icon,
        total: fTotal,
        mastered: folderCards.filter((c) => c.status === "mastered").length,
        review: folderCards.filter((c) => c.status === "review").length,
        learning: folderCards.filter((c) => c.status === "learning").length,
        new: folderCards.filter((c) => c.status === "new").length,
      };
    })
    .filter((fs) => fs.total > 0); // Uniquement les dossiers avec des cartes

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500 dark:text-gray-100">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart2 className="text-indigo-600 dark:text-indigo-400" />
        {nativeLang === "fr" ? "Statistiques" : "Estadísticas"}
        {nativeLang === "fr" ? "Statistiques" : "Estadísticas"}
      </h2>

      {/* Streak Calendar */}
      <StreakCalendar history={history} />

      {/* Résumé rapide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statusData.map((stat, i) => (
          <Card
            key={i}
            className="text-center shadow-sm border-none bg-white dark:bg-gray-900"
          >
            <CardContent className="pt-4 pb-4 px-2">
              <div className={`text-2xl font-black ${stat.text}`}>
                {stat.count}
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-1">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution Graphique Globale */}
      <Card className="shadow-md overflow-hidden border-none dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
            {nativeLang === "fr"
              ? "Distribution Globale"
              : "Distribución Global"}
          </CardTitle>
          <CardDescription>
            {nativeLang === "fr"
              ? "Répartition de vos connaissances actuelles"
              : "Desglose de tus conocimientos actuales"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex p-1.5 gap-1 shadow-inner">
            {statusData.map((stat, i) => (
              <div
                key={i}
                className={`${stat.color} h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-center min-w-1`}
                style={{ width: `${getPercent(stat.count, total)}%` }}
              >
                {getPercent(stat.count, total) > 10 && (
                  <span className="text-[10px] font-bold text-white opacity-80">
                    {Math.round(getPercent(stat.count, total))}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section par Dossier */}
      <Card className="shadow-md border-none dark:bg-gray-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
            {nativeLang === "fr"
              ? "Progrès par catégorie"
              : "Progreso por categoría"}
          </CardTitle>
          <CardDescription>
            {nativeLang === "fr"
              ? "Statut d'apprentissage pour chaque dossier"
              : "Estado de aprendizaje por carpeta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {folderStats.map((fs, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fs.icon}</span>
                  <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
                    {fs.name}
                  </span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  {fs.total} {nativeLang === "fr" ? "Cartes" : "Tarjetas"}
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className={`${statusColors.mastered} h-full transition-all`}
                  style={{ width: `${getPercent(fs.mastered, fs.total)}%` }}
                />
                <div
                  className={`${statusColors.review} h-full transition-all`}
                  style={{ width: `${getPercent(fs.review, fs.total)}%` }}
                />
                <div
                  className={`${statusColors.learning} h-full transition-all`}
                  style={{ width: `${getPercent(fs.learning, fs.total)}%` }}
                />
                <div
                  className={`${statusColors.new} h-full transition-all`}
                  style={{ width: `${getPercent(fs.new, fs.total)}%` }}
                />
              </div>
              <div className="flex gap-4 px-1">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${statusColors.mastered}`}
                  />
                  <span className="text-[9px] font-bold text-gray-400">
                    {fs.mastered}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${statusColors.review}`}
                  />
                  <span className="text-[9px] font-bold text-gray-400">
                    {fs.review}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${statusColors.learning}`}
                  />
                  <span className="text-[9px] font-bold text-gray-400">
                    {fs.learning}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${statusColors.new}`}
                  />
                  <span className="text-[9px] font-bold text-gray-400">
                    {fs.new}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progression Globale */}
      <Card className="shadow-md border-none relative overflow-hidden dark:bg-gray-900">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white">
          <TrendingUp size={80} />
        </div>
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
            {nativeLang === "fr" ? "Maîtrise Globale" : "Dominio Global"}
          </CardTitle>
          <Badge className="text-lg px-4 py-1 bg-indigo-600 dark:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-200 dark:shadow-none">
            {progress}%
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              <span>{nativeLang === "fr" ? "Débutant" : "Principiante"}</span>
              <span>{nativeLang === "fr" ? "Expert" : "Experto"}</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-300 h-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Badge */}
      <Card className="bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center py-10 px-6 text-center shadow-sm border">
        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border border-indigo-50 dark:border-indigo-900/50 mb-6 group">
          <Award
            size={40}
            className="text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform"
          />
        </div>
        <CardTitle className="text-xl mb-2 text-indigo-900 dark:text-indigo-100">
          {nativeLang === "fr" ? "Prochain Palier" : "Próximo Nivel"}
        </CardTitle>
        <CardDescription className="text-indigo-600/70 dark:text-indigo-400/70 font-bold max-w-xs leading-relaxed">
          {nativeLang === "fr"
            ? `Encore ${Math.max(0, 10 - mastered)} cartes à maîtriser pour devenir "Explorateur" !`
            : `¡Faltan ${Math.max(0, 10 - mastered)} tarjetas para convertirte en "Explorador"!`}
        </CardDescription>
      </Card>
    </div>
  );
};
