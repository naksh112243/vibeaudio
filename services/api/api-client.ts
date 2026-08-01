import { normalizeBook, Book } from '../../types/book';
import { normalizeProgress, UserProgress } from '../../types/user';
import { StorageAdapter } from '../../lib/storage';

export const BACKEND_CONFIG = {
  catalogBaseUrl: 'https://vibeaudio-db.pages.dev',
  progressUrl: 'https://rrsv2aw64zkkgpdhkamz57ftr40tchro.lambda-url.ap-south-1.on.aws/',
  getProgressUrl: 'https://2wc6byruxj32gfzka622p22pju0qitcw.lambda-url.ap-south-1.on.aws/',
  syncUserUrl: 'https://aj7bwk3d72tzj5n2r43lusryg40tosik.lambda-url.ap-south-1.on.aws/',
};

export const DEMO_BOOKS: Book[] = [
  {
    bookId: 'demo-1',
    title: 'The Silent Cosmos',
    author: 'Aria Solen',
    narrator: 'David Case',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Science Fiction',
    moods: ['Atmospheric', 'Deep Space'],
    duration: 3600,
    totalChapters: 3,
    description: 'A thrilling journey through the outer rim of the known universe.',
    chapters: [
      { chapterId: 'ch-1', index: 0, name: 'Chapter 1: The Void', duration: 1200, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/space_ship_hum.ogg' },
      { chapterId: 'ch-2', index: 1, name: 'Chapter 2: Signals', duration: 1200, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/wind_synth.ogg' },
      { chapterId: 'ch-3', index: 2, name: 'Chapter 3: Contact', duration: 1200, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/sub_hum.ogg' }
    ]
  },
  {
    bookId: 'demo-2',
    title: 'Echoes of the Past',
    author: 'Julian Vance',
    narrator: 'Sarah Vowell',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400&h=600',
    genre: 'Historical Fiction',
    moods: ['Reflective', 'Emotional'],
    duration: 4800,
    totalChapters: 3,
    description: "A heartfelt story of a family's journey through time, discovering secrets that change their lives forever.",
    chapters: [
      { chapterId: 'ch-1', index: 0, name: 'Part 1: The Beginning', duration: 1600, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg' },
      { chapterId: 'ch-2', index: 1, name: 'Part 2: The Middle', duration: 1600, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
      { chapterId: 'ch-3', index: 2, name: 'Part 3: The End', duration: 1600, audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg' }
    ]
  }
];

export interface FetchOptions extends RequestInit {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
}


function ensureUniqueBookIds(books: Book[]): Book[] {
  const seen = new Set<string>();
  return books.map((book, idx) => {
    let id = book.bookId;
    if (!id || seen.has(id)) {
      id = `${id || 'book'}_${idx}`;
    }
    seen.add(id);
    return { ...book, bookId: id };
  });
}

export class ApiClient {
  private static bookCache = new Map<string, Book>();

  /**
   * Helper method for robust fetching with retries, timeout, and signal support.
   */
  public static async fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
    const { retries = 2, backoffMs = 500, timeoutMs = 8000, signal, ...init } = options;

    let attempt = 0;
    while (attempt <= retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Combine signals if external signal is provided
      const onExternalAbort = () => controller.abort();
      if (signal) {
        if (signal.aborted) {
          clearTimeout(timeoutId);
          throw new DOMException('Aborted', 'AbortError');
        }
        signal.addEventListener('abort', onExternalAbort);
      }

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', onExternalAbort);

        if (response.ok) return response;

        // Don't retry client errors (4xx) except 429
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', onExternalAbort);

        const isAbort = (err as Error)?.name === 'AbortError' || signal?.aborted;
        if (isAbort || attempt === retries) {
          throw err;
        }
      }

      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1)));
    }

    throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
  }

  /**
   * Fetches the entire audiobook catalog.
   */
  public static async fetchCatalog(signal?: AbortSignal): Promise<Book[]> {
    try {
      // 1. Try Next.js internal API handler
      const res = await this.fetchWithRetry('/api/catalog', { retries: 1, timeoutMs: 5000, signal });
      const rawData = await res.json();
      const items = Array.isArray(rawData) ? rawData : rawData.books || [];
      if (items.length > 0) {
        const normalized = ensureUniqueBookIds(items.map(normalizeBook));
        StorageAdapter.setItem('catalog_snapshot', normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('API /api/catalog failed, trying direct remote fallback:', err);
    }

    try {
      // 2. Direct remote fallback
      const remoteRes = await this.fetchWithRetry(`${BACKEND_CONFIG.catalogBaseUrl}/catalog.json`, { retries: 2, timeoutMs: 7000, signal });
      const rawRemote = await remoteRes.json();
      const items = Array.isArray(rawRemote) ? rawRemote : rawRemote.books || [];
      if (items.length > 0) {
        const normalized = ensureUniqueBookIds(items.map(normalizeBook));
        StorageAdapter.setItem('catalog_snapshot', normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Remote catalog fetch failed:', err);
    }

    // 3. LocalStorage snapshot fallback
    const snapshot = StorageAdapter.getItem<Book[]>('catalog_snapshot', []);
    if (snapshot && snapshot.length > 0) {
      return snapshot;
    }

    // 4. Demo dataset fallback
    return DEMO_BOOKS;
  }

  /**
   * Fetches detailed book metadata including chapters.
   */
  public static async fetchBookDetails(dataPathOrId: string, signal?: AbortSignal): Promise<Book | null> {
    if (!dataPathOrId) return null;

    if (this.bookCache.has(dataPathOrId)) {
      return this.bookCache.get(dataPathOrId)!;
    }

    // Check localStorage cache
    const cacheKey = `book_detail_${encodeURIComponent(dataPathOrId)}`;
    const cached = StorageAdapter.getItem<Book | null>(cacheKey, null);
    if (cached) {
      this.bookCache.set(dataPathOrId, cached);
    }

    const isUrl = dataPathOrId.startsWith('http://') || dataPathOrId.startsWith('https://');
    const rawTarget = isUrl ? dataPathOrId : `${BACKEND_CONFIG.catalogBaseUrl}/${dataPathOrId.replace(/^\//, '')}`;
    const fetchTarget = encodeURI(rawTarget);

    try {
      const res = await this.fetchWithRetry(fetchTarget, { retries: 2, timeoutMs: 6000, signal });
      const rawData = await res.json();
      const normalized = normalizeBook(rawData);

      this.bookCache.set(dataPathOrId, normalized);
      StorageAdapter.setItem(cacheKey, normalized);
      return normalized;
    } catch (err) {
      console.warn(`Failed to fetch book details from ${fetchTarget}, returning cached or null`, err);
      return this.bookCache.get(dataPathOrId) || cached;
    }
  }

  /**
   * Fetches user progress history from Lambda backend merged with LocalStorage.
   */
  public static async fetchUserProgress(userId: string, signal?: AbortSignal): Promise<UserProgress[]> {
    if (!userId) return StorageAdapter.getItem<UserProgress[]>('history', []);

    const localHistory = StorageAdapter.getItem<UserProgress[]>('history', []);
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return localHistory;
    }

    try {
      const url = `${BACKEND_CONFIG.getProgressUrl}?userId=${encodeURIComponent(userId)}`;
      const res = await this.fetchWithRetry(url, { retries: 1, timeoutMs: 5000, signal });
      const data = await res.json();
      const rawList = Array.isArray(data?.progress) ? data.progress : Array.isArray(data) ? data : [];

      const cloudProgress = rawList.map(normalizeProgress);
      const mergedMap = new Map<string, UserProgress>();

      cloudProgress.forEach((p) => mergedMap.set(p.bookId, p));
      localHistory.forEach((loc) => {
        const cloud = mergedMap.get(loc.bookId);
        if (!cloud || loc.lastListenedAt >= cloud.lastListenedAt) {
          mergedMap.set(loc.bookId, loc);
        }
      });

      const merged = Array.from(mergedMap.values()).sort((a, b) => b.lastListenedAt - a.lastListenedAt);
      StorageAdapter.setItem('history', merged);
      return merged;
    } catch (err) {
      console.warn('Failed to fetch remote user progress, using local progress:', err);
      return localHistory;
    }
  }

  /**
   * Saves user progress locally and posts to Lambda if online.
   */
  public static async saveUserProgress(progress: UserProgress): Promise<void> {
    const history = StorageAdapter.getItem<UserProgress[]>('history', []);
    const filtered = history.filter((h) => h.bookId !== progress.bookId);
    const updatedHistory = [progress, ...filtered];
    StorageAdapter.setItem('history', updatedHistory);

    if (typeof window !== 'undefined' && !navigator.onLine) {
      const pending = StorageAdapter.getItem<UserProgress[]>('pending_progress_queue', []);
      const pendingFiltered = pending.filter((p) => p.bookId !== progress.bookId);
      StorageAdapter.setItem('pending_progress_queue', [progress, ...pendingFiltered]);
      return;
    }

    try {
      await this.fetchWithRetry(BACKEND_CONFIG.progressUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: progress.userId,
          bookId: progress.bookId,
          chapterIndex: progress.chapterIndex,
          currentTime: progress.currentTime,
          totalDuration: progress.duration,
          lastInteractionAt: new Date(progress.lastListenedAt).toISOString(),
          bookFinished: progress.completed,
        }),
        retries: 1,
        timeoutMs: 4000,
      });

      // Remove from pending queue if present
      const pending = StorageAdapter.getItem<UserProgress[]>('pending_progress_queue', []);
      const remaining = pending.filter((p) => p.bookId !== progress.bookId);
      StorageAdapter.setItem('pending_progress_queue', remaining);
    } catch (err) {
      console.warn('Failed to save progress to cloud Lambda, queued for later retry:', err);
      const pending = StorageAdapter.getItem<UserProgress[]>('pending_progress_queue', []);
      const pendingFiltered = pending.filter((p) => p.bookId !== progress.bookId);
      StorageAdapter.setItem('pending_progress_queue', [progress, ...pendingFiltered]);
    }
  }

  /**
   * Flushes offline pending progress items when connection is restored.
   */
  public static async flushPendingProgressQueue(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const pending = StorageAdapter.getItem<UserProgress[]>('pending_progress_queue', []);
    if (pending.length === 0) return;

    const remaining: UserProgress[] = [];

    for (const item of pending) {
      try {
        await this.fetchWithRetry(BACKEND_CONFIG.progressUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: item.userId,
            bookId: item.bookId,
            chapterIndex: item.chapterIndex,
            currentTime: item.currentTime,
            totalDuration: item.duration,
            lastInteractionAt: new Date(item.lastListenedAt).toISOString(),
            bookFinished: item.completed,
          }),
          retries: 1,
          timeoutMs: 4000,
        });
      } catch (err) {
        console.warn(`Failed to flush pending progress for ${item.bookId}:`, err);
        remaining.push(item);
      }
    }

    StorageAdapter.setItem('pending_progress_queue', remaining);
  }

  /**
   * Syncs user profile metadata to backend.
   */
  public static async syncUserProfile(userId: string, name: string): Promise<void> {
    if (!userId || (typeof window !== 'undefined' && !navigator.onLine)) return;
    try {
      await this.fetchWithRetry(BACKEND_CONFIG.syncUserUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, action: 'sync' }),
        retries: 1,
        timeoutMs: 3000,
      });
    } catch (err) {
      console.warn('Profile sync failed:', err);
    }
  }
}
