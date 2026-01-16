'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Settings,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import {
  useGenerationStore,
  useUser,
  useIsMobileProfileOpen,
  useGenerations,
} from '@/store';
import { GradientProgress } from '../ui/GradientProgress';
import { useSocket } from '@/hooks/useSocket';

// Skeleton component for loading state
function GenerationItemSkeleton() {
  return (
    <div className='flex items-center gap-3 p-4'>
      <div className='relative w-14 h-14 rounded-xl bg-[#1f1f1f] shrink-0 overflow-hidden'>
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
      <div className='relative w-8 h-8 rounded-full bg-[#1f1f1f] overflow-hidden'>
        <div
          className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
          style={{ animationDelay: '0.3s' }}
        />
      </div>
    </div>
  );
}

// Mobile Generation Item Component - Full feature parity with desktop
interface MobileGenerationItemProps {
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
  };
}

function MobileGenerationItem({ generation }: MobileGenerationItemProps) {
  const {
    id,
    status,
    progress,
    title,
    prompt,
    error,
    versions,
    coverImage,
    isNew,
  } = generation;
  const { retryGeneration } = useSocket();

  // Failed state
  if (status === 'failed') {
    return (
      <div className='p-4 border-b border-[#1A1A1A]'>
        {error?.includes('Server busy') ? (
          // Server Busy Error
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
        ) : (
          // Invalid Prompt Error
          <div className='p-4 rounded-xl bg-[#1A1A1A]'>
            <div className='flex items-start gap-3'>
              <div
                className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(200, 0, 255, 1) 0%, rgba(255, 44, 155, 1) 25%, rgba(255, 123, 0, 1) 50%, rgba(255, 133, 4, 1) 75%, rgba(255, 211, 99, 1) 100%)',
                }}
              >
                <span className='text-2xl'>🥲</span>
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-white text-sm'>
                  Invalid Prompt
                </div>
                <p className='text-xs text-[#737373] mt-0.5 truncate'>
                  {prompt}
                </p>
              </div>
            </div>
            <p className='text-sm text-[#A3A3A3] mt-3'>
              Your prompt does not seem to be valid.
            </p>
            <div className='flex gap-2 mt-4'>
              <button
                onClick={() => retryGeneration(id)}
                className='flex-1 px-4 py-2 text-sm text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
              >
                Retry
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(prompt)}
                className='flex-1 px-4 py-2 text-sm text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
              >
                Copy prompt
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Generating/Pending state
  if (status === 'generating' || status === 'pending') {
    return (
      <div className='p-4 border-b border-[#1A1A1A]'>
        <div className='relative rounded-xl overflow-hidden bg-[#141414]'>
          {/* Progress background */}
          <motion.div
            className='absolute inset-0 bg-[#ffffff0d]'
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <div className='relative flex items-center gap-3 p-3'>
            <GradientProgress
              progress={progress}
              size={48}
              imageUrl='/art.jpg'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-white truncate'>
                {prompt.length > 30 ? prompt.slice(0, 30) + '...' : prompt}
              </p>
              <div className='flex items-center gap-2 mt-1'>
                <Clock className='w-3 h-3 text-[#525252]' />
                <span className='text-xs text-[#525252]'>
                  {status === 'generating' ? 'Generating...' : 'In queue...'}
                </span>
              </div>
            </div>
            {versions.length > 0 && (
              <span className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5'>
                v{versions.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Completed state
  return (
    <div className='flex items-center gap-3 p-4 border-b border-[#1A1A1A]'>
      {/* Cover Image */}
      <div className='relative w-14 h-14 shrink-0'>
        <div className='w-full h-full rounded-xl overflow-hidden'>
          <Image
            src='/art.jpg'
            alt={title}
            fill
            className='object-cover rounded-xl'
          />
        </div>
        {/* New generation indicator */}
        {isNew && (
          <div className='absolute -top-1 -left-1 z-10'>
            <span className='relative flex h-4 w-4'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75'></span>
              <span className='relative inline-flex rounded-full h-4 w-4 bg-[#22C55E]'></span>
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <p className='text-white font-medium truncate'>{title}</p>
        <p className='text-sm text-[#737373] truncate'>{prompt}</p>
      </div>

      {/* Version badges + Download */}
      <div className='flex items-center gap-2'>
        {versions.length > 1 && (
          <div className='flex gap-1'>
            {versions.slice(0, 2).map((v, i) => (
              <span
                key={i}
                className='text-xs text-[#525252] border border-[#333333] rounded px-1 py-0.5'
              >
                v{v.version}
              </span>
            ))}
          </div>
        )}
        <button className='w-10 h-10 flex items-center justify-center text-[#737373] hover:text-white transition-colors'>
          <Download className='w-5 h-5' />
        </button>
      </div>
    </div>
  );
}

export function MobileProfile() {
  const user = useUser();
  const generations = useGenerations();
  const isOpen = useIsMobileProfileOpen();
  const setMobileProfileOpen = useGenerationStore(
    (state) => state.setMobileProfileOpen
  );
  const markGenerationsAsSeen = useGenerationStore(
    (state) => state.markGenerationsAsSeen
  );

  // Pagination state
  const ITEMS_PER_PAGE = 6;
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get all generations (not just completed)
  const displayedGenerations = generations.slice(0, displayedCount);
  const hasMore = displayedCount < generations.length;

  // Check for insufficient credits
  const hasInsufficientCredits = user.credits === 0;

  // Count active generations (in progress) + new completed generations
  const activeCount = generations.filter(
    (g) =>
      g.status === 'generating' ||
      g.status === 'pending' ||
      g.status === 'failed' ||
      g.isNew
  ).length;

  // Reset pagination when opened
  useEffect(() => {
    if (isOpen) {
      setDisplayedCount(ITEMS_PER_PAGE);
    }
  }, [isOpen]);

  // Mark generations as seen when closed
  useEffect(() => {
    if (!isOpen) {
      markGenerationsAsSeen();
    }
  }, [isOpen, markGenerationsAsSeen]);

  // Load more with simulated delay
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDisplayedCount((prev) =>
      Math.min(prev + ITEMS_PER_PAGE, generations.length)
    );
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, generations.length]);

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore();
      }
    },
    [loadMore]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className='md:hidden fixed inset-0 bg-[#0D0D0D] z-50 flex flex-col'
        >
          {/* Header */}
          <div className='flex items-center gap-3 p-4 border-b border-[#1A1A1A]'>
            <button
              onClick={() => setMobileProfileOpen(false)}
              className='flex items-center gap-1 text-[#A3A3A3] hover:text-white transition-colors'
            >
              <ChevronLeft className='w-5 h-5' />
              <span className='text-sm'>Back</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className='p-6 border-b border-[#1A1A1A]'>
            <div className='flex items-center gap-4'>
              {/* Avatar with gradient border like desktop */}
              <div className='relative w-16 h-16 rounded-full'>
                <div className='absolute inset-0 bg-linear-to-br from-[#FF6B2C] to-[#FF2C9C] rounded-full' />
                <div className='absolute inset-0.5 bg-[#0D0D0D] rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold text-xl'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className='flex-1'>
                <h2 className='font-semibold text-white text-lg'>
                  {user.displayName}
                </h2>
                <p className='text-sm text-[#737373]'>@{user.username}</p>
              </div>
              <button className='w-10 h-10 rounded-lg bg-[#262626] hover:bg-[#333333] flex items-center justify-center transition-colors'>
                <Settings className='w-5 h-5 text-[#A3A3A3]' />
              </button>
            </div>

            {/* Credits */}
            <div className='mt-6 flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#262626]'>
              <div className='flex items-center gap-2'>
                <span className='text-white font-medium'>
                  {user.credits} / {user.maxCredits} credits
                </span>
                <button className='w-4 h-4 rounded-full bg-[#262626] flex items-center justify-center'>
                  <span className='text-[10px] text-[#737373]'>?</span>
                </button>
              </div>
              <button className='flex items-center gap-1 text-sm text-white bg-[#262626] px-4 py-2 rounded-lg hover:bg-[#333333] transition-colors'>
                Upgrade
                <ChevronLeft className='w-4 h-4 rotate-180' />
              </button>
            </div>
          </div>

          {/* Generations List */}
          <div className='flex-1 overflow-y-auto' onScroll={handleScroll}>
            {/* Insufficient Credits Warning */}
            {hasInsufficientCredits && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='p-3 mx-4 mt-4 rounded-lg bg-[#261A14] border border-[#3D2A1F] flex items-center justify-between'
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

            {displayedGenerations.length === 0 ? (
              <div className='p-8 text-center text-[#525252]'>
                <p>No generations yet</p>
              </div>
            ) : (
              <div>
                <AnimatePresence mode='popLayout'>
                  {displayedGenerations.map((generation) => (
                    <motion.div
                      key={generation.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <MobileGenerationItem generation={generation} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading Skeletons */}
                {isLoadingMore && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <GenerationItemSkeleton />
                    <GenerationItemSkeleton />
                    <GenerationItemSkeleton />
                  </motion.div>
                )}

                {/* End of list */}
                {!hasMore && displayedGenerations.length > ITEMS_PER_PAGE && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='p-4 text-center text-sm text-[#404040]'
                  >
                    No more generations
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
