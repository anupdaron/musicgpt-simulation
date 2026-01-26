'use client';

import React, { useState, memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  Check,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useGenerationStore } from '@/store';
import { useSocket } from '@/hooks/useSocket';
import { cn, formatDuration } from '@/lib/utils';
import { GradientProgress } from '../ui/GradientProgress';
import type { Generation } from '@/types';

// Memoized shine text component to prevent animation restart on parent re-renders
const ShineText = memo(function ShineText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'text-sm font-medium truncate gradient-text-animation',
        className,
      )}
    >
      {children}
    </h3>
  );
});

interface GenerationCardProps {
  generation: Generation;
  variant?: 'full' | 'compact';
  index?: number;
}

export function GenerationCard({
  generation,
  variant = 'full',
  index = 0,
}: GenerationCardProps) {
  const {
    id,
    title,
    prompt,
    status,
    progress,
    coverImage,
    versions,
    error,
    isLiked,
    isDisliked,
    isNew,
    variationNumber,
    groupId,
  } = generation;
  const playTrack = useGenerationStore((state) => state.playTrack);
  const toggleLike = useGenerationStore((state) => state.toggleLike);
  const toggleDislike = useGenerationStore((state) => state.toggleDislike);
  const currentlyPlayingId = useGenerationStore(
    (state) => state.currentlyPlayingId,
  );
  const isPlaying = useGenerationStore((state) => state.isPlaying);
  const togglePlayPause = useGenerationStore((state) => state.togglePlayPause);
  const removeGeneration = useGenerationStore(
    (state) => state.removeGeneration,
  );
  const { retryGeneration } = useSocket();

  // Hover states (must be at top level, not in conditionals)
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredCompact, setIsHoveredCompact] = useState(false);

  const isCurrentlyPlaying = currentlyPlayingId === id && isPlaying;
  const isCompact = variant === 'compact';

  const handlePlay = () => {
    if (status !== 'completed') return;
    if (currentlyPlayingId === id) {
      togglePlayPause();
    } else {
      playTrack(id);
    }
  };

  // Green blinking indicator for new generations
  const NewIndicator = () => (
    <div className='absolute -top-1 -left-1 z-10'>
      <span className='relative flex h-4 w-4'>
        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6bffac] opacity-75'></span>
        <span className='relative inline-flex rounded-full h-4 w-4 bg-[#6bffac]'></span>
      </span>
    </div>
  );

  // COMPACT VARIANT - for ProfilePopup
  if (isCompact) {
    // Invalid Prompt Error - Compact
    if (status === 'failed' && error?.includes('Invalid prompt')) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
          className='p-3 mx-3 my-2'
        >
          <div className='p-4 rounded-xl bg-[#1A1A1A]'>
            <div className='flex items-start gap-3'>
              <div className='w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#D89C3A]'>
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
                <p className='text-xs text-[#737373] mt-0.5 truncate'>
                  {prompt}
                </p>
              </div>
            </div>
            <p className='text-sm text-[#A3A3A3] mt-3'>
              Your prompt does not seem to be valid. Please provide a prompt
              related to song creation, remixing, covers, or similar music
              tasks.
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
        </motion.div>
      );
    }

    // Server Busy Error - Compact
    if (status === 'failed' && error?.includes('Server busy')) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
          className='p-3 mx-3 my-2'
        >
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
        </motion.div>
      );
    }

    // Not Enough Credits Error - Compact
    if (status === 'failed' && error?.includes('Not enough credits')) {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
          className='p-3 mx-3 my-2'
        >
          <div className='p-3 rounded-lg bg-[#261A14] border border-[#3D2A1F] flex items-center justify-between'>
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
            <button
              onClick={() => {
                // TODO: Open credits/upgrade modal
              }}
              className='px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors'
            >
              Top Up
            </button>
          </div>
        </motion.div>
      );
    }

    // Generic Failed - Compact
    if (status === 'failed') {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
          className='p-3 mx-3 my-2'
        >
          <div className='p-3 rounded-lg bg-[#1A1414] border border-[#3D1F1F]'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-[#2A1A1A] flex items-center justify-center shrink-0'>
                <AlertTriangle className='w-5 h-5 text-[#EF4444]' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm text-[#EF4444] font-medium'>
                  Generation Failed
                </p>
                <p className='text-xs text-[#737373] truncate'>
                  {error || 'An error occurred'}
                </p>
              </div>
              <button
                onClick={() => retryGeneration(id)}
                className='px-3 py-1.5 text-xs text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
              >
                Retry
              </button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Generating/Pending - Compact
    if (status === 'generating' || status === 'pending') {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
          className='p-3 mx-1 my-2'
        >
          <div className='relative rounded-xl overflow-hidden'>
            {/* Progress fill background with gradient */}
            <div className='absolute inset-0 bg-[#141414]' />
            <motion.div
              className='absolute inset-0'
              style={{
                background:
                  'linear-gradient(90deg, #1a1a1a 0%, #1D2125 50%, #252a2e 100%)',
              }}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            <div className='relative flex items-center gap-3 p-3'>
              <GradientProgress
                progress={progress}
                size={44}
                imageUrl='/art.jpg'
              />
              <div className='flex-1 min-w-0'>
                {/* Title with shine effect */}
                <ShineText>{prompt}</ShineText>
                <p className='text-xs text-[#737373] mt-1'>
                  {generation.statusMessage ||
                    (status === 'generating'
                      ? 'Starting AI audio engine...'
                      : 'Waiting in queue...')}
                </p>
              </div>
              {variationNumber && (
                <span className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5'>
                  v{variationNumber}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    // Completed - Compact (same style as full)
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={{ backgroundColor: '#1D2125' }}
        transition={{
          backgroundColor: { duration: 0.7, ease: 'easeInOut' },
          delay: index * 0.05,
        }}
        onClick={handlePlay}
        className='group relative p-3 mx-1 rounded-xl cursor-pointer'
        onHoverStart={() => setIsHoveredCompact(true)}
        onHoverEnd={() => setIsHoveredCompact(false)}
      >
        <div className='flex items-center gap-3'>
          {/* Cover Image with Play Overlay */}
          <div className='relative shrink-0'>
            {isNew && <NewIndicator />}
            <div className='relative w-15 h-15 rounded-xl overflow-hidden'>
              <Image src='/art.jpg' alt={title} fill className='object-cover' />

              {/* Play/Pause Overlay */}
              <motion.div
                className='absolute inset-0 bg-black/60 flex items-center justify-center'
                animate={{
                  opacity: isCurrentlyPlaying || isHoveredCompact ? 1 : 0,
                }}
                transition={{
                  opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                }}
                style={{
                  pointerEvents:
                    isCurrentlyPlaying || isHoveredCompact ? 'auto' : 'none',
                }}
              >
                {isCurrentlyPlaying ? (
                  <Pause className='w-6 h-6 text-white' />
                ) : (
                  <Play className='w-6 h-6 text-white ml-0.5' />
                )}
              </motion.div>

              {/* Playing indicator */}
              {isCurrentlyPlaying && (
                <div className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5'>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className='w-0.5 h-2 bg-white rounded-full'
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            {title}
            <p className='text-xs text-[#737373] truncate mt-0.5'>{prompt}</p>
          </div>

          {/* Thumbs Up/Down Buttons */}
          <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(id);
              }}
              whileTap={{ scale: 0.75 }}
              className='p-1.5 rounded-lg transition-colors hover:bg-[#262626]'
            >
              <motion.div
                animate={
                  isLiked
                    ? {
                        scale: [1, 1.4, 1],
                        rotate: [0, -15, 15, 0],
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ThumbsUp
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isLiked
                      ? 'text-white fill-white'
                      : 'text-[#525252] hover:text-white',
                  )}
                />
              </motion.div>
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleDislike(id);
              }}
              whileTap={{ scale: 0.75 }}
              className='p-1.5 rounded-lg transition-colors hover:bg-[#262626]'
            >
              <motion.div
                animate={
                  isDisliked
                    ? {
                        scale: [1, 1.4, 1],
                        rotate: [0, 15, -15, 0],
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ThumbsDown
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isDisliked
                      ? 'text-white fill-white'
                      : 'text-[#525252] hover:text-white',
                  )}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Version Badge */}
          <span className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            v{variationNumber}
          </span>

          {/* More Options */}
          <button
            onClick={(e) => e.stopPropagation()}
            className='p-1.5 rounded-lg text-[#525252] hover:text-white hover:bg-[#262626] transition-all opacity-0 group-hover:opacity-100'
          >
            <MoreHorizontal className='w-4 h-4' />
          </button>
        </div>
      </motion.div>
    );
  }

  // FULL VARIANT - for RecentGenerations (original code)
  // Different card styles based on status
  if (status === 'pending' || status === 'generating') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='relative p-4 rounded-xl overflow-hidden'
      >
        {/* Base background */}
        <div className='absolute inset-0 bg-[#141414] border border-[#262626] rounded-xl' />

        {/* Progress fill background with gradient */}
        <motion.div
          className='absolute inset-0 rounded-xl'
          style={{
            background:
              'linear-gradient(90deg, #1a1a1a 0%, #1D2125 40%, #252a2e 100%)',
          }}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className='relative flex items-center gap-4'>
          {/* Gradient Progress */}
          <GradientProgress
            progress={progress}
            size={64}
            imageUrl='/album-art.jpg'
          />

          {/* Content */}
          <div className='flex-1 min-w-0'>
            {/* Title (prompt) with shine effect */}
            <ShineText>
              {prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt}
            </ShineText>
            {/* Status message */}
            <div className='flex items-center gap-2 mt-2'>
              <Clock className='w-3 h-3 text-[#525252]' />
              <span className='text-xs text-[#737373]'>
                {generation.statusMessage ||
                  (status === 'pending'
                    ? 'Waiting in queue...'
                    : 'Starting AI audio engine...')}
              </span>
            </div>
          </div>

          {/* Version Badge */}
          {variationNumber && (
            <span className='text-xs text-[#525252] border border-[#333333] rounded px-2 py-1'>
              v{variationNumber}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Invalid Prompt Error - Full
  if (status === 'failed' && error?.includes('Invalid prompt')) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='p-4'
      >
        <div className='p-4 rounded-xl bg-[#1A1A1A]'>
          <div className='flex items-start gap-3'>
            <div className='w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#D89C3A]'>
              <Image
                src='/smiling-face-with-tear.png'
                alt='Smiling Face with Tear'
                width={38}
                height={38}
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
      </motion.div>
    );
  }

  // Server Busy Error - Full
  if (status === 'failed' && error?.includes('Server busy')) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='p-4'
      >
        <div className='p-4 rounded-xl bg-[#1A1A1A]'>
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
      </motion.div>
    );
  }

  // Not Enough Credits Error - Full
  if (status === 'failed' && error?.includes('Not enough credits')) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='p-4'
      >
        <div className='p-3 rounded-lg bg-[#261A14] border border-[#3D2A1F] flex items-center justify-between'>
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
          <button
            onClick={() => {
              // TODO: Open credits/upgrade modal
            }}
            className='px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors'
          >
            Top Up
          </button>
        </div>
      </motion.div>
    );
  }

  // Generic Failed - Full
  if (status === 'failed') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='p-4'
      >
        <div className='p-4 rounded-xl bg-[#1A1414] border border-[#3D1F1F]'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-xl bg-[#2A1A1A] flex items-center justify-center shrink-0'>
              <AlertTriangle className='w-6 h-6 text-[#EF4444]' />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-[#EF4444] font-medium'>
                Generation Failed
              </p>
              <p className='text-xs text-[#737373] truncate'>
                {error || 'An error occurred'}
              </p>
            </div>
            <button
              onClick={() => retryGeneration(id)}
              className='px-4 py-2 text-sm text-white border border-[#404040] rounded-lg hover:bg-[#262626] transition-colors'
            >
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Completed state - Full
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ backgroundColor: '#1D2125' }}
      transition={{
        backgroundColor: { duration: 0.7, ease: 'easeInOut' },
        y: { duration: 0.3 },
      }}
      onClick={handlePlay}
      className='group relative p-4 rounded-xl cursor-pointer'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className='flex items-center gap-4'>
        {/* Cover Image with Play Overlay */}
        <div className='relative shrink-0'>
          {isNew && <NewIndicator />}
          <div className='relative w-15 h-15 rounded-xl overflow-hidden'>
            <Image
              src='/album-art.jpg'
              alt={title}
              fill
              className='object-cover'
            />

            {/* Play/Pause Overlay */}
            <motion.div
              className='absolute inset-0 bg-black/60 flex items-center justify-center'
              animate={{ opacity: isCurrentlyPlaying || isHovered ? 1 : 0 }}
              transition={{
                opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
              }}
              style={{
                pointerEvents:
                  isCurrentlyPlaying || isHovered ? 'auto' : 'none',
              }}
            >
              {isCurrentlyPlaying ? (
                <Pause className='w-6 h-6 text-white' />
              ) : (
                <Play className='w-6 h-6 text-white ml-0.5' />
              )}
            </motion.div>

            {/* Playing indicator */}
            {isCurrentlyPlaying && (
              <div className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5'>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className='w-0.5 h-2 bg-white rounded-full'
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          {title}
          <p className='text-xs text-[#737373] truncate mt-1'>{prompt}</p>
        </div>

        {/* Thumbs Up/Down Buttons - Hidden on mobile */}
        <div className='hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(id);
            }}
            whileTap={{ scale: 0.75 }}
            className='p-2 rounded-lg transition-colors hover:bg-[#262626]'
          >
            <motion.div
              animate={
                isLiked
                  ? {
                      scale: [1, 1.4, 1],
                      rotate: [0, -15, 15, 0],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ThumbsUp
                className={cn(
                  'w-4 h-4 transition-colors',
                  isLiked
                    ? 'text-white fill-white'
                    : 'text-[#525252] hover:text-white',
                )}
              />
            </motion.div>
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              toggleDislike(id);
            }}
            whileTap={{ scale: 0.75 }}
            className='p-2 rounded-lg transition-colors hover:bg-[#262626]'
          >
            <motion.div
              animate={
                isDisliked
                  ? {
                      scale: [1, 1.4, 1],
                      rotate: [0, 15, -15, 0],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ThumbsDown
                className={cn(
                  'w-4 h-4 transition-colors',
                  isDisliked
                    ? 'text-white fill-white'
                    : 'text-[#525252] hover:text-white',
                )}
              />
            </motion.div>
          </motion.button>
        </div>
        {/* Version Badge - Hidden on mobile */}
        <div className='hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
              'bg-[#262626] hover:bg-[#333333] text-[#A3A3A3] hover:text-white',
            )}
          >
            v{variationNumber}
          </motion.div>
        </div>

        {/* More Options - Always visible on mobile */}
        <button
          onClick={(e) => e.stopPropagation()}
          className='p-2 rounded-lg text-[#525252] hover:text-white hover:bg-[#262626] transition-all md:opacity-0 md:group-hover:opacity-100'
        >
          <MoreHorizontal className='w-5 h-5' />
        </button>
      </div>
    </motion.div>
  );
}
