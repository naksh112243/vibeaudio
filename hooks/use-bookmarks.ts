import { useAppStore } from '../stores/use-app-store';

export function useBookmarks() {
  const bookmarks = useAppStore((state) => state.bookmarks);
  const addBookmark = useAppStore((state) => state.addBookmark);
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const currentBook = useAppStore((state) => state.currentBook);
  const currentChapterIndex = useAppStore((state) => state.currentChapterIndex);
  const playback = useAppStore((state) => state.playback);

  const saveCurrentMoment = (note?: string) => {
    if (!currentBook) return;
    addBookmark({
      bookId: currentBook.bookId,
      chapterIndex: currentChapterIndex,
      timestamp: playback.currentTime,
      note,
    });
  };

  const getBookmarksForBook = (bookId: string) => {
    return bookmarks.filter((b) => b.bookId === bookId);
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    saveCurrentMoment,
    getBookmarksForBook,
  };
}
