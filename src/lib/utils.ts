import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID
export function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Format duration (seconds to MM:SS)
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Generate random waveform data for visualization
export function generateWaveformData(length: number = 50): number[] {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
}

// Generate random song title from prompt
export function generateSongTitle(prompt: string): string {
  const words = prompt.split(' ').filter((w) => w.length > 3);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return prompt.slice(0, 30);
}

// Placeholder prompts for cycling animation
export const PLACEHOLDER_PROMPTS = [
  'A funky house song with female vocals...',
  'An epic orchestral soundtrack for a fantasy movie...',
  'A chill lo-fi beat for studying...',
  'An energetic EDM track with heavy bass drops...',
  'A soulful R&B ballad about love...',
  'A punk rock anthem with aggressive guitars...',
  'A peaceful ambient soundscape for meditation...',
  'A catchy pop song with memorable hooks...',
];

// Sample cover images (using placeholder gradients/colors)
export const SAMPLE_COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

// Get random cover
export function getRandomCover(): string {
  return SAMPLE_COVERS[Math.floor(Math.random() * SAMPLE_COVERS.length)];
}

// Easing functions for animations (matching Figma)
export const EASING = {
  // Standard easing
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  easeIn: [0.4, 0.0, 1, 1] as const,
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
  // Custom spring-like
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  // Smooth deceleration
  decelerate: [0, 0.55, 0.45, 1] as const,
};

// Animation durations (in seconds)
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};
