import { useAppStore } from '../stores/use-app-store';
import { UserSettings } from '../types/user';

export function useSettings() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const setTheme = (theme: UserSettings['theme']) => {
    updateSettings({ theme });
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const setAutoPlay = (autoPlayNextChapter: boolean) => {
    updateSettings({ autoPlayNextChapter });
  };

  const setDefaultPlaybackRate = (defaultPlaybackRate: number) => {
    updateSettings({ defaultPlaybackRate });
  };

  const setSmartSkipSeconds = (smartSkipSeconds: number) => {
    updateSettings({ smartSkipSeconds });
  };

  const setOfflineQuality = (offlineQuality: UserSettings['offlineQuality']) => {
    updateSettings({ offlineQuality });
  };

  return {
    settings,
    updateSettings,
    setTheme,
    setAutoPlay,
    setDefaultPlaybackRate,
    setSmartSkipSeconds,
    setOfflineQuality,
  };
}
