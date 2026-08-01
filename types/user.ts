import { z } from 'zod';

export const UserProgressSchema = z.object({
  userId: z.string().optional(),
  bookId: z.string(),
  chapterIndex: z.number().default(0),
  currentTime: z.number().default(0),
  duration: z.number().default(0),
  totalDuration: z.number().optional(),
  lastListenedAt: z.number().default(() => Date.now()),
  lastInteractionAt: z.string().optional(),
  completed: z.boolean().default(false),
  bookFinished: z.boolean().optional(),
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

export const OfflineChapterSchema = z.object({
  chapterIndex: z.number(),
  chapterName: z.string(),
  blobUrl: z.string().optional(),
  sizeBytes: z.number().default(0),
  downloadedAt: z.number().default(() => Date.now()),
});

export type OfflineChapter = z.infer<typeof OfflineChapterSchema>;

export type DownloadStatus = 'queued' | 'downloading' | 'downloaded' | 'failed' | 'paused';

export const OfflineBookSchema = z.object({
  bookId: z.string(),
  title: z.string(),
  author: z.string(),
  cover: z.string(),
  status: z.enum(['queued', 'downloading', 'downloaded', 'failed', 'paused']).default('downloaded'),
  progress: z.number().default(100),
  downloadedChapters: z.array(OfflineChapterSchema).default([]),
  totalSizeBytes: z.number().default(0),
  downloadedAt: z.number().default(() => Date.now()),
});

export type OfflineBook = z.infer<typeof OfflineBookSchema>;

export const UserSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  autoPlayNextChapter: z.boolean().default(true),
  defaultPlaybackRate: z.number().default(1.0),
  smartSkipSeconds: z.number().default(10),
  offlineQuality: z.enum(['standard', 'high']).default('standard'),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

export function normalizeProgress(raw: unknown): UserProgress {
  const parsed = UserProgressSchema.partial().parse(raw || {});
  const currentTime = Number(parsed.currentTime || 0);
  const duration = Number(parsed.duration || parsed.totalDuration || 0);
  const isCompleted = Boolean(parsed.completed || parsed.bookFinished || (duration > 0 && currentTime >= duration - 5));

  let lastListenedAt = Date.now();
  if (parsed.lastListenedAt) {
    lastListenedAt = Number(parsed.lastListenedAt);
  } else if (parsed.lastInteractionAt) {
    const t = new Date(parsed.lastInteractionAt).getTime();
    if (!isNaN(t)) lastListenedAt = t;
  }

  return {
    userId: parsed.userId,
    bookId: String(parsed.bookId || ''),
    chapterIndex: Number(parsed.chapterIndex || 0),
    currentTime,
    duration,
    lastListenedAt,
    completed: isCompleted,
  };
}
