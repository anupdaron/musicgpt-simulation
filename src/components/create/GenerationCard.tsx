'use client';

import React, { useState } from 'react';
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

interface GenerationCardProps {
  generation: Generation;
  variant?: 'full' | 'compact';
}

export function GenerationCard({
  generation,
  variant = 'full',
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
    isNew,
    variationNumber,
    groupId,
  } = generation;
  const playTrack = useGenerationStore((state) => state.playTrack);
  const toggleLike = useGenerationStore((state) => state.toggleLike);
  const currentlyPlayingId = useGenerationStore(
    (state) => state.currentlyPlayingId,
  );
  const isPlaying = useGenerationStore((state) => state.isPlaying);
  const togglePlayPause = useGenerationStore((state) => state.togglePlayPause);
  const removeGeneration = useGenerationStore(
    (state) => state.removeGeneration,
  );
  const { retryGeneration } = useSocket();

  const isCurrentlyPlaying = currentlyPlayingId === id && isPlaying;

  const handlePlay = () => {
    if (status !== 'completed') return;
    if (currentlyPlayingId === id) {
      togglePlayPause();
    } else {
      playTrack(id);
    }
  };

  // Different card styles based on status
  if (status === 'pending' || status === 'generating') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='relative p-4 rounded-xl bg-[#141414] border border-[#262626] overflow-hidden'
      >
        {/* Progress shimmer overlay */}
        <div
          className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent'
          style={{
            animation: 'shimmer 2s infinite',
            transform: `translateX(${progress - 100}%)`,
          }}
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
            <div className='flex items-center gap-2'>
              <p className='text-sm text-white font-medium truncate'>{title}</p>
            </div>
            <p className='text-xs text-[#737373] truncate mt-1'>{prompt}</p>
            <div className='flex items-center gap-2 mt-2'>
              <Clock className='w-3 h-3 text-[#525252]' />
              <span className='text-xs text-[#525252]'>
                {status === 'pending'
                  ? 'Waiting in queue...'
                  : `${progress}% - Generating...`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (status === 'failed') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='p-4 rounded-xl bg-[#1A1414] border border-[#3D1F1F]'
      >
        <div className='flex items-start gap-4'>
          {/* Error Icon */}
          <div className='w-14 h-14 rounded-xl bg-[#2A1A1A] flex items-center justify-center flex-shrink-0'>
            <AlertTriangle className='w-6 h-6 text-[#EF4444]' />
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-[#EF4444] font-medium'>
                Generation Failed
              </p>
            </div>
            <p className='text-xs text-[#A3A3A3] truncate mt-1'>{prompt}</p>
            <p className='text-xs text-[#737373] mt-2'>
              {error || 'An error occurred while generating your track.'}
            </p>
          </div>

          {/* Actions */}
          <div className='flex gap-2'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => retryGeneration(id)}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-sm text-white transition-colors'
            >
              <RefreshCw className='w-3.5 h-3.5' />
              Retry
            </motion.button>
            <button
              onClick={() => removeGeneration(id)}
              className='p-1.5 rounded-lg text-[#525252] hover:text-white hover:bg-[#262626] transition-colors'
            >
              <MoreHorizontal className='w-5 h-5' />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Completed state
  const [isHovered, setIsHovered] = useState(false);
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
        <div className='relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0'>
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
            transition={{ opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }}
            style={{
              pointerEvents: isCurrentlyPlaying || isHovered ? 'auto' : 'none',
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

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm text-white font-medium truncate'>{title}</h3>
          </div>
          <p className='text-xs text-[#737373] truncate mt-1'>{prompt}</p>
        </div>

        {/* Thumbs Up/Down Buttons - Hidden on mobile */}
        <div className='hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(id);
            }}
            className={cn(
              'p-2 rounded-lg transition-all hover:bg-[#262626]',
              isLiked ? 'text-[#22C55E]' : 'text-[#525252] hover:text-white',
            )}
          >
            <ThumbsUp className={cn('w-4 h-4', isLiked && 'fill-current')} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could add dislike functionality here
            }}
            className='p-2 rounded-lg text-[#525252] hover:text-white hover:bg-[#262626] transition-all'
          >
            <ThumbsDown className='w-4 h-4' />
          </button>
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
