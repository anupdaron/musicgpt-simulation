'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Info,
} from 'lucide-react';
import { useGenerationStore, useUser, useIsProfilePopupOpen } from '@/store';
import { GradientProgress } from '../ui/GradientProgress';
import { useSocket } from '@/hooks/useSocket';

// Shimmer effect skeleton variant
function GenerationSkeletonShimmer() {
  return (
    <div className='p-3 mx-3 my-2'>
      <div className='flex items-center gap-3'>
        <div className='relative w-16 h-16 rounded-xl bg-[#1f1f1f] shrink-0 overflow-hidden'>
          <div className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent' />
        </div>
        <div className='flex-1 min-w-0 space-y-2'>
          <div className='relative h-4 bg-[#1f1f1f] rounded w-3/4 overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.1s' }}
            />
          </div>
          <div className='relative h-3 bg-[#1f1f1f] rounded w-1/2 overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>
        <div className='relative h-5 w-8 bg-[#1f1f1f] rounded overflow-hidden'>
          <div
            className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProfilePopup() {
  const user = useUser();
  const isOpen = useIsProfilePopupOpen();
  const togglePopup = useGenerationStore((state) => state.toggleProfilePopup);
  const setPopupOpen = useGenerationStore((state) => state.setProfilePopupOpen);
  const generations = useGenerationStore((state) => state.generations);
  const markGenerationsAsSeen = useGenerationStore(
    (state) => state.markGenerationsAsSeen,
  );
  const popupRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 5;
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Get displayed generations based on pagination
  const displayedGenerations = generations.slice(0, displayedCount);

  // Update hasMore when generations or displayedCount changes
  useEffect(() => {
    setHasMore(displayedCount < generations.length);
  }, [displayedCount, generations.length]);

  // Reset pagination when popup opens
  useEffect(() => {
    if (isOpen) {
      setDisplayedCount(ITEMS_PER_PAGE);
      setHasMore(generations.length > ITEMS_PER_PAGE);
    }
  }, [isOpen, generations.length]);

  // Simulate loading more items (mimics API fetch delay)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate network delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDisplayedCount((prev) => {
      const newCount = prev + ITEMS_PER_PAGE;
      return Math.min(newCount, generations.length);
    });
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, generations.length]);

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollThreshold = 50; // pixels from bottom

      if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
        loadMore();
      }
    },
    [loadMore],
  );

  // Get recent generations (most recent first, max 5)
  const recentGenerations = displayedGenerations;

  // Count active generations (in progress) + new completed generations
  const activeCount = generations.filter(
    (g) =>
      g.status === 'generating' ||
      g.status === 'pending' ||
      g.status === 'failed' ||
      g.isNew,
  ).length;

  // Check for insufficient credits
  const hasInsufficientCredits = user.credits === 0;

  // Mark generations as seen when popup is closed
  useEffect(() => {
    if (!isOpen) {
      // Mark as seen when dropdown closes
      markGenerationsAsSeen();
    }
  }, [isOpen, markGenerationsAsSeen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setPopupOpen]);

  return (
    <div className='relative' ref={popupRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={togglePopup}
        className='relative w-12 h-12 rounded-full border-2 border-transparent  transition-all focus-ring'
      >
        {/* Avatar with gradient border */}
        <div className='absolute inset-0 bg-linear-to-br from-[#FF6B2C] to-[#FF2C9C] rounded-full' />
        <div className='absolute inset-0.5 bg-[#1A1A1A] rounded-full flex items-center justify-center'>
          <span className='text-white font-semibold text-sm'>
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Notification Badge */}
        {activeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#6bfeab] rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#0D0D0D]'
          >
            {activeCount}
          </motion.span>
        )}
      </button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0, 0.55, 0.45, 1] }}
            className='absolute space-y-4 right-0 top-16 w-100 bg-primary-100 rounded-2xl border border-primary-100 shadow-2xl overflow-hidden z-50 p-4'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#262626]'>
              <div className='flex items-center gap-3'>
                <div className='relative w-16 h-16 rounded-full'>
                  <div className='absolute inset-0 bg-gradient-to-br from-[#FF6B2C] to-[#FF2C9C] rounded-full' />
                  <div className='absolute inset-0.5 bg-[#1A1A1A] rounded-full flex items-center justify-center'>
                    <span className='text-white font-semibold'>
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className='font-semibold text-white'>
                    {user.displayName}
                  </div>
                  <div className='text-sm text-[#737373]'>@{user.username}</div>
                </div>
              </div>
              <button className='w-8 h-8 rounded-lg bg-[#262626] hover:bg-[#333333] flex items-center justify-center transition-colors'>
                <Settings className='w-4 h-4 text-[#A3A3A3]' />
              </button>
            </div>

            {/* Credits */}
            <div className='p-4 bg-primary-250 rounded-2xl'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-white'>
                    {user.credits}/{user.maxCredits} credits
                  </span>
                  <button className='text-primary-1000'>
                    <Info className='w-4 h-4' />
                  </button>
                </div>
                <button className='flex items-center gap-1 text-sm hover:text-white transition-colors'>
                  Top Up <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Generations List */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className='max-h-80 overflow-y-auto'
            >
              {/* Insufficient Credits Warning */}
              {hasInsufficientCredits && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='p-3 mx-3 mt-3 rounded-lg bg-[#261A14] border border-[#3D2A1F] flex items-center justify-between'
                >
                  <div className='flex items-center gap-2'>
                    <AlertTriangle className='w-4 h-4 text-[#F59E0B]' />
                    <div>
                      <div className='text-sm font-medium text-[#F59E0B]'>
                        Insufficient credits
                      </div>
                      <div className='text-xs text-[#A3A3A3]'>
                        Your credit balance : 0
                      </div>
                    </div>
                  </div>
                  <button className='px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors'>
                    Top Up
                  </button>
                </motion.div>
              )}

              {/* Generation Items */}
              <AnimatePresence mode='popLayout'>
                {recentGenerations.map((generation, index) => (
                  <GenerationItem
                    key={generation.id}
                    generation={generation}
                    index={index}
                  />
                ))}
              </AnimatePresence>

              {/* Loading Skeletons for infinite scroll */}
              {isLoadingMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GenerationSkeletonShimmer />
                  <GenerationSkeletonShimmer />
                  <GenerationSkeletonShimmer />
                </motion.div>
              )}

              {/* Load More Indicator */}
              {hasMore && !isLoadingMore && recentGenerations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='py-3 text-center'
                >
                  <button
                    onClick={loadMore}
                    className='text-xs text-[#525252] hover:text-[#737373] transition-colors flex items-center gap-1 mx-auto'
                  >
                    <Loader2 className='w-3 h-3' />
                    Scroll for more
                  </button>
                </motion.div>
              )}

              {/* End of list indicator */}
              {!hasMore && recentGenerations.length > ITEMS_PER_PAGE && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='py-3 text-center'
                >
                  <span className='text-xs text-[#404040]'>
                    No more generations
                  </span>
                </motion.div>
              )}

              {recentGenerations.length === 0 && (
                <div className='p-8 text-center text-[#525252]'>
                  <p className='text-sm'>No generations yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GenerationItemProps {
  generation: {
    id: string;
    title: string;
    prompt: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    progress: number;
    error?: string;
    versions: Array<{ version: number }>;
    coverImage?: string;
    isNew?: boolean;
    variationNumber?: number;
  };
  index: number;
}

function GenerationItem({ generation, index }: GenerationItemProps) {
  const {
    status,
    progress,
    title,
    prompt,
    error,
    versions,
    coverImage,
    id,
    isNew,
    variationNumber,
  } = generation;
  const { retryGeneration } = useSocket();
  const removeGeneration = useGenerationStore(
    (state) => state.removeGeneration,
  );
  console.log('Rendering GenerationItem:', id, status);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className='p-3 mx-3 my-2'
    >
      {status === 'failed' && error?.includes('Server busy') ? (
        // Server Busy Error - Simple inline design
        <div className='p-3 rounded-lg bg-[#1A1A1A]'>
          <div className='flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4 text-[#EF4444]' />
            <span className='text-sm text-[#EF4444]'>Oops! Server busy.</span>
          </div>
          <p className='text-sm text-[#A3A3A3] mt-1'>
            4.9K users in the queue.{' '}
            <button
              onClick={() => retryGeneration(id)}
              className='text-white underline hover:no-underline'
            >
              Retry
            </button>
          </p>
        </div>
      ) : status === 'failed' && error?.includes('Invalid prompt') ? (
        // Invalid Prompt Error - Card with icon
        <div className='p-4 rounded-xl bg-[#1A1A1A]'>
          <div className='flex items-start gap-3'>
            <div className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#D89C3A]'>
              <Image
                src='/smiling-face-with-tear.png'
                alt='Smiling Face with Tear'
                width={34}
                height={34}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='font-medium text-white text-sm'>
                Invalid Prompt
              </div>
              <p className='text-xs text-[#737373] mt-0.5 truncate'>{prompt}</p>
            </div>
          </div>
          <p className='text-sm text-[#A3A3A3] mt-3'>
            Your prompt does not seem to be valid. Please provide a prompt
            related to song creation, remixing, covers, or similar music tasks.
          </p>
          <div className='flex gap-2 mt-4'>
            <button
              onClick={() => retryGeneration(id)}
              className='px-4 py-2 text-sm text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
            >
              Retry
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(prompt)}
              className='px-4 py-2 text-sm text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
            >
              Copy prompt
            </button>
          </div>
        </div>
      ) : status === 'generating' || status === 'pending' ? (
        <div className='relative rounded-xl overflow-hidden'>
          {/* Progress background */}
          <motion.div
            className='absolute inset-0 bg-[#ffffff0d]'
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className='relative flex items-center gap-3 p-2'>
            <GradientProgress
              progress={progress}
              size={44}
              imageUrl='/art.jpg'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-xs text-[#A3A3A3] truncate'>
                {prompt.length > 35 ? prompt.slice(0, 35) + '...' : prompt}
              </p>
              <p className='text-xs text-[#525252] mt-0.5'>
                {status === 'generating'
                  ? 'Starting AI audio engine'
                  : 'In queue...'}
              </p>
            </div>
            {versions.length > 0 && (
              <span className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5'>
                v{versions.length}
              </span>
            )}
          </div>
        </div>
      ) : status === 'completed' ? (
        <div className='flex items-center gap-3'>
          <div className='relative w-16 h-16 shrink-0'>
            <div className='w-full h-full rounded-xl overflow-hidden'>
              <Image
                src='/art.jpg'
                alt={title}
                fill
                className='object-cover rounded-xl'
              />
            </div>
            {/* Green heartbeat blip for new generations */}
            {isNew && (
              <div className='absolute -top-1 -left-1 z-10'>
                <span className='relative flex h-5 w-5'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-5 w-5 bg-[#22C55E]'></span>
                </span>
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm text-white font-medium truncate'>{title}</p>
            <p className='text-xs text-[#525252] mt-0.5'>Completed</p>
          </div>
          <div className='flex gap-1'>
            <span className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5'>
              v{variationNumber}
            </span>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
