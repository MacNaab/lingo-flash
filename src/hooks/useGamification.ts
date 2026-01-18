import { useState, useEffect } from 'react';
import { getItem, saveItem } from '../lib/db';
import type { GamificationState, GamificationDay, GamificationStatus } from '../lib/types';

const GAMIFICATION_KEY = 'state';
const STORE_NAME = 'gamification';

interface UseGamificationReturn {
  streak: number;
  showAnimation: GamificationStatus | 'extinguish' | null;
  history: GamificationDay[];
  loading: boolean;
  clearAnimation: () => void;
}

export const useGamification = (): UseGamificationReturn => {
  const [streak, setStreak] = useState<number>(0);
  const [history, setHistory] = useState<GamificationDay[]>([]);
  const [showAnimation, setShowAnimation] = useState<GamificationStatus | 'extinguish' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkGamification();
  }, []);

  const checkGamification = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const state = await getItem<GamificationState>(STORE_NAME, GAMIFICATION_KEY);

      if (!state) {
        // First time user
        const newState: GamificationState = {
          streak: 1,
          lastLoginDate: today,
          history: [{ date: today, status: 'flame' }]
        };
        await saveItem(STORE_NAME, { key: GAMIFICATION_KEY, ...newState });
        setStreak(1);
        setHistory(newState.history);
        setShowAnimation('flame');
        setLoading(false);
        return;
      }

      // Check if already logged in today
      if (state.lastLoginDate === today) {
        setStreak(state.streak);
        setHistory(state.history);
        setLoading(false);
        return;
      }

      const lastLogin = new Date(state.lastLoginDate);
      const current = new Date(today);
      const diffTime = Math.abs(current.getTime() - lastLogin.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      // Note: diffDays=1 means consecutive days (Yesterday -> Today)

      let newState = { ...state };
      let animation: GamificationStatus | 'extinguish' | null = null;

      if (diffDays === 1) {
        // Consecutive Logic
        newState.streak += 1;
        newState.history.push({ date: today, status: 'flame' });
        animation = 'flame';
      } else if (diffDays === 2) {
        // Missed 1 day -> Freeze Logic
        // Add freeze for yesterday
        const yesterday = new Date(current);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        newState.history.push({ date: yesterdayStr, status: 'freeze' });
        newState.history.push({ date: today, status: 'flame' });
        
        // Streak preserved (not incremented for the frozen day, but kept for today?)
        // User request: "Si l’utilisateur rate une journée : mode glaçon permettant de geler les flammes"
        // "Absence d’ajout de flemme pour cette journée" -> Streak doesn't increase for yesterday.
        // Does it increase for today? Usually streaks are "current streak". 
        // Let's keep it same or +1. If it's a "streak", checking in today should probably add to it if preserved.
        // Let's say: 10 days -> Miss -> Freeze(preserved) -> Today(Login) -> 11 days.
        newState.streak += 1; 
        
        animation = 'freeze';
      } else {
        // Missed > 1 day -> Reset Logic
        newState.streak = 1;
        // Optional: Could fill gaps with 'missed' if we want detailed history
        newState.history.push({ date: today, status: 'flame' });
        animation = 'extinguish';
      }

      newState.lastLoginDate = today;
      
      // Limit history size if needed (e.g. last 365 entries), for now keep all
      
      await saveItem(STORE_NAME, { key: GAMIFICATION_KEY, ...newState });
      
      setStreak(newState.streak);
      setHistory(newState.history);
      setShowAnimation(animation);
      
    } catch (error) {
      console.error("Error checking gamification:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAnimation = () => setShowAnimation(null);

  return { streak, showAnimation, history, loading, clearAnimation };
};
