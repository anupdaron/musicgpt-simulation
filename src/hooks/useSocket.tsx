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
import { generateWaveformData } from '@/lib/utils';

interface SocketContextType {
  isConnected: boolean;
  submitPrompt: (prompt: string) => Promise<void>;
  retryGeneration: (generationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const addPairedGenerations = useGenerationStore(
    (state) => state.addPairedGenerations,
  );
  const addPairedGenerationsFromServer = useGenerationStore(
    (state) => state.addPairedGenerationsFromServer,
  );
  const addInsufficientCreditsGeneration = useGenerationStore(
    (state) => state.addInsufficientCreditsGeneration,
  );
  const updateGenerationProgress = useGenerationStore(
    (state) => state.updateGenerationProgress,
  );
  const completeGeneration = useGenerationStore(
    (state) => state.completeGeneration,
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

        // Listen for paired generation started - create cards
        socketRef.current.on(
          'PAIRED_GENERATION_STARTED',
          (data: {
            groupId: string;
            prompt: string;
            coverImage: string;
            title: string;
            generationIds: string[];
          }) => {
            console.log('Paired generation started:', data.groupId);
            addPairedGenerationsFromServer(
              data.groupId,
              data.prompt,
              data.title,
              data.coverImage,
            );
          },
        );

        // Listen for individual generation progress
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
              data.message,
            );
          },
        );

        // Listen for individual generation complete
        socketRef.current.on(
          'GENERATION_COMPLETE',
          (data: {
            generationId: string;
            duration: number;
            waveformData: number[];
          }) => {
            completeGeneration(
              data.generationId,
              data.duration,
              data.waveformData,
            );
          },
        );

        // Listen for individual generation failed
        socketRef.current.on(
          'GENERATION_FAILED',
          (data: { generationId: string; error: string }) => {
            failGeneration(data.generationId, data.error);
          },
        );

        // Listen for insufficient credits (single card, not paired)
        socketRef.current.on(
          'INSUFFICIENT_CREDITS',
          (data: { prompt: string }) => {
            addInsufficientCreditsGeneration(data.prompt);
          },
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
    addPairedGenerationsFromServer,
    addInsufficientCreditsGeneration,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
    updateCredits,
  ]);

  // Submit prompt - server decides if paired or insufficient credits
  const submitPrompt = useCallback(
    async (prompt: string) => {
      // If socket is connected, let server decide the flow
      if (socketRef.current?.connected) {
        // Don't create cards yet - server will tell us what to create
        // Either PAIRED_GENERATION_STARTED or INSUFFICIENT_CREDITS
        const groupId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        socketRef.current.emit('START_PAIRED_GENERATION', {
          groupId,
          prompt,
        });
      } else {
        // Fallback: Simulate generation locally
        const { gen1, gen2 } = addPairedGenerations(prompt);

        simulateLocalGeneration(gen1.id, prompt, {
          updateProgress: updateGenerationProgress,
          complete: completeGeneration,
          fail: failGeneration,
        });

        // Start second with slight delay
        setTimeout(() => {
          simulateLocalGeneration(gen2.id, prompt, {
            updateProgress: updateGenerationProgress,
            complete: completeGeneration,
            fail: failGeneration,
          });
        }, 300);

        // Deduct credits
        const currentCredits = useGenerationStore.getState().user.credits;
        updateCredits(Math.max(0, currentCredits - 20));
      }
    },
    [
      addPairedGenerations,
      updateGenerationProgress,
      completeGeneration,
      failGeneration,
      updateCredits,
    ],
  );

  // Retry a single failed generation
  const retryGeneration = useCallback(
    (generationId: string) => {
      const generations = useGenerationStore.getState().generations;
      const generation = generations.find((g) => g.id === generationId);

      if (generation) {
        // Reset progress
        updateGenerationProgress(generationId, 0);

        if (socketRef.current?.connected) {
          socketRef.current.emit('RETRY_GENERATION', {
            generationId,
            prompt: generation.prompt,
          });
        } else {
          simulateLocalGeneration(generationId, generation.prompt, {
            updateProgress: updateGenerationProgress,
            complete: completeGeneration,
            fail: failGeneration,
          });
        }
      }
    },
    [updateGenerationProgress, completeGeneration, failGeneration],
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

// Local simulation function for a single generation
function simulateLocalGeneration(
  generationId: string,
  prompt: string,
  callbacks: {
    updateProgress: (id: string, progress: number, message?: string) => void;
    complete: (id: string, duration: number, waveformData: number[]) => void;
    fail: (id: string, error: string) => void;
  },
) {
  const { updateProgress, complete, fail } = callbacks;

  const willFail = Math.random() < 0.1; // 10% failure rate
  const failAtStep = willFail ? Math.floor(Math.random() * 4) + 2 : -1;

  const progressSteps = [0, 15, 30, 50, 70, 85, 100];
  const progressMessages = [
    'Initializing...',
    'Analyzing prompt...',
    'Generating melody',
    'Creating harmony',
    'Synthesizing',
    'Mixing audio',
    'Finalizing...',
  ];

  let stepIndex = 0;
  const baseInterval = 1200 + Math.floor(Math.random() * 400);

  // Initial progress
  updateProgress(generationId, progressSteps[0], progressMessages[0]);

  const runStep = () => {
    stepIndex++;

    if (willFail && stepIndex === failAtStep) {
      fail(generationId, 'Generation failed. Please retry.');
      return;
    }

    if (stepIndex >= progressSteps.length) {
      complete(
        generationId,
        Math.floor(Math.random() * 120) + 180,
        generateWaveformData(),
      );
      return;
    }

    updateProgress(
      generationId,
      progressSteps[stepIndex],
      progressMessages[Math.min(stepIndex, progressMessages.length - 1)],
    );

    setTimeout(runStep, baseInterval);
  };

  setTimeout(runStep, baseInterval);
}
