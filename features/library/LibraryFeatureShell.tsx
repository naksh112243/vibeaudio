'use client';

import { useState, useMemo } from 'react';
import { useCatalog } from '../../hooks/use-catalog';
import { usePlayer } from '../../hooks/use-player';
import { useDownloads } from '../../hooks/use-downloads';
import { useHistory } from '../../hooks/use-history';
import { useAppStore } from '../../stores/use-app-store';
import { Book } from '../../types/book';
import {
  Grid,
  List,
  Heart,
  Play,
  Pause,
  Download,
  CheckCircle2,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';

type LibraryTab = 'all' | 'favorites' | 'downloaded' | 'continue' | 'completed';
type SortOption = 'title' | 'author' | 'chapters';

export function LibraryFeatureShell() {
  const { data: books, isLoading, error } = useCatalog();
  const { loadAndPlay, currentBook, playback, togglePlay } = usePlayer();
  const { isBookDownloaded, startDownload } = useDownloads();
  const { history } = useHistory();

  const selectedCategory = useAppStore((state) => state.selectedCategory);
  const setSelectedCategory = useAppStore((state) => state.setSelectedCategory);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('title');

  const genres = ['All', ...Array.from(new Set(books?.map((b) => b.genre).filter(Boolean) || []))];

  // Tab & Genre Filtered Books
  const processedBooks = useMemo(() => {
    if (!books) return [];

    let result = [...books];

    // Filter by Genre
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((b) => b.genre.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Active Tab
    if (activeTab === 'favorites') {
      result = result.filter((b) => favorites.includes(b.bookId));
    } else if (activeTab === 'downloaded') {
      result = result.filter((b) => isBookDownloaded(b.bookId));
    } else if (activeTab === 'continue') {
      const historyIds = history.filter((h) => !h.completed).map((h) => h.bookId);
      result = result.filter((b) => historyIds.includes(b.bookId));
    } else if (activeTab === 'completed') {
      const completedIds = history.filter((h) => h.completed).map((h) => h.bookId);
      result = result.filter((b) => completedIds.includes(b.bookId));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'chapters') return (b.totalChapters || 0) - (a.totalChapters || 0);
      return 0;
    });

    return result;
  }, [books, selectedCategory, activeTab, sortBy, favorites, history, isBookDownloaded]);

  return (
    <div className="space-y-6 px-3 sm:px-8 max-w-6xl mx-auto">
      {/* Title & View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Library</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Your calm bookshelf of stories and knowledge.</p>
        </div>

        {/* View Mode & Sort Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex border border-white/[0.08] rounded-lg bg-[#121824] p-0.5 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121824] border border-white/[0.08] px-3 py-1.5 rounded-lg text-xs text-neutral-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs text-neutral-200 focus:outline-none"
            >
              <option value="title" className="bg-[#121824] text-neutral-200">Title (A-Z)</option>
              <option value="author" className="bg-[#121824] text-neutral-200">Author (A-Z)</option>
              <option value="chapters" className="bg-[#121824] text-neutral-200">Chapters</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Library Tabs */}
      <div className="flex border-b border-white/[0.06] space-x-4 sm:space-x-6 text-xs font-medium overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All Books (${books?.length || 0})` },
          { id: 'favorites', label: `Favorites (${favorites.length})` },
          { id: 'continue', label: 'Continue Listening' },
          { id: 'downloaded', label: 'Downloaded' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as LibraryTab)}
            className={`pb-3 transition border-b-2 font-semibold whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Genre Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedCategory(genre)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedCategory === genre
                ? 'bg-neutral-200 text-neutral-900 shadow-sm'
                : 'bg-[#121824] border border-white/[0.08] text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse p-3 border border-white/[0.04] bg-[#121824] rounded-xl space-y-3">
              <div className="bg-neutral-800 aspect-[2/3] rounded-lg" />
              <div className="bg-neutral-800 h-3 w-3/4 rounded" />
              <div className="bg-neutral-800 h-2 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-300 text-xs rounded-lg">
          Library Error: {(error as Error).message}
        </div>
      )}

      {/* Empty Tab State */}
      {!isLoading && processedBooks.length === 0 && (
        <div className="py-16 text-center text-neutral-400 border border-dashed border-white/[0.08] rounded-xl space-y-2">
          <BookOpen className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm font-medium text-neutral-300">Try another title or explore a different collection.</p>
          <p className="text-xs text-neutral-500">No audiobooks found for the current selection.</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && processedBooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {processedBooks.map((book: Book, idx: number) => {
            const isCurrent = currentBook?.bookId === book.bookId;
            const downloaded = isBookDownloaded(book.bookId);
            const isFav = favorites.includes(book.bookId);

            return (
              <div
                key={`${book.bookId}_${idx}`}
                className="border border-white/10 rounded-2xl p-2.5 sm:p-3.5 bg-[#121824] hover:border-white/20 hover-lift transition-all flex flex-col justify-between shadow-lg group relative"
              >
                <div>
                  <div
                    className="relative cursor-pointer overflow-hidden rounded-xl mb-3 shadow-md bg-neutral-900"
                    onClick={() => setSelectedBookIdForModal(book.bookId)}
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full aspect-[2/3] object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book.bookId);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 active:scale-90 transition shadow-md border border-white/10"
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-neutral-300'}`} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-xs text-neutral-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-medium line-clamp-1 mt-0.5">{book.author}</p>
                  <p className="text-[10px] text-neutral-500 mt-1 font-mono">{book.genre} • {book.totalChapters} Ch.</p>
                </div>

                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => {
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        loadAndPlay(book);
                      }
                      setCurrentView('player');
                    }}
                    className="flex-1 py-2 text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-center transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isCurrent && playback.isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedBookIdForModal(book.bookId)}
                    className="px-3 py-2 text-xs border border-white/10 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-colors font-medium"
                  >
                    Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && processedBooks.length > 0 && (
        <div className="space-y-2.5">
          {processedBooks.map((book: Book, idx: number) => {
            const isCurrent = currentBook?.bookId === book.bookId;
            const downloaded = isBookDownloaded(book.bookId);
            const isFav = favorites.includes(book.bookId);

            return (
              <div
                key={`${book.bookId}_${idx}`}
                className="p-3 border border-white/[0.08] rounded-xl bg-[#121824] flex items-center justify-between gap-4 hover:border-white/[0.16] transition-all"
              >
                <div
                  className="flex items-center gap-3.5 cursor-pointer min-w-0 flex-1 group"
                  onClick={() => setSelectedBookIdForModal(book.bookId)}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded-lg bg-neutral-900 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-medium text-xs text-neutral-100 truncate group-hover:text-orange-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate">By {book.author}</p>
                    <p className="text-[10px] text-neutral-500">
                      {book.genre} • {book.totalChapters} Chapters
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleFavorite(book.bookId)}
                    className="p-2 border border-white/[0.08] rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    aria-label="Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (isCurrent) {
                        togglePlay();
                      } else {
                        loadAndPlay(book);
                      }
                      setCurrentView('player');
                    }}
                    className="px-4 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    {isCurrent && playback.isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startDownload(book)}
                    disabled={downloaded}
                    className="p-2 border border-white/[0.08] text-neutral-300 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition"
                    title={downloaded ? 'Downloaded' : 'Download for offline'}
                    aria-label="Download"
                  >
                    {downloaded ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
