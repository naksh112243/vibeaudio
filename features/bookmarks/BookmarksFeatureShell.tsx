'use client';

import { useBookmarks } from '../../hooks/use-bookmarks';
import { useCatalog } from '../../hooks/use-catalog';
import { usePlayer } from '../../hooks/use-player';
import { useAppStore } from '../../stores/use-app-store';
import { Bookmark, Play, Trash2 } from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function BookmarksFeatureShell() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { data: catalogBooks } = useCatalog();
  const { loadAndPlay } = usePlayer();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const getBookById = (bookId: string) => catalogBooks?.find((b) => b.bookId === bookId);

  return (
    <div className="space-y-5 sm:space-y-6 px-3 sm:px-8 max-w-4xl mx-auto">
      <div className="border-b border-white/[0.06] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Saved Bookmarks</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Quickly jump back to your saved listening moments.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 border border-dashed border-white/[0.08] rounded-xl space-y-3">
          <Bookmark className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm font-medium text-neutral-300">No bookmarks saved yet.</p>
          <p className="text-xs text-neutral-500">
            You can add bookmarks while playing any audiobook in the Player view.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm, idx) => {
            const book = getBookById(bm.bookId);

            return (
              <div
                key={bm.id}
                className="p-3 sm:p-4 bg-[#121824] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-white/20 hover-lift transition-all shadow-lg group"
              >
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => book && setSelectedBookIdForModal(book.bookId)}
                >
                  {book && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-xl bg-neutral-900 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-xs text-neutral-100 truncate group-hover:text-orange-400 transition-colors">
                      {book?.title || 'Unknown Book'}
                    </h3>
                    <p className="text-[11px] text-orange-400 font-mono">
                      Chapter {bm.chapterIndex + 1} @ {formatTime(bm.timestamp)}
                    </p>
                    {bm.note && <p className="text-xs text-neutral-300 italic line-clamp-1">"{bm.note}"</p>}
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Saved {new Date(bm.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
                  {book && (
                    <button
                      onClick={() => {
                        loadAndPlay(book, bm.chapterIndex, bm.timestamp);
                        setCurrentView('player');
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Jump & Play</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2 border border-white/10 hover:border-red-900/60 text-red-400 text-xs rounded-xl transition"
                    aria-label="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
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
