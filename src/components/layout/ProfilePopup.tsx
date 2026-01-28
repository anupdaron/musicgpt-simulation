'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronRight, Loader2, Info } from 'lucide-react';
import { useGenerationStore, useUser, useIsProfilePopupOpen } from '@/store';
import { GenerationCard } from '../create/GenerationCard';

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
            className='absolute right-0 top-16 w-100 bg-primary-100 rounded-2xl border border-primary-100 shadow-2xl overflow-hidden z-50'
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-[#262626] px-4 py-4'>
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
            <div className='mx-4 my-4 p-4 bg-primary-250 rounded-2xl'>
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
            <div className='relative'>
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className='max-h-96 overflow-y-auto'
              >
                {/* Generation Items */}
                <AnimatePresence mode='popLayout'>
                  {recentGenerations.map((generation, index) => (
                    <GenerationCard
                      key={generation.id}
                      generation={generation}
                      variant='compact'
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

              {/* Bottom Fade Effect */}
              {recentGenerations.length > 0 && (
                <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#16191c] via-[#16191c]/80 to-transparent pointer-events-none z-10' />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
