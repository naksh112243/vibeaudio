'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, Download, RefreshCw, X } from 'lucide-react';

declare global {
  interface Window {
    deferredPwaPrompt?: any;
  }
}

export function PwaManager() {
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial network state check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      const timer = setTimeout(() => setShowOnlineToast(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Service Worker Registration & Update Detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    setWaitingWorker(installingWorker);
                    setShowUpdateBanner(true);
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration error:', err);
        });
    }

    // 3. PWA Install Prompt Capture
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setCanInstall(true);

      // Show banner if not dismissed before and not in standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const dismissed = localStorage.getItem('vibeaudio_install_dismissed');
      if (!isStandalone && !dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    if (window.deferredPwaPrompt) {
      window.deferredPwaPrompt.prompt();
      const choiceResult = await window.deferredPwaPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowInstallBanner(false);
        setCanInstall(false);
      }
      window.deferredPwaPrompt = null;
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('vibeaudio_install_dismissed', 'true');
  };

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline Toast Banner */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 border border-amber-500/30 text-amber-200 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Offline Mode — Downloaded audiobooks remain available</span>
        </div>
      )}

      {/* Back Online Toast */}
      {showOnlineToast && !isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Back Online — Syncing session & progress</span>
        </div>
      )}

      {/* New Version Available Toast */}
      {showUpdateBanner && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#121824]/95 border border-orange-500/30 text-neutral-100 px-4 py-2.5 rounded-2xl text-xs font-medium flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top duration-300">
          <RefreshCw className="w-4 h-4 text-orange-400 shrink-0 animate-spin" />
          <span>New version available</span>
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={applyUpdate}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss update alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Non-intrusive Standalone Install Banner */}
      {showInstallBanner && canInstall && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#121824]/95 border border-white/10 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-100 truncate">Install VibeAudio</p>
              <p className="text-[11px] text-neutral-400 truncate">Listen offline & enable lock screen controls</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerInstall}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismissBanner}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
