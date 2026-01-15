'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useGenerationStore } from '@/store';
import type { GenerationVersion } from '@/types';
import { generateWaveformData, getRandomCover } from '@/lib/utils';

interface SocketContextType {
  isConnected: boolean;
  submitPrompt: (prompt: string) => Promise<void>;
  retryGeneration: (generationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const addGeneration = useGenerationStore((state) => state.addGeneration);
  const updateGenerationProgress = useGenerationStore(
    (state) => state.updateGenerationProgress
  );
  const completeGeneration = useGenerationStore(
    (state) => state.completeGeneration
  );
  const failGeneration = useGenerationStore((state) => state.failGeneration);
  const updateCredits = useGenerationStore((state) => state.updateCredits);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        // Fetch to initialize the socket server
        await fetch('/api/socket');

        socketRef.current = io({
          path: '/api/socket/io',
          addTrailingSlash: false,
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        // Listen for generation events
        socketRef.current.on(
          'GENERATION_STARTED',
          (data: { generationId: string }) => {
            console.log('Generation started:', data.generationId);
          }
        );

        socketRef.current.on(
          'GENERATION_PROGRESS',
          (data: {
            generationId: string;
            progress: number;
            message?: string;
          }) => {
            updateGenerationProgress(
              data.generationId,
              data.progress,
              data.message
            );
          }
        );

        socketRef.current.on(
          'GENERATION_COMPLETE',
          (data: {
            generationId: string;
            versions: GenerationVersion[];
            coverImage: string;
            title: string;
          }) => {
            completeGeneration(
              data.generationId,
              data.versions,
              data.coverImage,
              data.title
            );
          }
        );

        socketRef.current.on(
          'GENERATION_FAILED',
          (data: { generationId: string; error: string }) => {
            failGeneration(data.generationId, data.error);
          }
        );

        socketRef.current.on('CREDITS_UPDATED', (data: { credits: number }) => {
          updateCredits(data.credits);
        });
      } catch (error) {
        console.error('Socket initialization error:', error);
        // Fall back to simulation mode
        setIsConnected(true); // Pretend connected for simulation
      }
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
    updateCredits,
  ]);

  // Submit prompt and start generation simulation
  const submitPrompt = useCallback(
    async (prompt: string) => {
      const generation = addGeneration(prompt);

      // If socket is connected, emit to server
      if (socketRef.current?.connected) {
        socketRef.current.emit('START_GENERATION', {
          generationId: generation.id,
          prompt,
        });
      } else {
        // Fallback: Simulate generation locally
        simulateGeneration(generation.id, prompt, {
          updateProgress: updateGenerationProgress,
          complete: completeGeneration,
          fail: failGeneration,
          updateCredits,
        });
      }
    },
    [
      addGeneration,
      updateGenerationProgress,
      completeGeneration,
      failGeneration,
      updateCredits,
    ]
  );

  // Retry failed generation
  const retryGeneration = useCallback(
    (generationId: string) => {
      const generations = useGenerationStore.getState().generations;
      const generation = generations.find((g) => g.id === generationId);

      if (generation) {
        // Reset and restart
        updateGenerationProgress(generationId, 0);

        if (socketRef.current?.connected) {
          socketRef.current.emit('RETRY_GENERATION', { generationId });
        } else {
          simulateGeneration(generationId, generation.prompt, {
            updateProgress: updateGenerationProgress,
            complete: completeGeneration,
            fail: failGeneration,
            updateCredits,
          });
        }
      }
    },
    [
      updateGenerationProgress,
      completeGeneration,
      failGeneration,
      updateCredits,
    ]
  );

  return (
    <SocketContext.Provider
      value={{ isConnected, submitPrompt, retryGeneration }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Local simulation function (used when WebSocket server is not available)
function simulateGeneration(
  generationId: string,
  prompt: string,
  callbacks: {
    updateProgress: (id: string, progress: number, message?: string) => void;
    complete: (
      id: string,
      versions: GenerationVersion[],
      coverImage: string,
      title: string
    ) => void;
    fail: (id: string, error: string) => void;
    updateCredits: (credits: number) => void;
  }
) {
  const { updateProgress, complete, fail, updateCredits } = callbacks;

  // Simulate random failure (10% chance)
  const willFail = Math.random() < 0.1;
  const failAtProgress = Math.floor(Math.random() * 60) + 20; // Fail between 20-80%

  let progress = 0;
  const progressMessages = [
    'Starting AI audio engine',
    'Analyzing prompt...',
    'Generating melody structure',
    'Synthesizing instruments',
    'Adding vocal layers',
    'Mixing and mastering',
    'Finalizing output',
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5; // Random increment 5-20

    if (willFail && progress >= failAtProgress) {
      clearInterval(interval);
      fail(generationId, 'Server busy. 4.9K users in the queue.');
      return;
    }

    if (progress >= 100) {
      clearInterval(interval);

      // Generate completed versions
      const versions: GenerationVersion[] = [
        {
          id: `${generationId}_v1`,
          version: 1,
          duration: Math.floor(Math.random() * 120) + 180, // 3-5 minutes
          waveformData: generateWaveformData(),
        },
        {
          id: `${generationId}_v2`,
          version: 2,
          duration: Math.floor(Math.random() * 120) + 180,
          waveformData: generateWaveformData(),
        },
      ];

      // Generate title from prompt
      const words = prompt.split(' ').filter((w) => w.length > 3);
      const title =
        words.length >= 2
          ? words
              .slice(0, 3)
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ')
          : prompt.slice(0, 30);

      complete(generationId, versions, getRandomCover(), title);

      // Deduct credits
      const currentCredits = useGenerationStore.getState().user.credits;
      updateCredits(Math.max(0, currentCredits - 20));
    } else {
      const messageIndex = Math.min(
        Math.floor(progress / 15),
        progressMessages.length - 1
      );
      updateProgress(generationId, progress, progressMessages[messageIndex]);
    }
  }, 800); // Update every 800ms
}
