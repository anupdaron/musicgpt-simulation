'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Home,
  Sparkles,
  Compass,
  User,
  Heart,
  Plus,
  Music2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Sparkles, label: 'Create', href: '/create' },
  { icon: Compass, label: 'Explore', href: '/explore' },
];

const libraryItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Heart, label: 'Liked', href: '/liked' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
      className='fixed left-0 top-0 h-screen w-60 bg-[#0D0D0D] border-r border-[#1A1A1A] flex flex-col z-40'
    >
      {/* Logo */}
      <div className='p-6'>
        <Link href='/' className='flex items-center gap-2 group'>
          <div className='flex items-center justify-center'>
            <Image
              src='/logo.svg'
              alt='MusicGPT Logo'
              width={20}
              height={20}
              className='text-white'
            />
          </div>
          <span className='text-lg text-white group-hover:text-[#FF6B2C] transition-colors'>
            MusicGPT
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className='px-4 mb-10'>
        <button className='w-full flex items-center gap-3 px-3 py-2.5 rounded-4xl bg-[#1A1A1A] text-[#737373] hover:bg-[#262626] hover:text-[#A3A3A3] transition-all group'>
          <Search className='w-4 h-4' />
          <span className='text-sm'>Search</span>
          <span className='ml-auto text-xs text-[#525252] group-hover:text-[#737373]'>
            ⌘K
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className='px-2 flex-1'>
        <ul className='space-y-1'>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href === '/create' ? '/' : item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-4xl transition-all relative group',
                    isActive
                      ? 'text-white bg-[#1A1A1A]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414]'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 transition-colors')} />
                  <span className='text-sm font-medium'>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Library Section */}
        <div className='mt-8'>
          <h3 className='px-4 text-xs font-semibold text-[#525252] uppercase tracking-wider mb-2'>
            Library
          </h3>
          <ul className='space-y-1'>
            {libraryItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all',
                      isActive
                        ? 'text-white bg-[#1A1A1A]'
                        : 'text-[#A3A3A3] hover:text-white hover:bg-[#141414]'
                    )}
                  >
                    <item.icon className='w-5 h-5' />
                    <span className='text-sm font-medium'>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* New Playlist */}
            <li>
              <button className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#141414] transition-all'>
                <Plus className='w-5 h-5' />
                <span className='text-sm font-medium'>New playlist</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Model Version Banner */}
      <div className='p-4'>
        <div className='p-4 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#141414] border border-[#262626]'>
          <div className='text-xs font-semibold text-[#FF6B2C] mb-1'>
            Model v6 Pro is here!
          </div>
          <p className='text-xs text-[#737373] leading-relaxed'>
            Pushing boundaries to the world's best AI music model
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className='px-4 pb-4'>
        <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#525252]'>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Pricing
          </a>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Affiliate
          </a>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            API
          </a>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            About
          </a>
        </div>
        <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#525252] mt-1'>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Terms
          </a>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Privacy
          </a>
          <button className='hover:text-[#A3A3A3] transition-colors flex items-center gap-1'>
            🇺🇸 EN
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
