'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PanelLeft } from 'lucide-react';
import { useGenerationStore, useUser, useGenerations } from '@/store';

export function MobileHeader() {
  const user = useUser();
  const generations = useGenerations();
  const toggleSidebar = useGenerationStore((state) => state.toggleSidebar);
  const setMobileProfileOpen = useGenerationStore(
    (state) => state.setMobileProfileOpen
  );

  // Count active generations (in progress) + new completed generations
  const activeCount = generations.filter(
    (g) =>
      g.status === 'generating' ||
      g.status === 'pending' ||
      g.status === 'failed' ||
      g.isNew
  ).length;

  return (
    <header className='md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#1A1A1A]'>
      {/* Left: Menu Button + Logo */}
      <div className='flex items-center gap-3'>
        <button
          onClick={toggleSidebar}
          className='w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center hover:bg-[#262626] transition-colors'
        >
          <PanelLeft className='w-5 h-5 text-white' />
        </button>

        <div className='flex items-center gap-2'>
          <Image
            src='/logo.svg'
            alt='MusicGPT Logo'
            width={28}
            height={28}
            className='text-white'
          />
          <span className='font-medium text-white'>MusicGPT</span>
        </div>
      </div>

      {/* Right: Profile Avatar with notification badge */}
      <button
        onClick={() => setMobileProfileOpen(true)}
        className='relative w-10 h-10 rounded-full'
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
    </header>
  );
}
