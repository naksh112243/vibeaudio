# 🎧 VibeAudio

**Experience Books Like Never Before.** A modern, high-performance, and immersive audiobook streaming platform built on Next.js 15 App Router, TypeScript, Tailwind CSS, and Zustand.

---

## ⚡ Overview

**VibeAudio** is a progressive web app (PWA) designed for frictionless audiobook playback. It combines cloud catalog retrieval, resilient offline caching, rich Media Session background controls, and instant resume capabilities.

---

## 🚀 Key Features

- **📱 Premium PWA & Offline Support:** Service worker (`sw.js`) with Cache-First asset strategies, background audio caching, and offline state banners.
- **🎧 Seamless Audio Engine:** Singleton HTML5 `PlayerService` featuring variable playback speed, sleep timers, smart fallback stream recovery, and full Media Session integration.
- **⚡ Instant Resume Journey:** Remembers last listened positions per book and automatically resumes playback within seconds of launch.
- **📂 Cloud Catalog & Search:** Real-time catalog fetching with robust search, filtering by mood/genre, and bookmarks.
- **🎨 Modern Dark Atmosphere:** Clean, accessible dark UI with smooth CSS transitions, responsive drawer layouts, and WCAG-compliant touch targets.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **State Management:** [Zustand 5](https://github.com/pmndrs/zustand) with LocalStorage persistence
- **Data Fetching:** [TanStack React Query 5](https://tanstack.com/query)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📂 Repository Structure

```
.
├── app/                  # Next.js App Router (Layouts, Pages, API Routes)
│   ├── api/              # Server-side API proxy routes (catalog, health)
│   ├── globals.css       # Global styles and Tailwind imports
│   ├── layout.tsx        # Root layout with providers and metadata
│   └── page.tsx          # Main entry route shell
├── components/           # Core reusable UI components & PWA Manager
├── features/             # Domain-specific feature modules
│   ├── book-details/     # Book details modal and chapter picker
│   ├── home/             # Home view shell, hero section, and carousels
│   ├── player/           # Fullscreen & mini player interface
│   └── search/           # Search input, results, and genre filters
├── hooks/                # Reusable React hooks
├── lib/                  # Utilities (clsx, cn, storage adapters)
├── providers/            # React Query & app context providers
├── public/               # Static assets & PWA service worker (`sw.js`)
├── services/             # Service layer
│   ├── api/              # Catalog client with retry & fallback policies
│   └── player/           # Singleton Player Engine managing HTML5 Audio
├── stores/               # Zustand state stores
└── types/                # TypeScript type definitions & Zod schemas
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm start
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

