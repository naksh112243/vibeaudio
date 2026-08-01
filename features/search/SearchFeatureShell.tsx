'use client';

import { useState } from 'react';
import { useSearch } from '../../hooks/use-search';
import { usePlayer } from '../../hooks/use-player';
import { useAppStore } from '../../stores/use-app-store';
import { Book } from '../../types/book';
import { Search, X, Filter, Play, Info, Sparkles, BookOpen } from 'lucide-react';

export function SearchFeatureShell() {
  const {
    query,
    setQuery,
    results,
    genres,
    authors,
    selectedGenre,
    setSelectedGenre,
    selectedAuthor,
    setSelectedAuthor,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    clearFilters,
  } = useSearch();

  const { loadAndPlay } = usePlayer();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const [inputVal, setInputVal] = useState(query);

  const handleSearchSubmit = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-orange-500/30 text-orange-300 font-medium px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 px-3 sm:px-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-white/[0.06] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Search Catalog</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Instant search across titles, authors, narrators, and genres.</p>
      </div>

      {/* Main Command-Palette Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, author, narrator, or genre..."
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit(inputVal);
          }}
          className="w-full bg-[#121824] border border-white/10 focus:border-orange-500/80 pl-12 pr-10 py-3.5 rounded-2xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none shadow-lg transition-all"
        />
        {inputVal && (
          <button
            onClick={() => {
              setInputVal('');
              setQuery('');
            }}
            className="absolute right-3.5 p-1 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent Searches Chips */}
      {recentSearches.length > 0 && !query && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">Recent Searches</span>
            <button onClick={clearRecentSearches} className="text-neutral-500 hover:text-neutral-300 transition">
              Clear Recent
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => {
                  setInputVal(term);
                  handleSearchSubmit(term);
                }}
                className="px-3 py-1.5 bg-[#121824] border border-white/[0.08] hover:border-white/[0.2] text-neutral-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-neutral-500" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters (Genre & Author) */}
      <div className="flex flex-wrap gap-3 items-center text-xs pt-1">
        <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-[#121824] border border-white/[0.08] px-3 py-1.5 rounded-lg text-neutral-300 focus:outline-none"
        >
          <option value="" className="bg-[#121824] text-neutral-200">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g} className="bg-[#121824] text-neutral-200">
              {g}
            </option>
          ))}
        </select>

        <select
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
          className="bg-[#121824] border border-white/[0.08] px-3 py-1.5 rounded-lg text-neutral-300 focus:outline-none"
        >
          <option value="" className="bg-[#121824] text-neutral-200">All Authors</option>
          {authors.map((a) => (
            <option key={a} value={a} className="bg-[#121824] text-neutral-200">
              {a}
            </option>
          ))}
        </select>

        {(selectedGenre || selectedAuthor || query) && (
          <button onClick={clearFilters} className="text-orange-400 hover:text-orange-300 font-medium transition">
            Reset All Filters
          </button>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-xs text-neutral-400">
          <h2 className="font-semibold text-neutral-200">
            Results ({results.length})
          </h2>
        </div>

        {results.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 border border-dashed border-white/[0.08] rounded-xl space-y-3">
            <BookOpen className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-medium text-neutral-300">Try another title or explore a different collection.</p>
            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => {
                  setInputVal('Fantasy');
                  setQuery('Fantasy');
                }}
                className="px-3 py-1.5 bg-[#121824] border border-white/[0.08] text-xs text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
              >
                Try "Fantasy"
              </button>
              <button
                onClick={() => {
                  setInputVal('Sci-Fi');
                  setQuery('Sci-Fi');
                }}
                className="px-3 py-1.5 bg-[#121824] border border-white/[0.08] text-xs text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
              >
                Try "Sci-Fi"
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((book: Book, idx: number) => (
              <div
                key={`${book.bookId}_${idx}`}
                className="border border-white/10 rounded-2xl p-3 sm:p-3.5 bg-[#121824] hover:border-white/20 hover-lift transition-all flex gap-3 sm:gap-3.5 shadow-lg group relative"
              >
                <div
                  className="relative overflow-hidden rounded-xl shadow-md bg-neutral-900 shrink-0 cursor-pointer"
                  onClick={() => setSelectedBookIdForModal(book.bookId)}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-16 h-24 sm:w-18 sm:h-28 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex flex-col justify-between min-w-0 flex-1">
                  <div>
                    <h3
                      onClick={() => setSelectedBookIdForModal(book.bookId)}
                      className="font-semibold text-xs text-neutral-100 line-clamp-2 cursor-pointer group-hover:text-orange-400 transition-colors"
                    >
                      {highlightMatch(book.title, query)}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium mt-0.5 line-clamp-1">
                      By {highlightMatch(book.author, query)}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1 block">{book.genre}</span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        loadAndPlay(book);
                        setCurrentView('player');
                      }}
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Listen</span>
                    </button>
                    <button
                      onClick={() => setSelectedBookIdForModal(book.bookId)}
                      className="px-3 py-2 border border-white/10 text-neutral-300 text-xs font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
