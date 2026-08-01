'use client';

import { useState } from 'react';
import { useAppStore } from '../../stores/use-app-store';
import { useBookDetail } from '../../hooks/use-book-detail';
import { useCatalog } from '../../hooks/use-catalog';
import { usePlayer } from '../../hooks/use-player';
import { useDownloads } from '../../hooks/use-downloads';
import { useHistory } from '../../hooks/use-history';
import { Book } from '../../types/book';
import { X, Heart, Play, Pause, Download, CheckCircle2, Share2, Star } from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function BookDetailsModal() {
  const selectedBookId = useAppStore((state) => state.selectedBookIdForModal);
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  const { data: bookDetail, isLoading, error } = useBookDetail(selectedBookId || undefined);
  const { data: catalogBooks } = useCatalog();
  const { loadAndPlay, currentBook, playback, togglePlay } = usePlayer();
  const { isBookDownloaded, startDownload } = useDownloads();
  const { getProgressForBook } = useHistory();

  const [shareCopied, setShareCopied] = useState(false);

  if (!selectedBookId) return null;

  const isFavorite = favorites.includes(selectedBookId);
  const downloaded = isBookDownloaded(selectedBookId);
  const userProgress = getProgressForBook(selectedBookId);

  const relatedBooks =
    catalogBooks
      ?.filter(
        (b) => b.bookId !== selectedBookId && (b.genre === bookDetail?.genre || b.author === bookDetail?.author)
      )
      .slice(0, 4) || [];

  const chapters = bookDetail?.chapters || [];
  const isPlayingThisBook = currentBook?.bookId === selectedBookId && playback.isPlaying;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#121824] border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 space-y-5 sm:space-y-6 relative shadow-2xl text-neutral-100">
        {/* Close Button */}
        <button
          onClick={() => setSelectedBookIdForModal(null)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-2xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition shadow-md z-10"
          aria-label="Close details modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading && (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading audiobook details...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-300 rounded-lg text-xs">
            Failed to load audiobook details: {(error as Error).message}
          </div>
        )}

        {bookDetail && (
          <>
            {/* Header / Meta Section */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
              <img
                src={bookDetail.cover}
                alt={bookDetail.title}
                className="w-32 h-48 sm:w-36 sm:h-52 object-cover rounded-xl shadow-lg bg-neutral-900 border border-white/[0.08] shrink-0 mx-auto sm:mx-0"
              />

              <div className="space-y-2.5 flex-1 w-full min-w-0">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2.5 py-0.5 text-[11px] bg-orange-500/10 text-orange-400 rounded-md font-semibold border border-orange-500/20">
                    {bookDetail.genre}
                  </span>
                  {bookDetail.moods?.map((mood) => (
                    <span key={mood} className="px-2 py-0.5 text-[11px] bg-neutral-800 text-neutral-400 rounded-md">
                      {mood}
                    </span>
                  ))}
                  <button
                    onClick={() => toggleFavorite(bookDetail.bookId)}
                    className={`ml-auto text-xs px-3 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                      isFavorite
                        ? 'bg-red-950/40 border-red-900/60 text-red-400 font-medium'
                        : 'border-white/[0.08] text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-neutral-100 tracking-tight">{bookDetail.title}</h2>
                <p className="text-xs text-neutral-300">By {bookDetail.author}</p>
                {bookDetail.narrator && (
                  <p className="text-[11px] text-neutral-400">Narrated by {bookDetail.narrator}</p>
                )}

                <div className="flex gap-4 text-xs text-neutral-400 pt-1 border-t border-white/[0.06] items-center">
                  <span>{bookDetail.totalChapters} Chapters</span>
                  {bookDetail.rating && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{bookDetail.rating}</span>
                    </span>
                  )}
                  {userProgress && (
                    <span className="text-orange-400 font-medium">
                      Progress: {Math.floor(userProgress.currentTime / 60)}m / {Math.floor(userProgress.duration / 60)}m
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-300 line-clamp-4 pt-1 leading-relaxed">
                  {bookDetail.description || 'An immersive audiobook listening experience.'}
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap gap-2.5 pt-3">
                  <button
                    onClick={() => {
                      if (isPlayingThisBook) {
                        togglePlay();
                      } else {
                        loadAndPlay(bookDetail, userProgress?.chapterIndex || 0, userProgress?.currentTime || 0);
                      }
                      setSelectedBookIdForModal(null);
                      setCurrentView('player');
                    }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium text-xs shadow-md transition flex items-center gap-2"
                  >
                    {isPlayingThisBook ? (
                      <>
                        <Pause className="w-4 h-4 fill-white" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {userProgress ? `Continue Ch. ${userProgress.chapterIndex + 1}` : 'Start Listening'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startDownload(bookDetail)}
                    disabled={downloaded}
                    className="px-3.5 py-2.5 text-xs border border-white/[0.08] text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5"
                  >
                    {downloaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3.5 py-2.5 text-xs border border-white/[0.08] text-neutral-300 hover:bg-neutral-800 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-neutral-200">Chapters ({chapters.length})</h3>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {chapters.length === 0 ? (
                  <p className="text-xs text-neutral-500">No chapter details available.</p>
                ) : (
                  chapters.map((ch, idx) => (
                    <div
                      key={ch.chapterId || idx}
                      className="p-2.5 bg-[#0a0d14] border border-white/[0.08] rounded-xl flex justify-between items-center text-xs hover:border-white/[0.16] transition"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-medium text-neutral-200 truncate block">{ch.name}</span>
                        {ch.sizeFormatted && (
                          <span className="text-[10px] text-neutral-500">({ch.sizeFormatted})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-neutral-500 font-mono text-[11px]">{formatTime(ch.duration || 0)}</span>
                        <button
                          onClick={() => {
                            loadAndPlay(bookDetail, idx, 0);
                            setSelectedBookIdForModal(null);
                            setCurrentView('player');
                          }}
                          className="px-3 py-1 bg-neutral-800 hover:bg-orange-600 hover:text-white text-neutral-300 rounded-lg text-[11px] transition font-medium"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Related Audiobooks */}
            {relatedBooks.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                <h3 className="text-xs font-semibold text-neutral-200">Related Audiobooks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedBooks.map((rel: Book, idx: number) => (
                    <button
                      key={`${rel.bookId}_${idx}`}
                      onClick={() => setSelectedBookIdForModal(rel.bookId)}
                      className="p-2 border border-white/[0.08] rounded-xl bg-[#0a0d14] hover:border-white/[0.2] text-left transition group"
                    >
                      <img
                        src={rel.cover}
                        alt={rel.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg mb-1.5 bg-neutral-900 group-hover:opacity-90 transition-opacity"
                      />
                      <h4 className="font-medium text-xs text-neutral-200 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 line-clamp-1">{rel.author}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
