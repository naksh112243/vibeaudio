import { z } from 'zod';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export const BookmarkSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  chapterIndex: z.number(),
  timestamp: z.number(),
  note: z.string().optional(),
  createdAt: z.number(),
});

export type Bookmark = z.infer<typeof BookmarkSchema>;

export interface PlaybackState {
  status: PlaybackStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemainingSeconds: number | null;
  error: string | null;
}

export interface PlayerQueueItem {
  bookId: string;
  chapterIndex: number;
  audioUrl: string;
  title: string;
  author: string;
  chapterName: string;
  cover: string;
}

export interface LastSessionState {
  bookId: string;
  chapterIndex: number;
  currentTime: number;
  playbackRate: number;
  volume: number;
  updatedAt: number;
}
