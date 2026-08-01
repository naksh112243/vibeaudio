import { useAppStore } from '../stores/use-app-store';
import { ApiClient } from '../services/api/api-client';

export function useHistory() {
  const history = useAppStore((state) => state.history);
  const books = useAppStore((state) => state.books);
  const userId = useAppStore((state) => state.userId);
  const setHistory = useAppStore((state) => state.setHistory);

  const getProgressForBook = (bookId: string) => {
    return history.find((h) => h.bookId === bookId);
  };

  const getHistoryWithBooks = () => {
    return history
      .map((entry) => {
        const book = books.find((b) => b.bookId === entry.bookId);
        return {
          ...entry,
          book,
        };
      })
      .filter((item) => Boolean(item.book));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const syncHistory = async () => {
    if (!userId) return;
    try {
      const remote = await ApiClient.fetchUserProgress(userId);
      setHistory(remote);
    } catch (err) {
      console.warn('Failed to sync history:', err);
    }
  };

  return {
    history,
    getProgressForBook,
    getHistoryWithBooks,
    clearHistory,
    syncHistory,
  };
}
