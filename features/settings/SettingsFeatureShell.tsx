'use client';

import { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { useAppStore } from '../../stores/use-app-store';
import { Sliders, HardDrive, CheckCircle2, ShieldAlert, Settings, Download } from 'lucide-react';

export function SettingsFeatureShell() {
  const { settings, updateSettings } = useSettings();
  const clearAllData = useAppStore((state) => state.clearAllData);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleReset = () => {
    clearAllData();
    setConfirmReset(false);
    setResetMessage('All application state and cached storage cleared successfully.');
    setTimeout(() => setResetMessage(''), 3000);
  };

  return (
    <div className="space-y-5 sm:space-y-6 px-3 sm:px-8 max-w-3xl mx-auto">
      <div className="border-b border-white/[0.06] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-400 mt-0.5">Configure playback, downloads, theme, and storage preferences.</p>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Playback Settings */}
      <div className="p-4 sm:p-6 bg-[#121824] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Sliders className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-neutral-100">Playback Preferences</h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-neutral-200 block">Auto-play Next Chapter</span>
              <span className="text-neutral-400 text-[11px]">Automatically play the next chapter when current finishes.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayNextChapter}
              onChange={(e) => updateSettings({ autoPlayNextChapter: e.target.checked })}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-medium text-neutral-200 block">Default Playback Speed</span>
              <span className="text-neutral-400 text-[11px]">Initial speed rate when starting audiobooks.</span>
            </div>
            <select
              value={settings.defaultPlaybackRate}
              onChange={(e) => updateSettings({ defaultPlaybackRate: Number(e.target.value) })}
              className="bg-[#0a0d14] border border-white/[0.08] px-3 py-1.5 rounded-lg text-neutral-200 text-xs focus:outline-none"
            >
              <option value={0.75}>0.75x</option>
              <option value={1.0}>1.0x (Normal)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <span className="font-medium text-neutral-200 block">Smart Skip Duration</span>
              <span className="text-neutral-400 text-[11px]">Seconds to skip forward or backward.</span>
            </div>
            <select
              value={settings.smartSkipSeconds}
              onChange={(e) => updateSettings({ smartSkipSeconds: Number(e.target.value) })}
              className="bg-[#0a0d14] border border-white/[0.08] px-3 py-1.5 rounded-lg text-neutral-200 text-xs focus:outline-none"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Offline & Downloads */}
      <div className="p-6 bg-[#121824] border border-white/[0.08] rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <HardDrive className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-neutral-100">Offline & Downloads</h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-neutral-200 block">Download Quality</span>
              <span className="text-neutral-400 text-[11px]">Higher quality uses slightly more storage.</span>
            </div>
            <select
              value={settings.offlineQuality}
              onChange={(e) => updateSettings({ offlineQuality: e.target.value as any })}
              className="bg-[#0a0d14] border border-white/[0.08] px-3 py-1.5 rounded-lg text-neutral-200 text-xs focus:outline-none"
            >
              <option value="standard">Standard (64 kbps)</option>
              <option value="high">High Quality (128 kbps)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progressive Web App Status & Install */}
      <div className="p-4 sm:p-6 bg-[#121824] border border-white/[0.08] rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <Download className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-neutral-100">Progressive Web App</h2>
        </div>
        <p className="text-xs text-neutral-400">
          Install VibeAudio on your home screen or desktop for full offline playback, lock screen media controls, and instant launching.
        </p>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.deferredPwaPrompt) {
              window.deferredPwaPrompt.prompt();
            } else {
              alert('VibeAudio PWA is active. Use your browser menu or share button to add VibeAudio to your home screen.');
            }
          }}
          className="px-3.5 py-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900/40 text-xs font-medium rounded-xl flex items-center gap-2 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Install Web Application</span>
        </button>
      </div>

      {/* Data Management & Cache */}
      <div className="p-6 bg-[#121824] border border-white/[0.08] rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-neutral-100">Data & Storage Management</h2>
        </div>

        <p className="text-xs text-neutral-400">
          Reset local listening history, bookmarks, downloads, and cached settings.
        </p>

        {confirmReset ? (
          <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl space-y-2.5">
            <p className="text-xs text-red-300 font-medium">
              Are you sure you want to clear all history, bookmarks, and downloads?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-lg transition"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3.5 py-1.5 border border-white/[0.08] text-neutral-300 text-xs rounded-lg hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 border border-red-900/60 bg-red-950/20 text-red-400 text-xs font-medium rounded-xl hover:bg-red-900/40 transition"
          >
            Clear Local Cache & Reset Data
          </button>
        )}
      </div>

      {/* About VibeAudio */}
      <div className="p-6 bg-[#121824] border border-white/[0.08] rounded-2xl space-y-1.5 text-xs text-neutral-400 shadow-sm">
        <h2 className="text-xs font-semibold text-neutral-200">About VibeAudio V2</h2>
        <p className="text-[11px] text-neutral-400">Version 2.0.0 • Calm & Distraction-Free Audiobook Companion</p>
        <p className="text-[10px] text-neutral-500">Built with Next.js 15, Zustand, and Tailwind CSS.</p>
      </div>
    </div>
  );
}
