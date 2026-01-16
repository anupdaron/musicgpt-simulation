import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Generation,
  UserProfile,
  GenerationStatus,
  GenerationVersion,
} from '@/types';
import {
  generateId,
  generateSongTitle,
  getRandomCover,
  generateWaveformData,
} from '@/lib/utils';

interface GenerationState {
  // Generations
  generations: Generation[];
  activeGenerationId: string | null;

  // User Profile
  user: UserProfile;

  // UI State
  isProfilePopupOpen: boolean;
  isPlayerOpen: boolean;
  currentlyPlayingId: string | null;
  isPlaying: boolean;

  // Actions
  addGeneration: (prompt: string) => Generation;
  updateGenerationProgress: (
    id: string,
    progress: number,
    message?: string
  ) => void;
  completeGeneration: (
    id: string,
    versions: GenerationVersion[],
    coverImage: string,
    title: string
  ) => void;
  failGeneration: (id: string, error: string) => void;
  removeGeneration: (id: string) => void;

  // UI Actions
  setProfilePopupOpen: (isOpen: boolean) => void;
  toggleProfilePopup: () => void;
  setPlayerOpen: (isOpen: boolean) => void;
  playTrack: (generationId: string, versionId?: string) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  toggleLike: (id: string) => void;
  markGenerationsAsSeen: () => void;

  // User Actions
  updateCredits: (credits: number) => void;

  // Selectors (computed)
  getGenerationsByStatus: (status: GenerationStatus) => Generation[];
  getActiveGeneration: () => Generation | undefined;
  getPendingCount: () => number;
  getGeneratingCount: () => number;
}

// Initial user profile
const initialUser: UserProfile = {
  id: 'user_1',
  username: 'johnny',
  displayName: 'Johnny',
  credits: 120,
  maxCredits: 500,
};

// Sample initial generations for demonstration
const initialGenerations: Generation[] = [
  {
    id: 'gen_sample_1',
    prompt:
      'Create a pop-rock song about old times, nostalgic opera theme style, guitar solo like slash',
    title: 'Crimson Echoes',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3500000),
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    versions: [
      {
        id: 'v1_1',
        version: 1,
        duration: 245,
        waveformData: generateWaveformData(),
      },
      {
        id: 'v1_2',
        version: 2,
        duration: 238,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_2',
    prompt: "Don't look back in anger, Sally",
    title: "Don't look back in anger, Sally",
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 7200000),
    completedAt: new Date(Date.now() - 7100000),
    coverImage: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    versions: [
      {
        id: 'v2_1',
        version: 1,
        duration: 312,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_3',
    prompt: 'Upbeat electronic dance track with synth arpeggios',
    title: 'Neon Dreams',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 10800000),
    completedAt: new Date(Date.now() - 10700000),
    coverImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    versions: [
      {
        id: 'v3_1',
        version: 1,
        duration: 198,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_4',
    prompt: 'Chill lo-fi beats for studying, jazzy piano samples',
    title: 'Midnight Coffee',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 14400000),
    completedAt: new Date(Date.now() - 14300000),
    coverImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    versions: [
      {
        id: 'v4_1',
        version: 1,
        duration: 267,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_5',
    prompt: 'Epic orchestral trailer music with brass and strings',
    title: 'Rise of Heroes',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 18000000),
    completedAt: new Date(Date.now() - 17900000),
    coverImage: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    versions: [
      {
        id: 'v5_1',
        version: 1,
        duration: 180,
        waveformData: generateWaveformData(),
      },
      {
        id: 'v5_2',
        version: 2,
        duration: 195,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_6',
    prompt: 'Acoustic folk ballad about mountain trails',
    title: 'Wandering Souls',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 21600000),
    completedAt: new Date(Date.now() - 21500000),
    coverImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    versions: [
      {
        id: 'v6_1',
        version: 1,
        duration: 285,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_7',
    prompt: 'Heavy metal anthem with double bass drums',
    title: 'Steel Thunder',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 25200000),
    completedAt: new Date(Date.now() - 25100000),
    coverImage: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    versions: [
      {
        id: 'v7_1',
        version: 1,
        duration: 320,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_8',
    prompt: 'Smooth R&B love song with soulful vocals',
    title: 'Velvet Touch',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 28800000),
    completedAt: new Date(Date.now() - 28700000),
    coverImage: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    versions: [
      {
        id: 'v8_1',
        version: 1,
        duration: 256,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_9',
    prompt: 'Reggae summer vibes with steel drums',
    title: 'Island Breeze',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 32400000),
    completedAt: new Date(Date.now() - 32300000),
    coverImage: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    versions: [
      {
        id: 'v9_1',
        version: 1,
        duration: 234,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_10',
    prompt: 'Cinematic ambient soundscape for meditation',
    title: 'Ethereal Waves',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 36000000),
    completedAt: new Date(Date.now() - 35900000),
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    versions: [
      {
        id: 'v10_1',
        version: 1,
        duration: 420,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_11',
    prompt: 'Funky disco groove with slap bass',
    title: 'Disco Inferno',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 39600000),
    completedAt: new Date(Date.now() - 39500000),
    coverImage: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    versions: [
      {
        id: 'v11_1',
        version: 1,
        duration: 278,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_12',
    prompt: 'Classical piano sonata inspired by Chopin',
    title: 'Moonlit Sonata',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 43200000),
    completedAt: new Date(Date.now() - 43100000),
    coverImage: 'linear-gradient(135deg, #2c3e50 0%, #bdc3c7 100%)',
    versions: [
      {
        id: 'v12_1',
        version: 1,
        duration: 365,
        waveformData: generateWaveformData(),
      },
    ],
  },
];

export const useGenerationStore = create<GenerationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    generations: initialGenerations,
    activeGenerationId: null,
    user: initialUser,
    isProfilePopupOpen: false,
    isPlayerOpen: false,
    currentlyPlayingId: null,
    isPlaying: false,

    // Add new generation (returns the created generation)
    addGeneration: (prompt: string) => {
      const newGeneration: Generation = {
        id: generateId(),
        prompt,
        title: generateSongTitle(prompt),
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        versions: [],
        coverImage: getRandomCover(),
      };

      set((state) => ({
        generations: [newGeneration, ...state.generations],
        activeGenerationId: newGeneration.id,
      }));

      return newGeneration;
    },

    // Update generation progress
    updateGenerationProgress: (
      id: string,
      progress: number,
      message?: string
    ) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? {
                ...gen,
                status: 'generating' as GenerationStatus,
                progress,
                ...(message && { statusMessage: message }),
              }
            : gen
        ),
      }));
    },

    // Complete generation
    completeGeneration: (
      id: string,
      versions: GenerationVersion[],
      coverImage: string,
      title: string
    ) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? {
                ...gen,
                status: 'completed' as GenerationStatus,
                progress: 100,
                completedAt: new Date(),
                versions,
                coverImage,
                title,
                isNew: true,
              }
            : gen
        ),
      }));
    },

    // Fail generation
    failGeneration: (id: string, error: string) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? { ...gen, status: 'failed' as GenerationStatus, error }
            : gen
        ),
      }));
    },

    // Remove generation
    removeGeneration: (id: string) => {
      set((state) => ({
        generations: state.generations.filter((gen) => gen.id !== id),
        ...(state.activeGenerationId === id && { activeGenerationId: null }),
        ...(state.currentlyPlayingId === id && {
          currentlyPlayingId: null,
          isPlaying: false,
        }),
      }));
    },

    // UI Actions
    setProfilePopupOpen: (isOpen: boolean) =>
      set({ isProfilePopupOpen: isOpen }),
    toggleProfilePopup: () =>
      set((state) => ({ isProfilePopupOpen: !state.isProfilePopupOpen })),

    setPlayerOpen: (isOpen: boolean) => set({ isPlayerOpen: isOpen }),

    playTrack: (generationId: string) => {
      set({
        currentlyPlayingId: generationId,
        isPlaying: true,
        isPlayerOpen: true,
      });
    },

    pauseTrack: () => set({ isPlaying: false }),

    togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

    toggleLike: (id: string) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id ? { ...gen, isLiked: !gen.isLiked } : gen
        ),
      }));
    },

    markGenerationsAsSeen: () => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.isNew ? { ...gen, isNew: false } : gen
        ),
      }));
    },

    // User Actions
    updateCredits: (credits: number) => {
      set((state) => ({
        user: { ...state.user, credits },
      }));
    },

    // Selectors
    getGenerationsByStatus: (status: GenerationStatus) => {
      return get().generations.filter((gen) => gen.status === status);
    },

    getActiveGeneration: () => {
      const { generations, activeGenerationId } = get();
      return generations.find((gen) => gen.id === activeGenerationId);
    },

    getPendingCount: () => {
      return get().generations.filter((gen) => gen.status === 'pending').length;
    },

    getGeneratingCount: () => {
      return get().generations.filter((gen) => gen.status === 'generating')
        .length;
    },
  }))
);

// Selector hooks for optimized re-renders
export const useGenerations = () =>
  useGenerationStore((state) => state.generations);
export const useUser = () => useGenerationStore((state) => state.user);
export const useIsProfilePopupOpen = () =>
  useGenerationStore((state) => state.isProfilePopupOpen);
export const useIsPlayerOpen = () =>
  useGenerationStore((state) => state.isPlayerOpen);
export const useCurrentlyPlaying = () =>
  useGenerationStore((state) => ({
    id: state.currentlyPlayingId,
    isPlaying: state.isPlaying,
  }));
