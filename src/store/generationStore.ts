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
  isSidebarOpen: boolean;
  isMobileProfileOpen: boolean;
  currentlyPlayingId: string | null;
  isPlaying: boolean;

  // Actions
  addGeneration: (prompt: string) => Generation;
  addPairedGenerations: (prompt: string) => {
    gen1: Generation;
    gen2: Generation;
    groupId: string;
  };
  addPairedGenerationsFromServer: (
    groupId: string,
    prompt: string,
    title: string,
    coverImage: string,
  ) => void;
  addInsufficientCreditsGeneration: (prompt: string) => Generation;
  updateGenerationProgress: (
    id: string,
    progress: number,
    message?: string,
  ) => void;
  completeGeneration: (
    id: string,
    duration: number,
    waveformData: number[],
  ) => void;
  failGeneration: (id: string, error: string) => void;
  removeGeneration: (id: string) => void;

  // UI Actions
  setProfilePopupOpen: (isOpen: boolean) => void;
  toggleProfilePopup: () => void;
  setPlayerOpen: (isOpen: boolean) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setMobileProfileOpen: (isOpen: boolean) => void;
  playTrack: (generationId: string, versionId?: string) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  toggleLike: (id: string) => void;
  toggleDislike: (id: string) => void;
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
  credits: 0,
  maxCredits: 500,
};

// Sample initial generations for demonstration
const initialGenerations: Generation[] = [
  {
    id: 'gen_sample_1a',
    prompt:
      'Create a pop-rock song about old times, nostalgic opera theme style, guitar solo like slash',
    title: 'Crimson Echoes',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3500000),
    coverImage:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    groupId: 'group_1',
    variationNumber: 1,
    versions: [
      {
        id: 'v1_1',
        version: 1,
        duration: 245,
        waveformData: generateWaveformData(),
      },
    ],
  },
  {
    id: 'gen_sample_1b',
    prompt:
      'Create a pop-rock song about old times, nostalgic opera theme style, guitar solo like slash',
    title: 'Crimson Echoes',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 3480000),
    coverImage:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    groupId: 'group_1',
    variationNumber: 2,
    versions: [
      {
        id: 'v1_2',
        version: 1,
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
    variationNumber: 1,
    coverImage:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
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
    variationNumber: 1,
    coverImage:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
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
    variationNumber: 1,
    progress: 100,
    createdAt: new Date(Date.now() - 14400000),
    completedAt: new Date(Date.now() - 14300000),
    coverImage:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
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
    variationNumber: 1,
    createdAt: new Date(Date.now() - 18000000),
    completedAt: new Date(Date.now() - 17900000),
    coverImage:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    versions: [
      {
        id: 'v5_1',
        version: 1,
        duration: 180,
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
    variationNumber: 1,
    createdAt: new Date(Date.now() - 21600000),
    completedAt: new Date(Date.now() - 21500000),
    coverImage:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
    versions: [
      {
        id: 'v6_1',
        version: 1,
        duration: 285,
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
    isSidebarOpen: false,
    isMobileProfileOpen: false,
    currentlyPlayingId: null,
    isPlaying: false,

    // Add single generation (for backwards compatibility)
    addGeneration: (prompt: string) => {
      const genId = generateId();
      const newGeneration: Generation = {
        id: genId,
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

    // Add two paired generations (v1 and v2 as separate cards)
    addPairedGenerations: (prompt: string) => {
      const groupId = generateId();
      const title = generateSongTitle(prompt);
      const coverImage = getRandomCover();
      const createdAt = new Date();

      const gen1: Generation = {
        id: `${groupId}_v1`,
        prompt,
        title,
        status: 'pending',
        progress: 0,
        createdAt,
        versions: [],
        coverImage,
        groupId,
        variationNumber: 1,
      };

      const gen2: Generation = {
        id: `${groupId}_v2`,
        prompt,
        title,
        status: 'pending',
        progress: 0,
        createdAt,
        versions: [],
        coverImage,
        groupId,
        variationNumber: 2,
      };

      set((state) => ({
        generations: [gen1, gen2, ...state.generations],
        activeGenerationId: gen1.id,
      }));

      return { gen1, gen2, groupId };
    },

    // Add paired generations from server response (with specific IDs)
    addPairedGenerationsFromServer: (
      groupId: string,
      prompt: string,
      title: string,
      coverImage: string,
    ) => {
      const createdAt = new Date();

      const gen1: Generation = {
        id: `${groupId}_v1`,
        prompt,
        title,
        status: 'pending',
        progress: 0,
        createdAt,
        versions: [],
        coverImage,
        groupId,
        variationNumber: 1,
        isNew: true,
      };

      const gen2: Generation = {
        id: `${groupId}_v2`,
        prompt,
        title,
        status: 'pending',
        progress: 0,
        createdAt,
        versions: [],
        coverImage,
        groupId,
        variationNumber: 2,
        isNew: true,
      };

      set((state) => ({
        generations: [gen1, gen2, ...state.generations],
        activeGenerationId: gen1.id,
      }));
    },

    // Add single insufficient credits generation (already failed)
    addInsufficientCreditsGeneration: (prompt: string) => {
      const genId = generateId();
      const newGeneration: Generation = {
        id: genId,
        prompt,
        title: generateSongTitle(prompt),
        status: 'failed',
        progress: 0,
        createdAt: new Date(),
        versions: [],
        coverImage: getRandomCover(),
        error: 'Not enough credits',
        isNew: true,
      };

      set((state) => ({
        generations: [newGeneration, ...state.generations],
      }));

      return newGeneration;
    },

    // Update generation progress
    updateGenerationProgress: (
      id: string,
      progress: number,
      message?: string,
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
            : gen,
        ),
      }));
    },

    // Complete generation
    completeGeneration: (
      id: string,
      duration: number,
      waveformData: number[],
    ) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? {
                ...gen,
                status: 'completed' as GenerationStatus,
                progress: 100,
                completedAt: new Date(),
                versions: [
                  {
                    id: `${id}_audio`,
                    version: 1,
                    duration,
                    waveformData,
                  },
                ],
                isNew: true,
              }
            : gen,
        ),
      }));
    },

    // Fail generation
    failGeneration: (id: string, error: string) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? { ...gen, status: 'failed' as GenerationStatus, error }
            : gen,
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

    setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
    toggleSidebar: () =>
      set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setMobileProfileOpen: (isOpen: boolean) =>
      set({ isMobileProfileOpen: isOpen }),

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
          gen.id === id
            ? { ...gen, isLiked: !gen.isLiked, isDisliked: false }
            : gen,
        ),
      }));
    },

    toggleDislike: (id: string) => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.id === id
            ? { ...gen, isDisliked: !gen.isDisliked, isLiked: false }
            : gen,
        ),
      }));
    },

    markGenerationsAsSeen: () => {
      set((state) => ({
        generations: state.generations.map((gen) =>
          gen.isNew ? { ...gen, isNew: false } : gen,
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
  })),
);

// Selector hooks for optimized re-renders
export const useGenerations = () =>
  useGenerationStore((state) => state.generations);
export const useUser = () => useGenerationStore((state) => state.user);
export const useIsProfilePopupOpen = () =>
  useGenerationStore((state) => state.isProfilePopupOpen);
export const useIsPlayerOpen = () =>
  useGenerationStore((state) => state.isPlayerOpen);
export const useIsSidebarOpen = () =>
  useGenerationStore((state) => state.isSidebarOpen);
export const useIsMobileProfileOpen = () =>
  useGenerationStore((state) => state.isMobileProfileOpen);
export const useCurrentlyPlaying = () =>
  useGenerationStore((state) => ({
    id: state.currentlyPlayingId,
    isPlaying: state.isPlaying,
  }));
