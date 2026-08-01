import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/use-app-store';

export function useSearch() {
  const books = useAppStore((state) => state.books);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const recentSearches = useAppStore((state) => state.recentSearches);
  const addRecentSearch = useAppStore((state) => state.addRecentSearch);
  const clearRecentSearches = useAppStore((state) => state.clearRecentSearches);

  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');

  const filteredBooks = useMemo(() => {
    let result = books;

    if (selectedGenre) {
      result = result.filter((b) => b.genre.toLowerCase() === selectedGenre.toLowerCase());
    }

    if (selectedAuthor) {
      result = result.filter((b) => b.author.toLowerCase() === selectedAuthor.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.narrator && b.narrator.toLowerCase().includes(q)) ||
          b.genre.toLowerCase().includes(q) ||
          b.moods.some((m) => m.toLowerCase().includes(q))
      );
    }

    return result;
  }, [books, searchQuery, selectedGenre, selectedAuthor]);

  const genres = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.genre).filter(Boolean)));
  }, [books]);

  const authors = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.author).filter(Boolean)));
  }, [books]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedAuthor('');
  };

  return {
    query: searchQuery,
    searchQuery,
    setQuery: setSearchQuery,
    setSearchQuery,
    results: filteredBooks,
    filteredBooks,
    genres,
    categories: ['All', ...genres],
    authors,
    selectedGenre,
    setSelectedGenre,
    selectedAuthor,
    setSelectedAuthor,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    clearFilters,
  };
}
