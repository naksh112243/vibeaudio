'use client';

import { useDownloads } from '../../hooks/use-downloads';
import { useCatalog } from '../../hooks/use-catalog';
import { usePlayer } from '../../hooks/use-player';
import { useAppStore } from '../../stores/use-app-store';
import { DownloadCloud, Play, Trash2, CheckCircle2 } from 'lucide-react';

export function DownloadsFeatureShell() {
  const { downloads, removeDownload } = useDownloads();
  const { data: catalogBooks } = useCatalog();
  const { loadAndPlay } = usePlayer();
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const getBookForDownload = (bookId: string) => {
    return (
      catalogBooks?.find((b) => b.bookId === bookId) || {
        bookId,
        title: 'Downloaded Book',
        author: 'Unknown',
        cover: '',
        genre: 'General',
        moods: [],
        totalChapters: 1,
        chapters: [{ index: 0, name: 'Chapter 1', duration: 0 }],
      }
    );
  };

  // Storage calculation estimate (15MB per downloaded book)
  const totalMB = downloads.length * 15;
  const storageLimitMB = 500;
  const storagePercent = Math.min(100, Math.round((totalMB / storageLimitMB) * 100));

  return (
    <div className="space-y-5 sm:space-y-6 px-3 sm:px-8 max-w-4xl mx-auto">
      {/* Title & Storage Bar */}
      <div className="border-b border-white/[0.06] pb-4 space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Offline Downloads</h1>
            <p className="text-xs text-neutral-400 mt-0.5">Listen offline anytime without network connectivity.</p>
          </div>
          <div className="px-3 py-1 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-xs rounded-full flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Offline Mode Ready</span>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="p-3.5 bg-[#121824] border border-white/[0.08] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between font-medium text-neutral-300">
            <span>Offline Storage Usage</span>
            <span className="font-mono text-[11px] text-neutral-400">
              {totalMB} MB used of {storageLimitMB} MB ({storagePercent}%)
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="py-16 text-center text-neutral-400 border border-dashed border-white/[0.08] rounded-xl space-y-3">
          <DownloadCloud className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-sm font-medium text-neutral-300">No audiobooks downloaded for offline listening.</p>
          <button
            onClick={() => setCurrentView('library')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg shadow transition"
          >
            Find Audiobooks to Download
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((item, idx) => (
            <div
              key={`${item.bookId}_${idx}`}
              className="p-3 sm:p-4 bg-[#121824] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:border-white/20 hover-lift transition-all shadow-lg group"
            >
              <div
                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                onClick={() => setSelectedBookIdForModal(item.bookId)}
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-xl bg-neutral-900 shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-neutral-100 truncate group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                        item.status === 'downloaded'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'downloading'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium truncate">By {item.author}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Downloaded {new Date(item.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
                <button
                  onClick={() => {
                    loadAndPlay(getBookForDownload(item.bookId));
                    setCurrentView('player');
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Offline</span>
                </button>

                <button
                  onClick={() => removeDownload(item.bookId)}
                  className="p-2 border border-white/10 hover:border-red-900/60 text-red-400 text-xs rounded-xl transition"
                  aria-label="Remove download"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
