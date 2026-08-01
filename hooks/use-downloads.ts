import { useAppStore } from '../stores/use-app-store';
import { Book } from '../types/book';
import { OfflineBook, OfflineChapter } from '../types/user';

export function useDownloads() {
  const downloads = useAppStore((state) => state.downloads);
  const setDownloads = useAppStore((state) => state.setDownloads);

  const isBookDownloaded = (bookId: string) => {
    return downloads.some((d) => d.bookId === bookId && d.status === 'downloaded');
  };

  const getDownloadState = (bookId: string) => {
    return downloads.find((d) => d.bookId === bookId);
  };

  const removeDownload = (bookId: string) => {
    const updated = downloads.filter((d) => d.bookId !== bookId);
    setDownloads(updated);
  };

  const startDownload = async (book: Book) => {
    const chapters = book.chapters || [];
    const totalChaptersCount = chapters.length || book.totalChapters || 1;

    const offlineChapters: OfflineChapter[] = chapters.map((ch, idx) => ({
      chapterIndex: idx,
      chapterName: ch.name || `Chapter ${idx + 1}`,
      sizeBytes: 1024 * 1024 * 5, // ~5MB per chapter
      downloadedAt: Date.now(),
    }));

    const newDownload: OfflineBook = {
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      cover: book.cover,
      status: 'downloading',
      progress: 10,
      downloadedChapters: [],
      totalSizeBytes: totalChaptersCount * 1024 * 1024 * 5,
      downloadedAt: Date.now(),
    };

    // Update store with initial downloading state
    const existing = downloads.filter((d) => d.bookId !== book.bookId);
    setDownloads([newDownload, ...existing]);

    // Simulate progressive download steps
    setTimeout(() => {
      const current = useAppStore.getState().downloads.find((d) => d.bookId === book.bookId);
      if (!current || current.status === 'paused') return;

      const completedDownload: OfflineBook = {
        ...newDownload,
        status: 'downloaded',
        progress: 100,
        downloadedChapters: offlineChapters,
      };

      const updated = useAppStore.getState().downloads.map((d) =>
        d.bookId === book.bookId ? completedDownload : d
      );
      setDownloads(updated);
    }, 1500);
  };

  const pauseDownload = (bookId: string) => {
    const updated = downloads.map((d) =>
      d.bookId === bookId ? { ...d, status: 'paused' as const } : d
    );
    setDownloads(updated);
  };

  const resumeDownload = (bookId: string) => {
    const updated = downloads.map((d) =>
      d.bookId === bookId ? { ...d, status: 'downloading' as const, progress: 100, statusText: 'downloaded' as const } : d
    );
    setDownloads(updated);
    // Complete download after resume
    setTimeout(() => {
      const latest = useAppStore.getState().downloads.map((d) =>
        d.bookId === bookId ? { ...d, status: 'downloaded' as const, progress: 100 } : d
      );
      setDownloads(latest);
    }, 1000);
  };

  return {
    downloads,
    isBookDownloaded,
    getDownloadState,
    startDownload,
    removeDownload,
    pauseDownload,
    resumeDownload,
  };
}
