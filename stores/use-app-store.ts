import { create } from 'zustand';
import { Book } from '../types/book';
import { PlaybackState, Bookmark } from '../types/playback';
import { UserProgress, OfflineBook, UserSettings } from '../types/user';
import { StorageAdapter } from '../lib/storage';

export type AppView = 'home' | 'library' | 'player' | 'search' | 'history' | 'bookmarks' | 'downloads' | 'settings';

export interface AppStoreState {
  // Initialization State
  isInitialized: boolean;
  userId: string;

  // Library State
  books: Book[];
  isLoadingLibrary: boolean;
  libraryError: string | null;

  // Active Listening Session
  currentBook: Book | null;
  currentChapterIndex: number;

  // Playback State
  playback: PlaybackState;

  // Personal Collections
  bookmarks: Bookmark[];
  history: UserProgress[];
  downloads: OfflineBook[];
  favorites: string[];

  // Search & Navigation
  searchQuery: string;
  selectedCategory: string;
  currentView: AppView;
  recentSearches: string[];
  selectedBookIdForModal: string | null;

  // Application Settings & Theme
  settings: UserSettings;

  // Actions
  setInitialized: (isInitialized: boolean) => void;
  setUserId: (userId: string) => void;
  hydrateStore: () => void;
  setBooks: (books: Book[]) => void;
  setLoadingLibrary: (isLoading: boolean) => void;
  setLibraryError: (error: string | null) => void;

  setCurrentBook: (book: Book | null, chapterIndex?: number) => void;
  setCurrentChapterIndex: (index: number) => void;

  updatePlaybackState: (partial: Partial<PlaybackState>) => void;

  // Bookmark actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;

  // Favorites actions
  toggleFavorite: (bookId: string) => void;

  // History & Progress actions
  setHistory: (history: UserProgress[]) => void;
  updateUserProgress: (progress: UserProgress) => void;

  // Downloads actions
  setDownloads: (downloads: OfflineBook[]) => void;

  // Search & Navigation
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setCurrentView: (view: AppView) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  setSelectedBookIdForModal: (bookId: string | null) => void;

  // Settings & Data Reset
  updateSettings: (partial: Partial<UserSettings>) => void;
  clearAllData: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  autoPlayNextChapter: true,
  defaultPlaybackRate: 1.0,
  smartSkipSeconds: 10,
  offlineQuality: 'standard',
};

const DEFAULT_PLAYBACK: PlaybackState = {
  status: 'idle',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  playbackRate: 1.0,
  isMuted: false,
  sleepTimerMinutes: null,
  sleepTimerRemainingSeconds: null,
  error: null,
};

export const useAppStore = create<AppStoreState>((set) => ({
  isInitialized: false,
  userId: '',

  books: [],
  isLoadingLibrary: false,
  libraryError: null,

  currentBook: null,
  currentChapterIndex: 0,

  playback: DEFAULT_PLAYBACK,

  bookmarks: [],
  history: [],
  downloads: [],
  favorites: [],

  searchQuery: '',
  selectedCategory: 'All',
  currentView: 'home',
  recentSearches: [],
  selectedBookIdForModal: null,

  settings: DEFAULT_SETTINGS,

  setInitialized: (isInitialized) => set({ isInitialized }),

  setUserId: (userId) => {
    StorageAdapter.setItem('userId', userId);
    set({ userId });
  },

  hydrateStore: () => {
    if (typeof window === 'undefined') return;

    let storedUserId = StorageAdapter.getItem<string>('userId', '');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      StorageAdapter.setItem('userId', storedUserId);
    }

    set({
      userId: storedUserId,
      bookmarks: StorageAdapter.getItem<Bookmark[]>('bookmarks', []),
      history: StorageAdapter.getItem<UserProgress[]>('history', []),
      downloads: StorageAdapter.getItem<OfflineBook[]>('downloads', []),
      favorites: StorageAdapter.getItem<string[]>('favorites', []),
      recentSearches: StorageAdapter.getItem<string[]>('recentSearches', []),
      settings: StorageAdapter.getItem<UserSettings>('settings', DEFAULT_SETTINGS),
    });
  },

  setBooks: (books) => set({ books, isLoadingLibrary: false }),
  setLoadingLibrary: (isLoadingLibrary) => set({ isLoadingLibrary }),
  setLibraryError: (libraryError) => set({ libraryError, isLoadingLibrary: false }),

  setCurrentBook: (currentBook, chapterIndex = 0) =>
    set({
      currentBook,
      currentChapterIndex: chapterIndex,
    }),

  setCurrentChapterIndex: (currentChapterIndex) => set({ currentChapterIndex }),

  updatePlaybackState: (partial) =>
    set((state) => ({
      playback: { ...state.playback, ...partial },
    })),

  addBookmark: (newBookmark) =>
    set((state) => {
      const bookmark: Bookmark = {
        ...newBookmark,
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };
      const updated = [bookmark, ...state.bookmarks];
      StorageAdapter.setItem('bookmarks', updated);
      return { bookmarks: updated };
    }),

  removeBookmark: (id) =>
    set((state) => {
      const updated = state.bookmarks.filter((b) => b.id !== id);
      StorageAdapter.setItem('bookmarks', updated);
      return { bookmarks: updated };
    }),

  toggleFavorite: (bookId) =>
    set((state) => {
      const isFav = state.favorites.includes(bookId);
      const updated = isFav
        ? state.favorites.filter((id) => id !== bookId)
        : [...state.favorites, bookId];
      StorageAdapter.setItem('favorites', updated);
      return { favorites: updated };
    }),

  setHistory: (history) => {
    StorageAdapter.setItem('history', history);
    set({ history });
  },

  updateUserProgress: (progress) =>
    set((state) => {
      const existing = state.history.filter((h) => h.bookId !== progress.bookId);
      const updated = [progress, ...existing];
      StorageAdapter.setItem('history', updated);
      return { history: updated };
    }),

  setDownloads: (downloads) => {
    StorageAdapter.setItem('downloads', downloads);
    set({ downloads });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setCurrentView: (currentView) => set({ currentView }),

  addRecentSearch: (term) =>
    set((state) => {
      if (!term.trim()) return state;
      const filtered = state.recentSearches.filter((t) => t.toLowerCase() !== term.toLowerCase());
      const updated = [term.trim(), ...filtered].slice(0, 10);
      StorageAdapter.setItem('recentSearches', updated);
      return { recentSearches: updated };
    }),

  clearRecentSearches: () => {
    StorageAdapter.removeItem('recentSearches');
    set({ recentSearches: [] });
  },

  setSelectedBookIdForModal: (selectedBookIdForModal) => set({ selectedBookIdForModal }),

  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial };
      StorageAdapter.setItem('settings', updated);
      return { settings: updated };
    }),

  clearAllData: () => {
    StorageAdapter.clear();
    set({
      bookmarks: [],
      history: [],
      downloads: [],
      favorites: [],
      recentSearches: [],
      currentBook: null,
      currentChapterIndex: 0,
      selectedBookIdForModal: null,
      settings: DEFAULT_SETTINGS,
    });
  },
}));
