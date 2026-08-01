import { useAppStore } from '../stores/use-app-store';
import { playerService } from '../services/player/player-service';
import { Book } from '../types/book';

export function usePlayer() {
  const currentBook = useAppStore((state) => state.currentBook);
  const currentChapterIndex = useAppStore((state) => state.currentChapterIndex);
  const playback = useAppStore((state) => state.playback);

  const currentChapter = currentBook?.chapters?.[currentChapterIndex] || null;

  return {
    currentBook,
    currentChapterIndex,
    currentChapter,
    playback,

    // Imperative actions delegated exclusively to PlayerService
    loadAndPlay: (book: Book, chapterIndex = 0, startTime = 0) =>
      playerService.loadAndPlay(book, chapterIndex, startTime),
    play: () => playerService.play(),
    pause: () => playerService.pause(),
    togglePlay: () => playerService.togglePlay(),
    seek: (seconds: number) => playerService.seek(seconds),
    skip: (seconds: number) => playerService.skip(seconds),
    setVolume: (volume: number) => playerService.setVolume(volume),
    setPlaybackRate: (rate: number) => playerService.setPlaybackRate(rate),
    nextChapter: () => playerService.nextChapter(),
    previousChapter: () => playerService.previousChapter(),
    createBookmark: (note?: string) => playerService.createBookmark(note),
    startSleepTimer: (minutes: number) => playerService.startSleepTimer(minutes),
    cancelSleepTimer: () => playerService.cancelSleepTimer(),
  };
}
