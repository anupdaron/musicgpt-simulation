'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  ChevronRight,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import { useGenerationStore, useUser, useIsProfilePopupOpen } from '@/store';
import { cn } from '@/lib/utils';
import { CircularProgress } from '../ui/CircularProgress';
import { useSocket } from '@/hooks/useSocket';

export function ProfilePopup() {
  const user = useUser();
  const isOpen = useIsProfilePopupOpen();
  const togglePopup = useGenerationStore((state) => state.toggleProfilePopup);
  const setPopupOpen = useGenerationStore((state) => state.setProfilePopupOpen);
  const generations = useGenerationStore((state) => state.generations);
  const popupRef = useRef<HTMLDivElement>(null);

  // Get recent generations (most recent first, max 5)
  const recentGenerations = generations.slice(0, 5);

  // Count active generations
  const activeCount = generations.filter(
    (g) =>
      g.status === 'generating' ||
      g.status === 'pending' ||
      g.status === 'failed'
  ).length;

  // Check for insufficient credits
  const hasInsufficientCredits = user.credits === 0;

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
        className='relative w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-[#FF6B2C] transition-all focus-ring'
      >
        {/* Avatar with gradient border */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#FF6B2C] to-[#FF2C9C] rounded-full' />
        <div className='absolute inset-[2px] bg-[#1A1A1A] rounded-full flex items-center justify-center'>
          <span className='text-white font-semibold text-sm'>
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Notification Badge */}
        {activeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF6B2C] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0D0D0D]'
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
            className='absolute right-0 top-12 w-80 bg-[#1A1A1A] rounded-2xl border border-[#262626] shadow-2xl overflow-hidden z-50'
          >
            {/* Header */}
            <div className='p-4 flex items-center justify-between border-b border-[#262626]'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF2C9C] flex items-center justify-center'>
                  <span className='text-white font-semibold'>
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
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
            <div className='p-4 border-b border-[#262626]'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-white'>
                    {user.credits}/{user.maxCredits} credits
                  </span>
                  <button className='w-4 h-4 rounded-full bg-[#262626] flex items-center justify-center'>
                    <span className='text-[10px] text-[#737373]'>?</span>
                  </button>
                </div>
                <button className='flex items-center gap-1 text-sm text-[#A3A3A3] hover:text-white transition-colors'>
                  Top Up <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>

            {/* Generations List */}
            <div className='max-h-80 overflow-y-auto'>
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
  };
  index: number;
}

function GenerationItem({ generation, index }: GenerationItemProps) {
  const { status, progress, title, prompt, error, versions, coverImage, id } =
    generation;
  const { retryGeneration } = useSocket();
  const removeGeneration = useGenerationStore(
    (state) => state.removeGeneration
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className='p-3 mx-3 my-2'
    >
      {status === 'failed' ? (
        <div className='p-3 rounded-lg bg-[#1F1414] border border-[#3D1F1F]'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 rounded-lg bg-[#2A1A1A] flex items-center justify-center flex-shrink-0'>
              <span className='text-lg'>😢</span>
            </div>
            <div className='flex-1 min-w-0'>
              <div className='font-medium text-[#EF4444] text-sm'>
                Invalid Prompt
              </div>
              <p className='text-xs text-[#A3A3A3] mt-0.5 line-clamp-2'>
                {error ||
                  'Your prompt does not seem to be valid. Please provide a prompt related to song creation.'}
              </p>
            </div>
            <button
              onClick={() => removeGeneration(id)}
              className='text-[#737373] hover:text-white transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Server Busy Error */}
          {error?.includes('Server busy') && (
            <div className='mt-2 p-2 rounded-lg bg-[#261A14] border border-[#3D2A1F]'>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='w-4 h-4 text-[#F59E0B]' />
                <span className='text-xs text-[#F59E0B]'>
                  Oops! Server busy:
                </span>
              </div>
              <div className='flex items-center justify-between mt-1'>
                <span className='text-xs text-[#A3A3A3]'>
                  4.9K users in the queue.
                </span>
                <button
                  onClick={() => retryGeneration(id)}
                  className='text-xs text-white underline hover:no-underline flex items-center gap-1'
                >
                  <RefreshCw className='w-3 h-3' /> Retry
                </button>
              </div>
            </div>
          )}
        </div>
      ) : status === 'generating' || status === 'pending' ? (
        <div className='flex items-center gap-3'>
          <CircularProgress progress={progress} size={44} strokeWidth={3} />
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
      ) : status === 'completed' ? (
        <div className='flex items-center gap-3'>
          <div
            className='w-11 h-11 rounded-lg flex-shrink-0'
            style={{
              background:
                coverImage ||
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
          <div className='flex-1 min-w-0'>
            <p className='text-sm text-white font-medium truncate'>{title}</p>
            <p className='text-xs text-[#525252] mt-0.5'>Completed</p>
          </div>
          <div className='flex gap-1'>
            {versions.map((v, i) => (
              <span
                key={i}
                className='text-xs text-[#525252] border border-[#333333] rounded px-1.5 py-0.5'
              >
                v{v.version}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
