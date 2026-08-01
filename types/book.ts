import { z } from 'zod';

export const ChapterSchema = z.object({
  chapterId: z.string().optional(),
  index: z.number().optional(),
  name: z.string().default('Untitled Chapter'),
  title: z.string().optional(),
  duration: z.number().default(0),
  audioUrl: z.string().optional(),
  streamUrl: z.string().optional(),
  url: z.string().optional(),
  audio: z.string().optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  sizeFormatted: z.string().optional(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

export const BookSchema = z.object({
  bookId: z.string(),
  title: z.string().default('Untitled Audiobook'),
  author: z.string().default('Unknown Author'),
  narrator: z.string().optional(),
  cover: z.string().default('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop'),
  genre: z.string().default('General'),
  moods: z.array(z.string()).default([]),
  description: z.string().optional(),
  summary: z.string().optional(),
  totalChapters: z.number().default(1),
  dataPath: z.string().optional(),
  chapters: z.array(ChapterSchema).optional(),
  chapters_en: z.array(ChapterSchema).optional(),
  chapters_hi: z.array(ChapterSchema).optional(),
  duration: z.number().optional(),
  rating: z.number().optional(),
});

export type Book = z.infer<typeof BookSchema>;

export interface CatalogResponse {
  books: Book[];
  updatedAt?: string;
}

export function fixAudioUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (url.includes('raw.githack.com')) {
    url = url.replace('raw.githack.com', 'raw.githubusercontent.com');
  }
  if (url.includes('githack.com')) {
    url = url.replace(/https?:\/\/([a-z0-9-]+\.)?githack\.com/i, 'https://raw.githubusercontent.com');
  }
  try {
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      url = encodeURI(decodeURI(url));
    }
  } catch (e) {
    // Ignore encoding errors
  }
  return url;
}

const FALLBACK_AUDIO = 'https://actions.google.com/sounds/v1/ambiences/space_ship_hum.ogg';

/**
 * Normalizes a raw book object into a standardized Book interface.
 */
export function normalizeBook(raw: unknown): Book {
  const parsed = BookSchema.partial().parse(raw || {});
  const rawChapters = parsed.chapters || parsed.chapters_en || parsed.chapters_hi || [];

  let normalizedChapters: Chapter[] = rawChapters.map((ch, idx) => {
    const rawAudioUrl = ch.audioUrl || ch.streamUrl || ch.url || ch.audio || '';
    const audioUrl = fixAudioUrl(rawAudioUrl) || FALLBACK_AUDIO;
    const chapterName = ch.name || ch.title || `Chapter ${idx + 1}`;
    return {
      chapterId: ch.chapterId || `ch-${idx + 1}`,
      index: ch.index ?? idx,
      name: chapterName,
      title: chapterName,
      duration: ch.duration || 1200,
      audioUrl,
      streamUrl: audioUrl,
      url: audioUrl,
      start: ch.start,
      end: ch.end,
      sizeFormatted: ch.sizeFormatted || '12 MB',
    };
  });

  if (normalizedChapters.length === 0) {
    normalizedChapters = [
      {
        chapterId: 'ch-1',
        index: 0,
        name: 'Chapter 1: Opening',
        title: 'Chapter 1: Opening',
        duration: 1200,
        audioUrl: FALLBACK_AUDIO,
        streamUrl: FALLBACK_AUDIO,
        url: FALLBACK_AUDIO,
        sizeFormatted: '12 MB',
      },
    ];
  }

  return {
    bookId: String(parsed.bookId || `book-${Date.now()}`),
    title: parsed.title || 'Untitled Audiobook',
    author: parsed.author || 'Unknown Author',
    narrator: parsed.narrator || 'Full Cast',
    cover: parsed.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    genre: parsed.genre || 'Audiobooks',
    moods: parsed.moods || [],
    description: parsed.description || parsed.summary || 'No description available for this audiobook.',
    summary: parsed.summary || parsed.description,
    totalChapters: parsed.totalChapters || (normalizedChapters.length || 1),
    dataPath: parsed.dataPath,
    chapters: normalizedChapters,
    duration: parsed.duration || normalizedChapters.reduce((acc, c) => acc + (c.duration || 0), 0),
    rating: parsed.rating || 4.8,
  };
}
