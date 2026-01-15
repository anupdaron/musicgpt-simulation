# 🎵 MusicGPT - Music Generation Simulation

A sophisticated music generation simulation UI built with Next.js 16, featuring real-time WebSocket synchronization, animated components, and a modern dark theme design.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Animation Specifications](#animation-specifications)
- [Design Decisions](#design-decisions)
- [API Documentation](#api-documentation)

## 🎯 Overview

MusicGPT is a simulation of an AI-powered music generation platform. Users can input text prompts to "generate" music tracks, with the system simulating the generation process complete with progress updates, status messages, and realistic delays.

### Key Highlights

- **Real-time Progress Updates**: WebSocket-powered live progress tracking
- **Animated UI Components**: Smooth transitions using Framer Motion
- **State Synchronization**: Profile popup and main content stay in sync
- **Multiple Generation States**: Empty, Generating, Completed, and Failed states
- **Floating Music Player**: Persistent audio player for completed tracks

## 🛠 Tech Stack

| Technology        | Version | Purpose                         |
| ----------------- | ------- | ------------------------------- |
| **Next.js**       | 16.1.1  | React framework with App Router |
| **React**         | 19.x    | UI library                      |
| **TypeScript**    | 5.x     | Type safety                     |
| **Tailwind CSS**  | 4.x     | Utility-first styling           |
| **Framer Motion** | 12.x    | Declarative animations          |
| **Zustand**       | 5.x     | State management                |
| **Socket.io**     | 4.x     | Real-time communication         |
| **Lucide React**  | 0.513.x | Icon library                    |

## 🏗 Architecture

### State Management

The application uses **Zustand** with `subscribeWithSelector` middleware for fine-grained reactivity:

```
┌─────────────────────────────────────────────────────────────┐
│                    Generation Store                         │
├─────────────────────────────────────────────────────────────┤
│  State:                                                     │
│  ├── generations: Generation[]                              │
│  ├── user: UserProfile                                      │
│  ├── isProfileOpen: boolean                                 │
│  └── currentlyPlaying: string | null                        │
├─────────────────────────────────────────────────────────────┤
│  Actions:                                                   │
│  ├── addGeneration(prompt)                                  │
│  ├── updateProgress(id, progress, message)                  │
│  ├── completeGeneration(id, result)                         │
│  ├── failGeneration(id, error)                              │
│  └── setCurrentlyPlaying(id)                                │
├─────────────────────────────────────────────────────────────┤
│  Selectors (Optimized Re-renders):                          │
│  ├── useGeneratingCount()                                   │
│  ├── useCompletedGenerations()                              │
│  └── useFailedGenerations()                                 │
└─────────────────────────────────────────────────────────────┘
```

### Real-time Communication

```
┌──────────────┐     WebSocket     ┌──────────────┐
│   Client     │◄────────────────►│    Server    │
│  (Browser)   │                   │  (Node.js)   │
└──────────────┘                   └──────────────┘
       │                                  │
       │  1. emit('generate')             │
       │─────────────────────────────────►│
       │                                  │
       │  2. emit('progress', {progress}) │
       │◄─────────────────────────────────│
       │      (every 500ms)               │
       │                                  │
       │  3. emit('completed') or         │
       │     emit('failed')               │
       │◄─────────────────────────────────│
```

### Component Hierarchy

```
App (layout.tsx)
├── SocketProvider (WebSocket context)
│   └── page.tsx
│       ├── Sidebar
│       │   └── ProfilePopup (Generation list mirror)
│       ├── PromptBox (Animated input)
│       └── RecentGenerations
│           ├── EmptyState
│           └── GenerationCard[]
│               ├── GeneratingState (with CircularProgress)
│               ├── CompletedState (with play overlay)
│               └── FailedState (with error display)
└── MusicPlayer (Floating, persistent)
```

## ✨ Features

### 1. Animated Prompt Box

- **Cycling Placeholders**: Typewriter effect with rotating prompts
- **Animated Border**: Gradient flow animation on focus
- **Auto-resize**: Textarea grows with content
- **Credit Check**: Validates user has sufficient credits

### 2. Real-time Generation Progress

- **Live Progress Bar**: Smooth progress updates
- **Status Messages**: Dynamic generation phase messages
- **Circular Progress**: Visual indicator in profile popup
- **Shimmer Effects**: Loading animations on cards

### 3. Profile Popup Synchronization

- **Badge Counter**: Shows active generation count
- **Live Updates**: Synced with main content area
- **State Display**: Shows all generation states
- **Click Outside to Close**: User-friendly interaction

### 4. Generation States

| State          | UI Elements                                  |
| -------------- | -------------------------------------------- |
| **Empty**      | Illustration, helper text, CTA button        |
| **Generating** | Progress bar, shimmer effect, status message |
| **Completed**  | Cover image, play button, version count      |
| **Failed**     | Error icon, error message, retry button      |

### 5. Floating Music Player

- **Persistent Position**: Fixed at bottom of screen
- **Track Info**: Title, prompt, and version display
- **Playback Controls**: Play/pause, seek, volume
- **Progress Display**: Duration and current time

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd musicgpt-simulation

# Install dependencies
npm install
```

### Development

```bash
# Start Next.js development server (with client-side simulation)
npm run dev

# OR start with custom WebSocket server (full real-time support)
npm run dev:ws
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
musicgpt-simulation/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles, CSS variables, keyframes
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main create page
│   │   └── api/
│   │       └── socket/
│   │           └── route.ts     # WebSocket API route
│   │
│   ├── components/
│   │   ├── create/
│   │   │   ├── PromptBox.tsx    # Animated prompt input
│   │   │   ├── RecentGenerations.tsx
│   │   │   ├── GenerationCard.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── ProfilePopup.tsx # User dropdown with generations
│   │   │
│   │   ├── player/
│   │   │   └── MusicPlayer.tsx  # Floating audio player
│   │   │
│   │   └── ui/
│   │       └── CircularProgress.tsx
│   │
│   ├── hooks/
│   │   └── useSocket.tsx        # WebSocket provider & hook
│   │
│   ├── lib/
│   │   └── utils.ts             # Utilities, constants, easing
│   │
│   ├── store/
│   │   └── generationStore.ts   # Zustand store
│   │
│   └── types/
│       └── index.ts             # TypeScript definitions
│
├── server.js                    # Custom WebSocket server
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Animation Specifications

### Timing Constants

```typescript
const ANIMATION_CONFIG = {
  // Page transitions
  pageEnter: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },

  // Card animations
  cardEnter: { duration: 0.4, ease: 'easeOut' },
  cardStagger: 0.1, // seconds between each card

  // Prompt box
  typingSpeed: 50, // ms per character (typing)
  deletingSpeed: 30, // ms per character (deleting)
  pauseDuration: 2000, // ms pause between prompts

  // Border gradient
  borderRotation: { duration: 3, ease: 'linear', repeat: Infinity },

  // Progress updates
  progressSmooth: { duration: 0.3, ease: 'easeOut' },
};
```

### CSS Keyframes

```css
/* Animated gradient border */
@keyframes border-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Loading shimmer */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Generating pulse */
@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

### Easing Functions

```typescript
// Smooth page transitions
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1];

// Bouncy card entrances
export const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1];

// Smooth progress bars
export const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1];
```

## 🎨 Design Decisions

### Why Zustand over Redux/Context?

1. **Minimal Boilerplate**: No action types, reducers, or providers needed
2. **subscribeWithSelector**: Enables component-level subscriptions
3. **DevTools Support**: Built-in Redux DevTools integration
4. **Small Bundle**: ~1KB gzipped vs Redux's ~7KB

### Why Framer Motion?

1. **Declarative API**: Animation logic lives with components
2. **Layout Animations**: Automatic animations when items reorder
3. **AnimatePresence**: Smooth exit animations for unmounting
4. **Gesture Support**: Built-in drag, hover, tap animations

### Why Socket.io with Simulation Fallback?

1. **Graceful Degradation**: Works without WebSocket server
2. **Realistic Demo**: Client-side simulation mimics real behavior
3. **Production Ready**: Easy to swap simulation for real API
4. **Progress Simulation**: Demonstrates real-time capabilities

### Color Palette (Dark Theme)

```css
:root {
  --background: #0d0d0d; /* Pure black background */
  --surface: #171717; /* Card backgrounds */
  --surface-hover: #262626; /* Hover states */
  --border: #2e2e2e; /* Subtle borders */
  --text-primary: #fafafa; /* Primary text */
  --text-secondary: #a3a3a3; /* Secondary text */
  --accent: #8b5cf6; /* Purple accent */
  --accent-pink: #ec4899; /* Pink for gradients */
  --success: #22c55e; /* Completed state */
  --error: #ef4444; /* Failed state */
}
```

## 📡 API Documentation

### WebSocket Events

#### Client → Server

```typescript
// Start generation
socket.emit('generate', {
  id: string,
  prompt: string,
});
```

#### Server → Client

```typescript
// Progress update
socket.on('progress', {
  id: string,
  progress: number,      // 0-100
  message: string        // Status message
});

// Generation completed
socket.on('completed', {
  id: string,
  title: string,
  coverImage: string,
  versions: Version[],
  duration: number
});

// Generation failed
socket.on('failed', {
  id: string,
  error: string
});
```

### Generation Progress Messages

```typescript
const PROGRESS_MESSAGES = [
  'Analyzing prompt...',
  'Generating melody...',
  'Adding harmonics...',
  'Mixing layers...',
  'Applying effects...',
  'Final mastering...',
  'Almost there...',
];
```

## 📝 Testing Checklist

- [x] Prompt box shows cycling placeholder text
- [x] Animated border activates on focus
- [x] Generation creates new card in "Generating" state
- [x] Progress updates in real-time
- [x] Profile popup shows generation progress
- [x] Badge shows count of active generations
- [x] Completed generations show cover and play button
- [x] Failed generations show error message
- [x] Music player appears when track is played
- [x] Empty state shows when no generations exist
- [x] Click outside closes profile popup
- [x] All animations are smooth (60fps)

## 🔧 Troubleshooting

### Socket.io 404 Errors

These are expected when running without the WebSocket server. The app falls back to client-side simulation automatically.

### Image 404 Errors

If using external images, ensure they're in the `/public/images/` directory or use gradient backgrounds (current implementation).

### Hydration Mismatches

The app uses `use client` directives appropriately. If issues occur, ensure animations only run on client mount.

## 📄 License

MIT License - Feel free to use this code for your projects!

---

Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion
