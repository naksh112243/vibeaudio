'use client';

import { useHistory } from '../../hooks/use-history';
import { usePlayer } from '../../hooks/use-player';
import { useAppStore } from '../../stores/use-app-store';
import { History, Play, Trash2, Clock, BookOpen } from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function HistoryFeatureShell() {
  const { getHistoryWithBooks, clearHistory } = useHistory();
  const { loadAndPlay } = usePlayer();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const historyWithBooks = getHistoryWithBooks();

  return (
    <div className="space-y-5 sm:space-y-6 px-3 sm:px-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Listening History</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Track your progress and jump back into recent sessions.</p>
        </div>

        {historyWithBooks.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121824] border border-white/[0.08] hover:border-red-900/60 text-red-400 text-xs rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyWithBooks.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 border border-dashed border-white/[0.08] rounded-xl space-y-3">
          <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm font-medium text-neutral-300">No listening history recorded yet.</p>
          <button
            onClick={() => setCurrentView('library')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg shadow transition"
          >
            Start Listening Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {historyWithBooks.map((item, idx) => {
            if (!item.book) return null;
            const progressPercent =
              item.duration > 0 ? Math.min(100, Math.round((item.currentTime / item.duration) * 100)) : 0;
            const dateStr = item.lastListenedAt ? new Date(item.lastListenedAt).toLocaleDateString() : '';

            return (
              <div
                key={`${item.bookId}_${idx}`}
                className="p-3 sm:p-4 bg-[#121824] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-white/20 hover-lift transition-all shadow-lg group"
              >
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  onClick={() => setSelectedBookIdForModal(item.book!.bookId)}
                >
                  <img
                    src={item.book.cover}
                    alt={item.book.title}
                    className="w-14 h-20 object-cover rounded-xl bg-neutral-900 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-xs text-neutral-100 truncate group-hover:text-orange-400 transition-colors">
                      {item.book.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium truncate">By {item.book.author}</p>
                    <p className="text-[10px] text-orange-400 font-mono">
                      Chapter {item.chapterIndex + 1} • {formatTime(item.currentTime)} / {formatTime(item.duration)}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-48 max-w-full bg-neutral-800/80 rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto shrink-0">
                  {dateStr && <span className="text-[10px] text-neutral-500 font-mono">Last played: {dateStr}</span>}
                  <button
                    onClick={() => {
                      loadAndPlay(item.book, item.chapterIndex, item.currentTime);
                      setCurrentView('player');
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume Listening</span>
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
