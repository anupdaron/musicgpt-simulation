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
