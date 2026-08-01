import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const fallbackCatalog = [
  {
    bookId: "book-1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
    genre: "Classic Fiction",
    moods: ["Nostalgic", "Dramatic"],
    totalChapters: 9,
    dataPath: "https://vibeaudio-db.pages.dev/books/great-gatsby.json"
  },
  {
    bookId: "book-2",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    genre: "Romance",
    moods: ["Witty", "Romantic"],
    totalChapters: 61,
    dataPath: "https://vibeaudio-db.pages.dev/books/pride-and-prejudice.json"
  },
  {
    bookId: "book-3",
    title: "1984",
    author: "George Orwell",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    genre: "Dystopian",
    moods: ["Atmospheric", "Tense"],
    totalChapters: 24,
    dataPath: "https://vibeaudio-db.pages.dev/books/1984.json"
  }
];

export async function GET() {
  try {
    const res = await fetch('https://vibeaudio-db.pages.dev/catalog.json', {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn('Unable to fetch remote catalog in API handler:', err);
  }
  return NextResponse.json(fallbackCatalog);
}
