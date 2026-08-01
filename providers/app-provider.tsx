'use client';

import { ReactNode, useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { useAppStore } from '../stores/use-app-store';
import { playerService } from '../services/player/player-service';
import { ApiClient } from '../services/api/api-client';
import { PwaManager } from '../components/PwaManager';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function initializeApplication() {
      const store = useAppStore.getState();

      // 1. Restore Local Session & Settings
      store.hydrateStore();

      // 2. Apply theme
      const theme = store.settings?.theme || 'dark';
      const root = document.documentElement;
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // 3. Connect Backend & Sync User Profile
      const userId = store.userId || 'guest_user';
      ApiClient.syncUserProfile(userId, 'Vibe User').catch(console.warn);

      // 4. Fetch User Progress History in background
      ApiClient.fetchUserProgress(userId)
        .then((remoteHistory) => {
          if (remoteHistory && remoteHistory.length > 0) {
            useAppStore.getState().setHistory(remoteHistory);
          }
        })
        .catch(console.warn);

      // 5. Restore Last Played Book & Player State
      try {
        await playerService.restoreSession();
      } catch (err) {
        console.warn('Session restoration skipped:', err);
      }

      // 6. Complete initialization
      useAppStore.getState().setInitialized(true);
    }

    initializeApplication();
  }, []);

  return (
    <QueryProvider>
      <PwaManager />
      {children}
    </QueryProvider>
  );
}
