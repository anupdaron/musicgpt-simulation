'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
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
  X,
  ChevronUp,
  ChevronDown,
  Undo2,
  MessageCircle,
  ListMusic,
  User,
} from 'lucide-react';
import { useGenerationStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';
import { TrackMenu } from '@/components/ui/TrackMenu';

export function MusicPlayer() {
  const isPlayerOpen = useGenerationStore((state) => state.isPlayerOpen);
  const setPlayerOpen = useGenerationStore((state) => state.setPlayerOpen);
  const currentlyPlayingId = useGenerationStore(
    (state) => state.currentlyPlayingId,
  );
  const isPlaying = useGenerationStore((state) => state.isPlaying);
  const togglePlayPause = useGenerationStore((state) => state.togglePlayPause);
  const generations = useGenerationStore((state) => state.generations);
  const playTrack = useGenerationStore((state) => state.playTrack);

  const currentTrack = generations.find((g) => g.id === currentlyPlayingId);

  // Queue: completed generations
  const queue = generations.filter((g) => g.status === 'completed');

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSeekHovered, setIsSeekHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when mouse is over player, but allow internal scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Check if the target or any parent is a scrollable element
      let element: HTMLElement | null = target;
      while (element && element !== container) {
        const hasOverflow = element.scrollHeight > element.clientHeight;
        if (hasOverflow && element.classList.contains('overflow-y-auto')) {
          // Allow scrolling within scrollable areas
          const isAtTop = element.scrollTop === 0 && e.deltaY < 0;
          const isAtBottom =
            element.scrollTop + element.clientHeight >=
              element.scrollHeight - 1 && e.deltaY > 0;

          // Only prevent default if not at scroll boundaries (allow internal scroll)
          if (!isAtTop && !isAtBottom) {
            e.stopPropagation();
            return;
          }
        }
        element = element.parentElement;
      }

      // Prevent background scrolling for all other cases
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle seek on progress bar
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setProgress(percentage);
  }, []);

  // Play next track
  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((g) => g.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex].id);
  }, [currentTrack, queue, playTrack]);

  // Play previous track
  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((g) => g.id === currentTrack.id);
    const prevIndex =
      currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[prevIndex].id);
  }, [currentTrack, queue, playTrack]);

  if (!currentTrack) return null;

  const currentVersion = currentTrack.versions[0];
  const duration = currentVersion?.duration || 240;
  const currentTime = (progress / 100) * duration;

  // Sample lyrics for demo
  const sampleLyrics = `[Verse 1]
The clouds hang heavy over the cedar trees.
The first white flake falls upon the iron gate.
It makes no sound against the cold metal.
The world turns as quiet as a stone.

[Verse 2]
I wrap my shoulders in a heavy wool shawl.
The garden path is lost beneath the pale salt.
Each crystal settles like a forgotten word.
Covering the brown grass and the broken.

[Chorus]
Winter song, carry me home
Through the frost and the falling snow
Winter song, I'm not alone
In the silence, I hear you call`;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          ref={containerRef}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onWheel={(e) => e.stopPropagation()}
          className='fixed bottom-4 left-4 right-4 z-50 max-w-4xl mx-auto md:left-64 md:right-4 '
        >
          {/* Main Player Container */}
          <motion.div
            layout
            className='relative bg-white/10  backdrop-blur-xl rounded-2xl bg-primary-250 border border-white/10 overflow-visible'
          >
            {/* Top Progress Bar with Glow Effect */}
            <div className='absolute -top-1 left-4 right-60 h-2 z-20 overflow-visible'>
              {/* Background track */}
              <div className='absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.75 bg-[#333] rounded-full' />

              {/* Progress fill with gradient fade and glow that fades from seek */}
              <div
                className='absolute top-1/2 -translate-y-1/2 left-0 h-0.75 rounded-full overflow-visible'
                style={{
                  width: `${progress}%`,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.8) 90%, #fff 100%)',
                }}
              />

              {/* Glow trail behind seek - fades as it goes back */}
              <div
                className='absolute top-1/2 -translate-y-1/2 h-4 rounded-full pointer-events-none'
                style={{
                  left: `calc(${Math.max(0, progress - 70)}%)`,
                  width: `${Math.min(progress, 70)}%`,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 60%, rgba(255,255,255,0.5) 100%)',
                  filter: 'blur(14px)',
                }}
              />

              {/* Glow effect at seek position - extends outside */}
              <div
                className='absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full pointer-events-none'
                style={{
                  left: `calc(${progress}% - 12px)`,
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'blur(4px)',
                }}
              />

              {/* Seek dot - visible on hover */}
              <motion.div
                className='absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none'
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: isSeekHovered ? 1 : 0,
                  scale: isSeekHovered ? 1 : 0.5,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  left: `calc(${progress}% - 6px)`,
                  background: '#fff',
                  boxShadow:
                    '0 0 8px 2px rgba(255,255,255,0.8), 0 0 16px 4px rgba(255,255,255,0.4)',
                }}
              />

              {/* Time tooltip - floating above seek position on hover */}
              <AnimatePresence>
                {isSeekHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className='absolute -top-8 px-2 py-1 bg-[#262626] rounded text-xs text-white font-medium whitespace-nowrap pointer-events-none'
                    style={{
                      left: `${hoverPosition}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {formatDuration((hoverPosition / 100) * duration)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clickable Seek Area */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              onMouseEnter={() => setIsSeekHovered(true)}
              onMouseLeave={() => setIsSeekHovered(false)}
              onMouseMove={(e) => {
                if (!progressRef.current) return;
                const rect = progressRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = Math.max(
                  0,
                  Math.min(100, (x / rect.width) * 100),
                );
                setHoverPosition(percentage);
              }}
              className='absolute top-0 left-4 right-60 h-4 cursor-pointer z-30'
            >
              {/* Hover indicator line */}
              <motion.div
                className='absolute top-0 left-0 right-0 h-0.75 bg-white/20 rounded-full'
                initial={{ opacity: 0 }}
                animate={{ opacity: isSeekHovered ? 1 : 0 }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Compact Player Bar */}
            <div className='relative h-28 px-4 flex items-center gap-4'>
              {/* Album Art */}
              <motion.div
                layout
                className='relative w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer'
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src='/art.jpg'
                  alt={currentTrack.title}
                  fill
                  className='object-cover'
                />
              </motion.div>

              {/* Track Info */}
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-semibold text-white truncate'>
                  {currentTrack.title}
                </h4>
                <p className='text-xs text-[#737373] truncate'>
                  {currentTrack.prompt.slice(0, 30)}
                </p>
              </div>

              {/* Time Display */}
              <div className='hidden md:flex items-center gap-2 text-xs text-[#737373] min-w-20 justify-center'>
                <span>{formatDuration(currentTime)}</span>
                <span>/</span>
                <span>{formatDuration(duration)}</span>
              </div>

              {/* Center Controls */}
              <div className='flex items-center gap-2 md:gap-3'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={cn(
                    'p-2 rounded-full transition-colors hidden md:flex',
                    isShuffle
                      ? 'text-[#FF6B2C]'
                      : 'text-[#737373] hover:text-white',
                  )}
                >
                  <Shuffle className='w-4 h-4' />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={playPrev}
                  className='p-2 rounded-full text-[#737373] hover:text-white transition-colors hidden md:flex'
                >
                  <SkipBack className='w-5 h-5' />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayPause}
                  className='w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors'
                >
                  {isPlaying ? (
                    <Pause className='w-5 h-5 text-white' />
                  ) : (
                    <Play className='w-5 h-5 text-white ml-0.5' />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={playNext}
                  className='p-2 rounded-full text-[#737373] hover:text-white transition-colors hidden md:flex'
                >
                  <SkipForward className='w-5 h-5' />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={cn(
                    'p-2 rounded-full transition-colors hidden md:flex',
                    isRepeat
                      ? 'text-[#FF6B2C]'
                      : 'text-[#737373] hover:text-white',
                  )}
                >
                  <Repeat className='w-4 h-4' />
                </motion.button>
              </div>

              {/* Right Actions */}
              <div className='flex items-center gap-1'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    isLiked
                      ? 'text-[#FF6B2C]'
                      : 'text-[#737373] hover:text-white',
                  )}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='px-4 py-2 rounded-full bg-[#262626] text-white text-sm font-medium hover:bg-[#333] transition-colors hidden md:flex'
                >
                  Share
                </motion.button>
              </div>

              {/* Hover Actions (top-right) */}
              <AnimatePresence>
                {(isHovered || isTrackMenuOpen) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='absolute -top-6 right-2 flex items-center gap-1 rounded-full p-1 z-51'
                  >
                    <TrackMenu
                      position='top'
                      align='left'
                      triggerClassName='p-3 bg-primary-100 border-2 border-primary-400 rounded-full text-white'
                      onMenuOpen={() => setIsTrackMenuOpen(true)}
                      onMenuClose={() => setIsTrackMenuOpen(false)}
                    />

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsQueueOpen(!isQueueOpen)}
                      className='p-3 rounded-full transition-colors bg-primary-100 border-2 border-primary-400'
                    >
                      <ListMusic className='w-4 h-4' />
                    </motion.button>

                    {/* Volume Control */}
                    <motion.div
                      className='relative p-1 flex items-center bg-primary-100  rounded-full'
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      whileHover={{
                        backgroundColor: 'var(--primary-400)',
                      }}
                    >
                      <motion.button
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: 'var(--primary-400)',
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMuted(!isMuted)}
                        className='p-2 rounded-full transition-colors'
                      >
                        {isMuted ? (
                          <VolumeX className='w-5 h-5' />
                        ) : (
                          <Volume2 className='w-5 h-5' />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {showVolumeSlider && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 80 }}
                            exit={{ opacity: 0, width: 0 }}
                            className='relative h-1 bg-[#404040] rounded-full overflow-visible cursor-pointer mr-2'
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              setVolume(
                                Math.max(0, Math.min(100, (x / 80) * 100)),
                              );
                              setIsMuted(false);
                            }}
                          >
                            <div
                              className='absolute top-0 left-0 h-full bg-white rounded-full'
                              style={{ width: isMuted ? '0%' : `${volume}%` }}
                            />
                            <div
                              className='absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg'
                              style={{
                                left: `calc(${isMuted ? 0 : volume}% - 6px)`,
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsExpanded(!isExpanded)}
                      className='p-3 rounded-full bg-primary-100 border-2 border-primary-400 transition-colors'
                    >
                      {isExpanded ? (
                        <ChevronDown className='w-4 h-4' />
                      ) : (
                        <ChevronUp className='w-4 h-4' />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPlayerOpen(false)}
                      className='p-3 rounded-full bg-primary-100 border-2 border-primary-400 transition-colors'
                    >
                      <X className='w-4 h-4' />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expanded Content - Lyrics */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
                  className='overflow-hidden'
                >
                  <div className='p-4 pt-0 border-t border-[#333]'>
                    {/* Lyrics Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className='max-h-64 overflow-y-auto'
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className='flex gap-4 h-64'>
                        {/* Comment Input - Scrollable */}
                        <div
                          className='flex-1 overflow-y-auto border-r border-[#333] pr-4'
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <div className='flex gap-3 p-3 rounded-xl'>
                            <div className='w-8 h-8 rounded-full flex items-center justify-center shrink-0'>
                              <User className='w-4 h-4 text-[#737373]' />
                            </div>
                            <div className='flex-1'>
                              <textarea
                                placeholder='Add your comment...'
                                rows={4}
                                className='w-full bg-transparent text-sm text-white placeholder-[#525252] rounded-2xl outline-none border p-2 border-white/20 resize-none'
                              />
                            </div>
                          </div>
                        </div>

                        {/* Lyrics - Scrollable */}
                        <div
                          className='flex-1 overflow-y-auto'
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <div className='text-sm text-[#A3A3A3] whitespace-pre-line leading-relaxed'>
                            {sampleLyrics}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Queue Slide-out Panel */}
            <AnimatePresence>
              {isQueueOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
                  className='absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1A]/95 backdrop-blur-xl rounded-2xl border border-[#333]'
                >
                  <div className='p-4'>
                    {/* Queue Header */}
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium text-white'>
                        Queue ({queue.length})
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsQueueOpen(false)}
                        className='p-1.5 rounded-full text-[#737373] hover:text-white hover:bg-[#333] transition-colors'
                      >
                        <X className='w-4 h-4' />
                      </motion.button>
                    </div>

                    {/* Queue List */}
                    <div
                      className='max-h-64 overflow-y-auto overflow-x-visible space-y-1 pr-2'
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {queue.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            'group relative flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors',
                            track.id === currentlyPlayingId
                              ? 'bg-[#262626]'
                              : 'hover:bg-[#262626]',
                          )}
                        >
                          <div
                            className='flex items-center gap-3 flex-1 min-w-0'
                            onClick={() => playTrack(track.id)}
                          >
                            <div className='relative w-10 h-10 rounded-lg overflow-hidden shrink-0'>
                              <Image
                                src='/art.jpg'
                                alt={track.title}
                                fill
                                className='object-cover'
                              />
                              {track.id === currentlyPlayingId && isPlaying && (
                                <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                                  <div className='flex gap-0.5'>
                                    {[...Array(3)].map((_, i) => (
                                      <motion.div
                                        key={i}
                                        animate={{ scaleY: [0.3, 1, 0.3] }}
                                        transition={{
                                          duration: 0.5,
                                          repeat: Infinity,
                                          delay: i * 0.1,
                                        }}
                                        className='w-0.5 h-3 bg-white rounded-full'
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p
                                className={cn(
                                  'text-sm truncate',
                                  track.id === currentlyPlayingId
                                    ? 'text-[#FF6B2C] font-medium'
                                    : 'text-white',
                                )}
                              >
                                {track.title}
                              </p>
                              <p className='text-xs text-[#737373] truncate'>
                                {track.prompt.slice(0, 40)}
                              </p>
                            </div>
                            <span className='text-xs text-[#525252]'>
                              {formatDuration(track.versions[0]?.duration || 0)}
                            </span>
                          </div>

                          {/* Remove & Menu - visible on hover or when menu is open */}
                          <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 has-data-[menu-open=true]:opacity-100 transition-opacity relative'>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove from queue logic here
                              }}
                              className='p-1.5 rounded-full text-[#525252] hover:text-white hover:bg-[#333] transition-colors'
                            >
                              <X className='w-3.5 h-3.5' />
                            </motion.button>
                            <TrackMenu
                              position='top'
                              align='left'
                              triggerClassName='p-1.5'
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
