'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  Check,
  Clock,
} from 'lucide-react';
import { useGenerationStore } from '@/store';
import { useSocket } from '@/hooks/useSocket';
import { cn, formatDuration } from '@/lib/utils';
import { CircularProgress } from '../ui/CircularProgress';
import type { Generation } from '@/types';

interface GenerationCardProps {
  generation: Generation;
  variant?: 'full' | 'compact';
}

export function GenerationCard({
  generation,
  variant = 'full',
}: GenerationCardProps) {
  const { id, title, prompt, status, progress, coverImage, versions, error } =
    generation;
  const playTrack = useGenerationStore((state) => state.playTrack);
  const currentlyPlayingId = useGenerationStore(
    (state) => state.currentlyPlayingId
  );
  const isPlaying = useGenerationStore((state) => state.isPlaying);
  const togglePlayPause = useGenerationStore((state) => state.togglePlayPause);
  const removeGeneration = useGenerationStore(
    (state) => state.removeGeneration
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
          {/* Circular Progress */}
          <CircularProgress progress={progress} size={56} strokeWidth={3} />

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <p className='text-sm text-white font-medium truncate'>{title}</p>
            <p className='text-xs text-[#737373] truncate mt-1'>{prompt}</p>
            <div className='flex items-center gap-2 mt-2'>
              <Clock className='w-3 h-3 text-[#525252]' />
              <span className='text-xs text-[#525252]'>
                {status === 'pending' ? 'Waiting in queue...' : 'Generating...'}
              </span>
            </div>
          </div>

          {/* Version badges if any */}
          {versions.length > 0 && (
            <div className='flex gap-1'>
              {versions.map((v) => (
                <span
                  key={v.id}
                  className='px-2 py-1 rounded bg-[#262626] text-xs text-[#737373]'
                >
                  v{v.version}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Progress bar at bottom */}
        <div className='absolute bottom-0 left-0 right-0 h-1 bg-[#262626]'>
          <motion.div
            className='h-full bg-gradient-to-r from-[#FF6B2C] to-[#FF2C9C]'
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
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
            <p className='text-sm text-[#EF4444] font-medium'>
              Generation Failed
            </p>
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ backgroundColor: 'rgba(26, 26, 26, 1)' }}
      onClick={handlePlay}
      className='group relative p-4 rounded-xl bg-[#141414] border border-[#262626] cursor-pointer transition-colors'
    >
      <div className='flex items-center gap-4'>
        {/* Cover Image with Play Overlay */}
        <div className='relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0'>
          <div
            className='w-full h-full'
            style={{
              background:
                coverImage ||
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
          {/* Play/Pause Overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity',
              isCurrentlyPlaying
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            )}
          >
            {isCurrentlyPlaying ? (
              <Pause className='w-6 h-6 text-white' />
            ) : (
              <Play className='w-6 h-6 text-white ml-0.5' />
            )}
          </div>

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
            <Check className='w-4 h-4 text-[#22C55E] flex-shrink-0' />
          </div>
          <p className='text-xs text-[#737373] truncate mt-1'>{prompt}</p>
        </div>

        {/* Version Buttons */}
        <div className='flex items-center gap-2'>
          {versions.map((version) => (
            <motion.button
              key={version.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                playTrack(id, version.id);
              }}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                'bg-[#262626] hover:bg-[#333333] text-[#A3A3A3] hover:text-white'
              )}
            >
              v{version.version}
            </motion.button>
          ))}
        </div>

        {/* More Options */}
        <button
          onClick={(e) => e.stopPropagation()}
          className='p-2 rounded-lg text-[#525252] hover:text-white hover:bg-[#262626] transition-all opacity-0 group-hover:opacity-100'
        >
          <MoreHorizontal className='w-5 h-5' />
        </button>
      </div>
    </motion.div>
  );
}
