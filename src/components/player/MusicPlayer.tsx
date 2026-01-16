'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  ListMusic,
  Maximize2,
  X,
} from 'lucide-react';
import { useGenerationStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';

export function MusicPlayer() {
  const isPlayerOpen = useGenerationStore((state) => state.isPlayerOpen);
  const setPlayerOpen = useGenerationStore((state) => state.setPlayerOpen);
  const currentlyPlayingId = useGenerationStore(
    (state) => state.currentlyPlayingId
  );
  const isPlaying = useGenerationStore((state) => state.isPlaying);
  const togglePlayPause = useGenerationStore((state) => state.togglePlayPause);
  const generations = useGenerationStore((state) => state.generations);

  const currentTrack = generations.find((g) => g.id === currentlyPlayingId);

  const [progress, setProgress] = React.useState(0);
  const [volume, setVolume] = React.useState(80);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  // Simulate playback progress
  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack) return null;

  const currentVersion = currentTrack.versions[0];
  const duration = currentVersion?.duration || 240;
  const currentTime = (progress / 100) * duration;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
          className='fixed bottom-0 left-0 md:left-60 right-0 h-20 md:h-24 bg-[#181818] border-t border-[#282828] z-50'
        >
          <div className='h-full px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4'>
            {/* Left - Track Info */}
            <div className='flex items-center gap-3 md:gap-4 min-w-0 flex-1 md:flex-none md:w-72'>
              <div
                className='w-12 h-12 md:w-14 md:h-14 rounded-lg flex-shrink-0'
                style={{
                  background: currentTrack.coverImage?.startsWith('linear')
                    ? currentTrack.coverImage
                    : `url(${currentTrack.coverImage}) center/cover`,
                }}
              />
              <div className='min-w-0 flex-1 md:flex-none'>
                <h4 className='text-sm font-medium text-white truncate'>
                  {currentTrack.title}
                </h4>
                <p className='text-xs text-[#A3A3A3] truncate'>AI Generated</p>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'flex-shrink-0 transition-colors hidden md:block',
                  isLiked ? 'text-[#FF6B2C]' : 'text-[#525252] hover:text-white'
                )}
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              </button>
            </div>

            {/* Center - Controls */}
            <div className='flex flex-col items-center gap-1 md:gap-2 flex-none md:flex-1 md:max-w-xl'>
              {/* Control Buttons */}
              <div className='flex items-center gap-3 md:gap-4'>
                <button className='text-[#A3A3A3] hover:text-white transition-colors hidden md:block'>
                  <Shuffle className='w-4 h-4' />
                </button>
                <button className='text-[#A3A3A3] hover:text-white transition-colors hidden md:block'>
                  <SkipBack className='w-5 h-5' />
                </button>
                <button
                  onClick={togglePlayPause}
                  className='w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform'
                >
                  {isPlaying ? (
                    <Pause className='w-5 h-5 text-black' />
                  ) : (
                    <Play className='w-5 h-5 text-black ml-0.5' />
                  )}
                </button>
                <button className='text-[#A3A3A3] hover:text-white transition-colors hidden md:block'>
                  <SkipForward className='w-5 h-5' />
                </button>
                <button className='text-[#A3A3A3] hover:text-white transition-colors hidden md:block'>
                  <Repeat className='w-4 h-4' />
                </button>
              </div>

              {/* Progress Bar - Hidden on mobile */}
              <div className='hidden md:flex w-full items-center gap-2'>
                <span className='text-xs text-[#A3A3A3] w-10 text-right'>
                  {formatDuration(currentTime)}
                </span>
                <div className='flex-1 h-1 bg-[#404040] rounded-full overflow-hidden group cursor-pointer'>
                  <motion.div
                    className='h-full bg-white group-hover:bg-[#FF6B2C] transition-colors'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className='text-xs text-[#A3A3A3] w-10'>
                  {formatDuration(duration)}
                </span>
              </div>
            </div>

            {/* Right - Volume & Actions - Hidden on mobile */}
            <div className='hidden md:flex items-center gap-4 w-72 justify-end'>
              <button className='text-[#A3A3A3] hover:text-white transition-colors'>
                <ListMusic className='w-5 h-5' />
              </button>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className='text-[#A3A3A3] hover:text-white transition-colors'
                >
                  {isMuted ? (
                    <VolumeX className='w-5 h-5' />
                  ) : (
                    <Volume2 className='w-5 h-5' />
                  )}
                </button>
                <div className='w-24 h-1 bg-[#404040] rounded-full overflow-hidden cursor-pointer'>
                  <div
                    className='h-full bg-white'
                    style={{ width: isMuted ? '0%' : `${volume}%` }}
                  />
                </div>
              </div>

              <button className='text-[#A3A3A3] hover:text-white transition-colors'>
                <Maximize2 className='w-4 h-4' />
              </button>

              <button
                onClick={() => setPlayerOpen(false)}
                className='text-[#525252] hover:text-white transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setPlayerOpen(false)}
              className='md:hidden text-[#525252] hover:text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
