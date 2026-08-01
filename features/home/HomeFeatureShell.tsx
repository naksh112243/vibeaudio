'use client';

import { useCatalog } from '../../hooks/use-catalog';
import { usePlayer } from '../../hooks/use-player';
import { useHistory } from '../../hooks/use-history';
import { useAppStore } from '../../stores/use-app-store';
import { Book } from '../../types/book';
import { Play, Pause, Info, Sparkles, ChevronRight, BookOpen } from 'lucide-react';

export function HomeFeatureShell() {
  const { data: books, isLoading, error } = useCatalog();
  const { loadAndPlay, currentBook, playback, togglePlay } = usePlayer();
  const { getHistoryWithBooks } = useHistory();

  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const historyItems = getHistoryWithBooks();
  const lastListened = historyItems[0];
  const hasHistory = historyItems.length > 0;

  // Categorize catalog books
  const recommendedBooks = books?.slice(0, 6) || [];
  const recentlyAdded = books?.slice(6, 12) || books?.slice(0, 6) || [];
  const genres = Array.from(new Set(books?.map((b) => b.genre).filter(Boolean) || []));

  return (
    <div className="space-y-6 sm:space-y-10 px-3 sm:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/[0.06] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Home</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Your personal, distraction-free audio companion.</p>
        </div>
        <button
          onClick={() => setCurrentView('library')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-neutral-900 border border-white/[0.08] text-xs font-medium text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
        >
          <span>Explore Library</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Continue Journey / Quick Resume Hero Banner */}
      {hasHistory && lastListened?.book ? (
        <section aria-label="Continue Journey">
          <div className="border border-white/10 rounded-2xl p-4 sm:p-8 bg-gradient-to-r from-[#141b2a] via-[#101622] to-[#0a0d14] shadow-2xl flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center justify-between transition-all relative overflow-hidden">
            {/* Ambient Background Accent Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div
              onClick={() => {
                if (currentBook?.bookId === lastListened.book?.bookId) {
                  togglePlay();
                } else {
                  loadAndPlay(lastListened.book, lastListened.chapterIndex, lastListened.currentTime);
                }
                setCurrentView('player');
              }}
              className="flex items-center gap-3.5 sm:gap-6 w-full md:w-auto z-10 cursor-pointer group"
            >
              <img
                src={lastListened.book.cover}
                alt={lastListened.book.title}
                className="w-20 h-28 sm:w-28 sm:h-40 object-cover rounded-xl shadow-2xl bg-neutral-800 shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-orange-400 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Continue Journey</span>
                </div>
                <h2 className="font-bold text-lg sm:text-2xl text-neutral-100 line-clamp-1 tracking-tight group-hover:text-orange-400 transition-colors">
                  {lastListened.book.title}
                </h2>
                <p className="text-xs text-neutral-300 font-medium truncate">
                  By {lastListened.book.author} • Chapter {lastListened.chapterIndex + 1}
                </p>

                {/* Scrubber / Progress bar */}
                <div className="space-y-1 pt-0.5 sm:pt-1">
                  <div className="w-full sm:w-56 bg-neutral-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          lastListened.duration > 0
                            ? Math.min(100, (lastListened.currentTime / lastListened.duration) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {lastListened.duration > 0
                      ? `${Math.round((lastListened.currentTime / lastListened.duration) * 100)}% completed`
                      : 'Recently active'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 sm:gap-3 w-full md:w-auto justify-end shrink-0 z-10 pt-2 md:pt-0">
              <button
                onClick={() => {
                  if (currentBook?.bookId === lastListened.book?.bookId) {
                    togglePlay();
                  } else {
                    loadAndPlay(lastListened.book, lastListened.chapterIndex, lastListened.currentTime);
                  }
                  setCurrentView('player');
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-xs shadow-lg transition-all active:scale-95"
              >
                {currentBook?.bookId === lastListened.book?.bookId && playback.isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume Chapter</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedBookIdForModal(lastListened.book!.bookId)}
                className="px-3.5 sm:px-4 py-2.5 sm:py-3 border border-white/[0.08] bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 rounded-xl transition-colors font-medium flex items-center gap-1.5 justify-center"
              >
                <Info className="w-4 h-4 text-neutral-400" />
                <span>Details</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* First-Time Experience Card */
        <section aria-label="Welcome section">
          <div className="border border-white/[0.08] rounded-xl p-8 bg-gradient-to-r from-[#121824] to-[#0a0d14] space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-orange-400 font-medium tracking-wide uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Welcome to VibeAudio</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">
              Discover your next audio adventure
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
              Explore curated audiobooks, start listening instantly, and your progress will stay synced across sessions.
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              <button
                onClick={() => setCurrentView('library')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-lg shadow transition"
              >
                Browse Catalog
              </button>
              <button
                onClick={() => setCurrentView('search')}
                className="px-4 py-2 bg-neutral-900 border border-white/[0.08] text-xs text-neutral-300 rounded-lg hover:bg-neutral-800 transition"
              >
                Search Titles
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2.5">
              <div className="bg-neutral-900 aspect-[2/3] rounded-lg border border-white/[0.04]" />
              <div className="bg-neutral-800 h-3 w-3/4 rounded" />
              <div className="bg-neutral-800 h-2 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-300 text-xs rounded-lg">
          Catalog connection error: {(error as Error).message}
        </div>
      )}

      {/* Recommended Section */}
      {recommendedBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
            <h2 className="text-sm font-semibold text-neutral-200 tracking-tight">Recommended Audiobooks</h2>
            <button
              onClick={() => setCurrentView('library')}
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendedBooks.map((book: Book, idx: number) => (
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
                  </div>
                  <h3 className="font-semibold text-xs text-neutral-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-medium line-clamp-1 mt-0.5">{book.author}</p>
                  <p className="text-[10px] text-neutral-500 mt-1 font-mono">{book.genre}</p>
                </div>
                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => {
                      loadAndPlay(book, 0, 0);
                      setCurrentView('player');
                    }}
                    className="flex-1 py-2 text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-center transition-all active:scale-95 shadow-md"
                  >
                    Listen
                  </button>
                  <button
                    onClick={() => setSelectedBookIdForModal(book.bookId)}
                    className="px-3 py-2 text-xs border border-white/10 hover:bg-neutral-800 text-neutral-300 rounded-xl transition-colors font-medium"
                  >
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Collections by Genre */}
      {genres.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-white/[0.06] pb-2">
            <h2 className="text-sm font-semibold text-neutral-200 tracking-tight">Featured Collections</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  useAppStore.getState().setSelectedCategory(genre);
                  setCurrentView('library');
                }}
                className="p-4 border border-white/[0.08] bg-[#121824] hover:border-orange-500/50 rounded-xl text-left transition-all flex justify-between items-center group"
              >
                <div>
                  <h3 className="font-medium text-xs text-neutral-200 group-hover:text-orange-400 transition-colors">
                    {genre}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Explore collection →</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-white/[0.06] pb-2">
            <h2 className="text-sm font-semibold text-neutral-200 tracking-tight">Recently Added</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyAdded.map((book: Book, idx: number) => (
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
                  </div>
                  <h3 className="font-semibold text-xs text-neutral-100 line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-medium line-clamp-1 mt-0.5">{book.author}</p>
                </div>
                <button
                  onClick={() => {
                    loadAndPlay(book, 0, 0);
                    setCurrentView('player');
                  }}
                  className="mt-3.5 w-full py-2 text-xs bg-neutral-800/80 hover:bg-orange-600 hover:text-white rounded-xl text-neutral-200 font-semibold transition-all active:scale-95"
                >
                  Quick Listen
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
