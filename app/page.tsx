'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAppStore, AppView } from '../stores/use-app-store';
import { usePlayer } from '../hooks/use-player';
import { HomeFeatureShell } from '../features/home';
import { LibraryFeatureShell } from '../features/library';
import { PlayerFeatureShell } from '../features/player';
import { SearchFeatureShell } from '../features/search';
import { HistoryFeatureShell } from '../features/history';
import { BookmarksFeatureShell } from '../features/bookmarks';
import { DownloadsFeatureShell } from '../features/downloads';
import { SettingsFeatureShell } from '../features/settings';
import { BookDetailsModal } from '../features/book-details';
import {
  Home,
  BookOpen,
  Play,
  Pause,
  Search,
  History,
  Bookmark,
  DownloadCloud,
  Settings,
  RotateCcw,
  RotateCw,
  Disc,
  MoreHorizontal,
  User,
  CheckCircle2,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MainPage() {
  const currentView = useAppStore((state) => state.currentView);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const isInitialized = useAppStore((state) => state.isInitialized);

  const { currentBook, currentChapterIndex, currentChapter, playback, togglePlay, skip } = usePlayer();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [userAccount, setUserAccount] = useState<{
    name: string;
    email: string;
    isGoogle: boolean;
  }>({
    name: 'Guest Listener',
    email: 'guest@vibeaudio.local',
    isGoogle: false,
  });

  const primaryNavItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'library', label: 'Library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'player', label: 'Player', icon: <Disc className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'downloads', label: 'Downloads', icon: <DownloadCloud className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleGoogleSignIn = () => {
    setUserAccount({
      name: 'Naveen Amre',
      email: 'naveenamre@gmail.com',
      isGoogle: true,
    });
  };

  const handleSignOut = () => {
    setUserAccount({
      name: 'Guest Listener',
      email: 'guest@vibeaudio.local',
      isGoogle: false,
    });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 font-medium tracking-wide">Preparing your audio space...</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    playback.duration > 0 ? Math.min(100, (playback.currentTime / playback.duration) * 100) : 0;

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === currentView);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col pb-32 selection:bg-orange-500/20 selection:text-orange-400">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-md border-b border-white/[0.08] px-3 sm:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        <div
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => setCurrentView('home')}
          aria-label="VibeAudio Home"
        >
          <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-semibold text-white text-xs shadow-sm group-hover:bg-orange-500 transition-colors">
            V
          </div>
          <span className="font-semibold text-base tracking-tight text-neutral-100 hidden sm:inline">
            VibeAudio
          </span>
        </div>

        {/* Primary Core Navigation */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {primaryNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.icon}
                <span className="text-[11px] sm:text-xs">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSecondaryActive || isMoreMenuOpen
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
              aria-label="More navigation options"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">More</span>
            </button>

            {/* Dropdown Menu */}
            {isMoreMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-[#121824] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
                onMouseLeave={() => setIsMoreMenuOpen(false)}
              >
                {secondaryNavItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-400 font-semibold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Account / Sync Status Header Area */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 bg-[#121824] border border-white/[0.08] hover:border-white/20 rounded-lg text-xs text-neutral-300 transition-colors"
            title="Account & Sync Status"
          >
            <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-semibold text-[10px]">
              {userAccount.isGoogle ? 'N' : <User className="w-3 h-3" />}
            </div>
            <span className="hidden md:inline text-[11px] font-medium text-neutral-200">
              {userAccount.isGoogle ? 'Naveen' : 'Guest'}
            </span>
          </button>
        </div>
      </header>

      {/* Main View Content */}
      <main className="flex-1 py-6">
        {currentView === 'home' && <HomeFeatureShell />}
        {currentView === 'library' && <LibraryFeatureShell />}
        {currentView === 'player' && <PlayerFeatureShell />}
        {currentView === 'search' && <SearchFeatureShell />}
        {currentView === 'history' && <HistoryFeatureShell />}
        {currentView === 'bookmarks' && <BookmarksFeatureShell />}
        {currentView === 'downloads' && <DownloadsFeatureShell />}
        {currentView === 'settings' && <SettingsFeatureShell />}
      </main>

      {/* Global Book Details Modal */}
      <BookDetailsModal />

      {/* Account & Sync Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-100 p-1 rounded-lg hover:bg-neutral-800 transition"
              aria-label="Close Account Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-100">Audio Space Account</h2>
              <p className="text-xs text-neutral-400">
                Your progress, bookmarks, and downloads stay synced locally and across devices.
              </p>
            </div>

            <div className="p-4 bg-[#0a0d14] border border-white/[0.08] rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {userAccount.isGoogle ? 'N' : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-neutral-100">{userAccount.name}</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">{userAccount.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sync Status: Active</span>
                </div>
                <span className="text-neutral-500 text-[10px]">IndexedDB / Local</span>
              </div>
            </div>

            {!userAccount.isGoogle ? (
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-white text-neutral-900 font-medium text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Continue with Google</span>
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 bg-neutral-900 border border-white/[0.08] hover:bg-neutral-800 text-neutral-300 text-xs font-medium rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                <span>Switch to Guest Listener</span>
              </button>
            )}

            <div className="pt-2 flex justify-between items-center text-xs text-neutral-400">
              <button
                onClick={() => {
                  setIsAccountModalOpen(false);
                  setCurrentView('settings');
                }}
                className="hover:text-orange-400 transition"
              >
                App Settings →
              </button>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Premium Transport Control (Mini Player) */}
      {currentBook && currentView !== 'player' && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[600px] max-w-[calc(100vw-2rem)] z-50 bg-[#0e131f]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-2xl transition-all">
          {/* Top Progress Line inside floating card */}
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-neutral-800 overflow-hidden rounded-full">
            <div
              className="bg-orange-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 group pt-1"
            onClick={() => setCurrentView('player')}
            aria-label="Open Full Player"
          >
            <Image
              src={currentBook.cover}
              alt={currentBook.title}
              width={40}
              height={56}
              referrerPolicy="no-referrer"
              unoptimized
              className="w-10 h-14 object-cover rounded-md bg-neutral-800 shrink-0 shadow-md group-hover:opacity-90 transition-opacity"
            />
            <div className="min-w-0 space-y-0.5">
              <h4 className="font-medium text-xs text-neutral-100 truncate group-hover:text-orange-400 transition-colors">
                {currentBook.title}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate">
                Ch. {currentChapterIndex + 1}
                {currentChapter ? `: ${currentChapter.name}` : ''}
              </p>
              <div className="text-[10px] text-orange-400 font-mono">
                {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-1">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
              title="Skip back 10 seconds"
              aria-label="Skip back 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={playback.status === 'loading'}
              className="w-9 h-9 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 disabled:opacity-50"
              aria-label={playback.isPlaying ? 'Pause playback' : 'Start playback'}
            >
              {playback.status === 'loading' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : playback.isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition"
              title="Skip forward 10 seconds"
              aria-label="Skip forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

