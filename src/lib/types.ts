
export type Language = 'fr' | 'es';

export interface LocalizedString {
  fr: string;
  es: string;
}

export interface Flashcard {
  id: string;
  folderId: string;
  fr: string; // Texte en français
  es: string; // Texte en espagnol
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
  repetition: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface Folder {
  id: string;
  parentId?: string; // ID du dossier parent si c'est un sous-dossier
  name: LocalizedString;
  icon: string;
}

export interface UserProgress {
  cardsLearned: number;
  dailyStreak: number;
  lastActive: number;
  totalReviews: number;
}

export type GamificationStatus = 'flame' | 'freeze' | 'missed';

export interface GamificationDay {
  date: string;
  status: GamificationStatus;
}

export interface GamificationState {
  streak: number;
  lastLoginDate: string;
  history: GamificationDay[];
}
