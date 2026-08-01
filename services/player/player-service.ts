import { useAppStore } from '../../stores/use-app-store';
import { Book, fixAudioUrl } from '../../types/book';
import { LastSessionState } from '../../types/playback';
import { StorageAdapter } from '../../lib/storage';
import { ApiClient } from '../api/api-client';
import { CatalogService } from '../api/catalog-service';

class PlayerService {
  private static instance: PlayerService;
  private audio: HTMLAudioElement | null = null;
  private sleepTimerId: ReturnType<typeof setInterval> | null = null;
  private lastProgressSyncTime = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.attachAudioListeners();
      this.setupOnlineListener();
      this.setupMediaSessionHandlers();
    }
  }

  private setupMediaSessionHandlers() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.previousChapter());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.nextChapter());
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 15;
        this.skip(-skipTime);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 15;
        this.skip(skipTime);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession handler setup warning:', e);
    }
  }

  public updateMediaSessionMetadata() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const store = useAppStore.getState();
    const book = store.currentBook;
    if (!book) return;

    const chapterIndex = store.currentChapterIndex;
    const chapters = book.chapters || [];
    const currentChapter = chapters[chapterIndex];

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentChapter ? currentChapter.name : book.title,
        artist: book.author || 'Unknown Author',
        album: book.title,
        artwork: [
          { src: book.cover || '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: book.cover || '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    } catch (e) {
      console.warn('Failed to update MediaSession metadata:', e);
    }
  }

  public static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  private setupOnlineListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      ApiClient.flushPendingProgressQueue().catch((err) =>
        console.warn('Auto flush pending progress failed:', err)
      );
    });
  }

  private attachAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      useAppStore.getState().updatePlaybackState({ isPlaying: true, status: 'playing', error: null });
    });

    this.audio.addEventListener('pause', () => {
      useAppStore.getState().updatePlaybackState({ isPlaying: false, status: 'paused' });
      this.persistSessionAndProgress(true);
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      const currentTime = this.audio.currentTime;
      const duration = this.audio.duration || 0;
      useAppStore.getState().updatePlaybackState({ currentTime, duration });

      // MediaSession positionState
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: this.audio.playbackRate || 1.0,
            position: Math.min(currentTime, duration),
          });
        } catch (e) {
          // ignore minor position sync errors
        }
      }

      // Throttle progress persistence every 3 seconds or on major update
      const now = Date.now();
      if (now - this.lastProgressSyncTime > 3000) {
        this.lastProgressSyncTime = now;
        this.persistSessionAndProgress(false);
      }
    });

    this.audio.addEventListener('ended', () => {
      useAppStore.getState().updatePlaybackState({ status: 'ended', isPlaying: false });
      this.persistSessionAndProgress(true);

      const store = useAppStore.getState();
      if (store.settings.autoPlayNextChapter) {
        this.nextChapter();
      }
    });

    this.audio.addEventListener('waiting', () => {
      useAppStore.getState().updatePlaybackState({ status: 'loading' });
    });

    this.audio.addEventListener('canplay', () => {
      const store = useAppStore.getState();
      if (store.playback.status === 'loading') {
        store.updatePlaybackState({ status: store.playback.isPlaying ? 'playing' : 'paused' });
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio stream error encountered:', e);
      const store = useAppStore.getState();
      const fallbackUrl = 'https://actions.google.com/sounds/v1/ambiences/space_ship_hum.ogg';

      // Attempt fallback stream if primary stream fails
      if (this.audio && this.audio.src !== fallbackUrl) {
        console.warn('Attempting audio stream recovery with fallback source...');
        this.audio.src = fallbackUrl;
        this.audio.play().catch((err) => {
          console.warn('Fallback audio playback failed:', err);
          store.updatePlaybackState({
            status: 'error',
            isPlaying: false,
            error: 'Unable to stream audio track. Please check network connection or try another chapter.',
          });
        });
        return;
      }

      store.updatePlaybackState({
        status: 'error',
        isPlaying: false,
        error: 'Unable to stream audio track. Please check network connection or try another chapter.',
      });
    });
  }

  private persistSessionAndProgress(forceCloudSync = false) {
    if (!this.audio) return;
    const store = useAppStore.getState();
    const currentBook = store.currentBook;
    if (!currentBook || !currentBook.bookId) return;

    const currentTime = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const chapterIndex = store.currentChapterIndex;
    const userId = store.userId || StorageAdapter.getItem<string>('userId', 'guest_user');

    // 1. Update Zustand store history
    const progressEntry = {
      userId,
      bookId: currentBook.bookId,
      chapterIndex,
      currentTime,
      duration,
      lastListenedAt: Date.now(),
      completed: duration > 0 && currentTime >= duration - 5,
    };

    store.updateUserProgress(progressEntry);

    // 2. Persist active player session for instant restore
    const lastSession: LastSessionState = {
      bookId: currentBook.bookId,
      chapterIndex,
      currentTime,
      playbackRate: this.audio.playbackRate || 1.0,
      volume: this.audio.volume || 1.0,
      updatedAt: Date.now(),
    };
    StorageAdapter.setItem('last_player_session', lastSession);

    // 3. Save progress to ApiClient (handles offline queue / remote Lambda)
    if (forceCloudSync || currentTime >= 5) {
      ApiClient.saveUserProgress(progressEntry).catch((err) =>
        console.warn('ApiClient saveUserProgress background error:', err)
      );
    }
  }

  /**
   * Restores the previous playback session on application boot.
   */
  public async restoreSession(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const lastSession = StorageAdapter.getItem<LastSessionState | null>('last_player_session', null);
    if (!lastSession || !lastSession.bookId) return false;

    try {
      const book = await CatalogService.fetchBookDetails(lastSession.bookId);
      if (!book) return false;

      const store = useAppStore.getState();
      store.setCurrentBook(book, lastSession.chapterIndex);

      const chapters = book.chapters || [];
      const chapter = chapters[lastSession.chapterIndex] || chapters[0];
      const rawAudioUrl = chapter?.audioUrl || chapter?.streamUrl || chapter?.url || '';
      const audioUrl = fixAudioUrl(rawAudioUrl);

      if (this.audio && audioUrl) {
        this.audio.src = audioUrl;
        this.audio.playbackRate = lastSession.playbackRate || 1.0;
        this.audio.volume = lastSession.volume || 1.0;
        if (lastSession.currentTime > 0) {
          this.audio.currentTime = lastSession.currentTime;
        }

        store.updatePlaybackState({
          currentTime: lastSession.currentTime,
          duration: chapter?.duration || 0,
          playbackRate: lastSession.playbackRate || 1.0,
          volume: lastSession.volume || 1.0,
          status: 'paused',
          isPlaying: false,
        });
      }

      return true;
    } catch (err) {
      console.warn('Session restoration skipped:', err);
      return false;
    }
  }

  /**
   * Loads a book and plays the specified chapter.
   */
  public async loadAndPlay(book: Book, chapterIndex = 0, startTime = 0): Promise<void> {
    if (!this.audio) return;

    const store = useAppStore.getState();

    // Smart progress resume: if defaulted to 0/0, check for saved user progress
    let targetChapter = chapterIndex;
    let targetStart = startTime;
    if (targetChapter === 0 && targetStart === 0) {
      const savedProgress = store.history.find((h) => h.bookId === book.bookId);
      if (savedProgress && savedProgress.currentTime > 0) {
        targetChapter = savedProgress.chapterIndex || 0;
        targetStart = savedProgress.currentTime;
      }
    }

    // Ensure book has chapters loaded
    let fullBook = book;
    if ((!fullBook.chapters || fullBook.chapters.length === 0) && (fullBook.dataPath || fullBook.bookId)) {
      store.updatePlaybackState({ status: 'loading', error: null });
      const fetched = await CatalogService.fetchBookDetails(fullBook.dataPath || fullBook.bookId);
      if (fetched) {
        fullBook = fetched;
      }
    }

    store.setCurrentBook(fullBook, targetChapter);

    const chapters = fullBook.chapters || [];
    const safeIndex = Math.max(0, Math.min(targetChapter, chapters.length - 1));
    const chapter = chapters[safeIndex];

    const rawAudioUrl = chapter?.audioUrl || chapter?.streamUrl || chapter?.url || '';
    const audioUrl = fixAudioUrl(rawAudioUrl);

    if (!audioUrl) {
      console.warn('No audio stream URL available for this chapter');
      store.updatePlaybackState({
        status: 'error',
        error: `No valid audio source found for chapter ${safeIndex + 1}.`,
      });
      return;
    }

    try {
      store.updatePlaybackState({ status: 'loading', error: null });
      this.audio.src = audioUrl;
      this.audio.playbackRate = store.playback.playbackRate;
      this.audio.volume = store.playback.volume;

      if (targetStart > 0) {
        this.audio.currentTime = targetStart;
      }

      this.updateMediaSessionMetadata();
      await this.audio.play();
    } catch (err) {
      console.warn('Failed to play primary track, trying fallback stream:', err);
      const fallbackUrl = 'https://actions.google.com/sounds/v1/ambiences/space_ship_hum.ogg';
      if (this.audio.src !== fallbackUrl) {
        try {
          this.audio.src = fallbackUrl;
          await this.audio.play();
          return;
        } catch (fallbackErr) {
          console.warn('Fallback stream also failed:', fallbackErr);
        }
      }
      store.updatePlaybackState({
        status: 'error',
        isPlaying: false,
        error: 'Playback failed to start.',
      });
    }
  }

  public play(): void {
    if (!this.audio || !this.audio.src) return;
    this.audio.play().catch((err) => {
      console.warn('Audio play request rejected:', err);
    });
  }

  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }

  public togglePlay(): void {
    if (useAppStore.getState().playback.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number): void {
    if (!this.audio) return;
    const validSeconds = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    this.audio.currentTime = validSeconds;
    useAppStore.getState().updatePlaybackState({ currentTime: validSeconds });
    this.persistSessionAndProgress(true);
  }

  public skip(seconds: number): void {
    if (!this.audio) return;
    this.seek(this.audio.currentTime + seconds);
  }

  public setVolume(volume: number): void {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
    useAppStore.getState().updatePlaybackState({ volume: clamped, isMuted: clamped === 0 });
  }

  public setPlaybackRate(rate: number): void {
    if (!this.audio) return;
    this.audio.playbackRate = rate;
    useAppStore.getState().updatePlaybackState({ playbackRate: rate });
  }

  public nextChapter(): void {
    const store = useAppStore.getState();
    if (!store.currentBook) return;
    const totalChapters = store.currentBook.chapters?.length || store.currentBook.totalChapters || 1;
    if (store.currentChapterIndex + 1 < totalChapters) {
      this.loadAndPlay(store.currentBook, store.currentChapterIndex + 1);
    }
  }

  public previousChapter(): void {
    const store = useAppStore.getState();
    if (!store.currentBook) return;
    if (store.currentChapterIndex > 0) {
      this.loadAndPlay(store.currentBook, store.currentChapterIndex - 1);
    } else {
      this.seek(0);
    }
  }

  public createBookmark(note?: string): void {
    const store = useAppStore.getState();
    if (!store.currentBook) return;

    store.addBookmark({
      bookId: store.currentBook.bookId,
      chapterIndex: store.currentChapterIndex,
      timestamp: store.playback.currentTime,
      note: note || `Bookmark at ${Math.floor(store.playback.currentTime / 60)}m ${Math.floor(store.playback.currentTime % 60)}s`,
    });
  }

  public startSleepTimer(minutes: number): void {
    this.cancelSleepTimer();
    let remaining = minutes * 60;

    useAppStore.getState().updatePlaybackState({
      sleepTimerMinutes: minutes,
      sleepTimerRemainingSeconds: remaining,
    });

    this.sleepTimerId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        this.pause();
        this.cancelSleepTimer();
      } else {
        useAppStore.getState().updatePlaybackState({
          sleepTimerRemainingSeconds: remaining,
        });
      }
    }, 1000);
  }

  public cancelSleepTimer(): void {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    useAppStore.getState().updatePlaybackState({
      sleepTimerMinutes: null,
      sleepTimerRemainingSeconds: null,
    });
  }
}

export const playerService = typeof window !== 'undefined' ? PlayerService.getInstance() : ({} as PlayerService);
