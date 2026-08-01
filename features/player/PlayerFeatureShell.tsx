'use client';

import { useState } from 'react';
import { usePlayer } from '../../hooks/use-player';
import { useBookmarks } from '../../hooks/use-bookmarks';
import { useSettings } from '../../hooks/use-settings';
import { useAppStore } from '../../stores/use-app-store';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Clock,
  Bookmark,
  Info,
  List,
  Plus,
  Trash2,
  Disc,
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function PlayerFeatureShell() {
  const {
    currentBook,
    currentChapterIndex,
    currentChapter,
    playback,
    loadAndPlay,
    togglePlay,
    seek,
    skip,
    setVolume,
    setPlaybackRate,
    nextChapter,
    previousChapter,
    createBookmark,
    startSleepTimer,
    cancelSleepTimer,
  } = usePlayer();

  const { getBookmarksForBook, removeBookmark } = useBookmarks();
  const { settings } = useSettings();
  const setSelectedBookIdForModal = useAppStore((state) => state.setSelectedBookIdForModal);

  const [bookmarkNote, setBookmarkNote] = useState('');
  const [activeTab, setActiveTab] = useState<'chapters' | 'bookmarks'>('chapters');

  if (!currentBook) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-[#121824] border border-white/[0.08] rounded-2xl flex items-center justify-center mx-auto text-orange-400 shadow-md">
          <Disc className="w-8 h-8 animate-spin-slow" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-100">No Audiobook Loaded</h2>
        <p className="text-xs text-neutral-400">
          Select an audiobook from the Home or Library screen to start listening.
        </p>
        <button
          onClick={() => useAppStore.getState().setCurrentView('library')}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl shadow transition"
        >
          Explore Library
        </button>
      </div>
    );
  }

  const chapters = currentBook.chapters || [];
  const bookBookmarks = getBookmarksForBook(currentBook.bookId);

  return (
    <div className="px-3 sm:px-8 max-w-4xl mx-auto space-y-5 sm:space-y-6">
      {/* Expanded Artwork & Meta Section - Emotional Center */}
      <div className="border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-10 bg-gradient-to-b from-[#161d2d] via-[#121824] to-[#0d121c] shadow-2xl flex flex-col md:flex-row gap-6 sm:gap-8 items-center relative overflow-hidden">
        {/* Soft Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group shrink-0 z-10">
          <img
            src={currentBook.cover}
            alt={currentBook.title}
            className="w-40 h-56 sm:w-56 sm:h-76 object-cover rounded-2xl shadow-2xl bg-neutral-900 border border-white/10 group-hover:scale-[1.01] transition-transform duration-300"
          />
          <button
            onClick={() => setSelectedBookIdForModal(currentBook.bookId)}
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-md text-xs font-medium text-neutral-200 rounded-xl hover:bg-black transition flex items-center gap-1.5 shadow-lg border border-white/10"
            aria-label="Book Info"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 text-center md:text-left flex-1 min-w-0 z-10">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
            <span className="px-3 py-1 text-[11px] bg-orange-500/10 text-orange-400 font-semibold rounded-full border border-orange-500/20 tracking-wide uppercase">
              {currentBook.genre}
            </span>
            <span className="px-3 py-1 text-[11px] bg-neutral-800/80 text-neutral-300 rounded-full font-medium">
              Chapter {currentChapterIndex + 1} of {chapters.length || currentBook.totalChapters}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-bold text-neutral-100 tracking-tight leading-snug line-clamp-2">
            {currentBook.title}
          </h1>
          <p className="text-sm text-neutral-300 font-medium">By {currentBook.author}</p>
          {currentBook.narrator && (
            <p className="text-xs text-neutral-400">Narrated by {currentBook.narrator}</p>
          )}

          {currentChapter && (
            <div className="pt-1 sm:pt-2">
              <span className="text-xs font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full inline-block shadow-sm">
                Playing: {currentChapter.name}
              </span>
            </div>
          )}

          {playback.error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl text-xs">
              {playback.error}
            </div>
          )}
        </div>
      </div>

      {/* Main Playback Transport Controls Box */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-8 bg-[#121824] space-y-5 sm:space-y-6 shadow-2xl">
        {/* Timeline Scrubber */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={playback.duration || 100}
              value={playback.currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800/80 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:h-2.5 transition-all"
              aria-label="Seek progress"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-neutral-400">
            <span>{formatTime(playback.currentTime)}</span>
            <span className="text-neutral-500">-{formatTime(Math.max(0, playback.duration - playback.currentTime))}</span>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-5 py-1 sm:py-2">
          <button
            onClick={previousChapter}
            className="p-2.5 sm:p-3 border border-white/[0.08] rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
            title="Previous Chapter"
            aria-label="Previous Chapter"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => skip(-settings.smartSkipSeconds)}
            className="p-2.5 sm:p-3 border border-white/[0.08] rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all flex items-center gap-1 text-xs font-medium"
            title={`Skip back ${settings.smartSkipSeconds}s`}
            aria-label={`Skip back ${settings.smartSkipSeconds} seconds`}
          >
            <RotateCcw className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-[11px]">{settings.smartSkipSeconds}s</span>
          </button>

          <button
            onClick={togglePlay}
            disabled={playback.status === 'loading'}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 shrink-0"
            aria-label={playback.isPlaying ? 'Pause' : 'Play'}
          >
            {playback.status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playback.isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5 sm:ml-1" />
            )}
          </button>

          <button
            onClick={() => skip(settings.smartSkipSeconds)}
            className="p-2.5 sm:p-3 border border-white/[0.08] rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all flex items-center gap-1 text-xs font-medium"
            title={`Skip forward ${settings.smartSkipSeconds}s`}
            aria-label={`Skip forward ${settings.smartSkipSeconds} seconds`}
          >
            <RotateCw className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-[11px]">{settings.smartSkipSeconds}s</span>
          </button>

          <button
            onClick={nextChapter}
            className="p-2.5 sm:p-3 border border-white/[0.08] rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all"
            title="Next Chapter"
            aria-label="Next Chapter"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Secondary Control Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06] text-xs text-neutral-300">
          {/* Speed */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-400">Speed:</span>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-1 rounded-md text-[11px] transition ${
                    playback.playbackRate === rate
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'border border-white/[0.08] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(playback.volume > 0 ? 0 : 1)}
              className="text-neutral-400 hover:text-neutral-200"
              aria-label={playback.volume === 0 ? 'Unmute' : 'Mute'}
            >
              {playback.volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={playback.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1.5 bg-neutral-800 rounded-lg accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-[11px] text-neutral-400">{Math.round(playback.volume * 100)}%</span>
          </div>

          {/* Sleep Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="font-medium text-neutral-400">Sleep:</span>
            {playback.sleepTimerMinutes ? (
              <div className="flex items-center gap-1.5">
                <span className="text-orange-400 font-mono text-[11px] font-medium">
                  {formatTime(playback.sleepTimerRemainingSeconds || 0)}
                </span>
                <button
                  onClick={cancelSleepTimer}
                  className="text-red-400 hover:underline text-[10px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-1">
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => startSleepTimer(mins)}
                    className="px-2 py-1 rounded-md border border-white/[0.08] text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapters & Bookmarks Tabs */}
      <div className="border border-white/[0.08] rounded-2xl p-6 bg-[#121824] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`pb-1 font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'chapters'
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Chapters ({chapters.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`pb-1 font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'text-orange-400 border-b-2 border-orange-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookBookmarks.length})</span>
            </button>
          </div>

          {/* Quick Bookmark Input */}
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Bookmark note (optional)..."
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              className="px-3 py-1.5 text-xs border border-white/[0.08] bg-[#0a0d14] rounded-lg text-neutral-200 flex-1 focus:outline-none"
            />
            <button
              onClick={() => {
                createBookmark(bookmarkNote);
                setBookmarkNote('');
              }}
              className="px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-500 transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bookmark</span>
            </button>
          </div>
        </div>

        {/* Chapter List */}
        {activeTab === 'chapters' && (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {chapters.map((ch, idx) => (
              <button
                key={ch.chapterId || idx}
                onClick={() => loadAndPlay(currentBook, idx, 0)}
                className={`w-full text-left p-3 rounded-xl text-xs flex justify-between items-center transition ${
                  idx === currentChapterIndex
                    ? 'bg-orange-500/10 text-orange-400 font-medium border border-orange-500/30'
                    : 'hover:bg-neutral-800/60 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-neutral-500 font-mono w-5 shrink-0">{idx + 1}.</span>
                  <span className="truncate">{ch.name}</span>
                </div>
                <span className="text-neutral-500 font-mono text-[11px] shrink-0 ml-2">
                  {formatTime(ch.duration || 0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Bookmarks List */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {bookBookmarks.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">
                No bookmarks saved for this audiobook yet.
              </p>
            ) : (
              bookBookmarks.map((bm, idx) => (
                <div
                  key={bm.id}
                  className="p-3 bg-[#0a0d14] rounded-xl border border-white/[0.08] flex justify-between items-center text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <span className="text-orange-400 font-medium font-mono text-[11px]">
                      Chapter {bm.chapterIndex + 1} @ {formatTime(bm.timestamp)}
                    </span>
                    {bm.note && <p className="text-neutral-300 text-xs italic line-clamp-1">"{bm.note}"</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => seek(bm.timestamp)}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs"
                    >
                      Jump
                    </button>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
