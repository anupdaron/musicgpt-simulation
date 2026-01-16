'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '@/store';
import { GenerationCard } from './GenerationCard';
import { EmptyState } from './EmptyState';
import { Loader2 } from 'lucide-react';

// Skeleton component for loading state
function GenerationCardSkeleton() {
  return (
    <div className='p-4 rounded-2xl bg-[#141414] border border-[#262626]'>
      <div className='flex items-center gap-4'>
        {/* Cover skeleton */}
        <div className='relative w-16 h-16 rounded-xl bg-[#1f1f1f] shrink-0 overflow-hidden'>
          <div className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent' />
        </div>

        {/* Content skeleton */}
        <div className='flex-1 min-w-0 space-y-2'>
          <div className='relative h-5 bg-[#1f1f1f] rounded w-2/3 overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.1s' }}
            />
          </div>
          <div className='relative h-4 bg-[#1f1f1f] rounded w-1/2 overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className='flex gap-2'>
          <div className='relative w-10 h-10 rounded-full bg-[#1f1f1f] overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.3s' }}
            />
          </div>
          <div className='relative w-10 h-10 rounded-full bg-[#1f1f1f] overflow-hidden'>
            <div
              className='absolute inset-0 animate-shimmer-slide bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent'
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentGenerations() {
  const generations = useGenerationStore((state) => state.generations);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pagination state for completed generations
  const ITEMS_PER_PAGE = 5;
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Separate active (pending/generating) and completed/failed
  const activeGenerations = generations.filter(
    (g) => g.status === 'pending' || g.status === 'generating'
  );
  const completedGenerations = generations.filter(
    (g) => g.status === 'completed' || g.status === 'failed'
  );

  // Paginated completed generations
  const displayedCompleted = completedGenerations.slice(0, displayedCount);
  const hasMore = displayedCount < completedGenerations.length;

  // Simulate loading more items
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate network delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDisplayedCount((prev) =>
      Math.min(prev + ITEMS_PER_PAGE, completedGenerations.length)
    );
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, completedGenerations.length]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  // Show empty state if no generations
  if (generations.length === 0) {
    return (
      <section className='w-full max-w-4xl mx-auto mt-16'>
        <EmptyState />
      </section>
    );
  }

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className='w-full max-w-4xl mx-auto mt-16'
    >
      {/* Active Generations */}
      {activeGenerations.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B2C] opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-[#FF6B2C]'></span>
            </span>
            In Progress
          </h2>
          <div className='space-y-3'>
            <AnimatePresence mode='popLayout'>
              {activeGenerations.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Generations */}
      {completedGenerations.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-white mb-4'>
            Recent generations
          </h2>
          <div className='space-y-3'>
            <AnimatePresence mode='popLayout'>
              {displayedCompleted.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </AnimatePresence>

            {/* Loading Skeletons */}
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='space-y-3'
              >
                <GenerationCardSkeleton />
                <GenerationCardSkeleton />
                <GenerationCardSkeleton />
              </motion.div>
            )}

            {/* Load More Sentinel (for intersection observer) */}
            {hasMore && !isLoadingMore && (
              <div id='load-more-sentinel' className='py-4'>
                <button
                  onClick={loadMore}
                  className='w-full py-3 rounded-xl border border-[#262626] text-[#737373] hover:text-white hover:border-[#404040] transition-colors flex items-center justify-center gap-2'
                >
                  <Loader2 className='w-4 h-4' />
                  Load more generations
                </button>
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && displayedCompleted.length > ITEMS_PER_PAGE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='py-4 text-center'
              >
                <span className='text-sm text-[#404040]'>
                  You've reached the end
                </span>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}
