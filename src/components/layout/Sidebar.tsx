'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Home,
  Sparkles,
  Compass,
  User,
  Heart,
  Plus,
  Music2,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useGenerationStore, useIsSidebarOpen } from '@/store';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Sparkles, label: 'Create', href: '/create' },
  { icon: Compass, label: 'Explore', href: '/explore' },
];

const libraryItems = [
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Heart, label: 'Liked', href: '/liked' },
];

const languages = [
  { code: 'EN', flag: '/flag-usa.svg', name: 'English' },
  { code: 'ES', flag: '/flag-spain.svg', name: 'Español' },
  { code: 'DE', flag: '/flag-germany.svg', name: 'Deutsch' },
  { code: 'KR', flag: '/flag-korea.svg', name: '한국어' },
];

function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1 hover:text-[#A3A3A3] transition-colors'
      >
        <Image
          src={selected.flag}
          alt={selected.name}
          width={14}
          height={10}
          className='rounded-sm'
        />
        <span>{selected.code}</span>
        <ChevronDown
          className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className='absolute bottom-full left-0 mb-2 w-52  border 0 shadow-xl z-100 border-white/10 overflow-hidden bg-neutral-900 rounded-2xl'
          >
            <div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelected(lang);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-4 text-xs transition-colors',
                    selected.code === lang.code
                      ? 'text-white bg-white/10'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                  )}
                >
                  <Image
                    src={lang.flag}
                    alt={lang.name}
                    width={16}
                    height={12}
                    className='rounded-sm'
                  />
                  <span>{lang.code}</span>
                  <span className='text-[#525252]'>-</span>
                  <span className='truncate'>{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useIsSidebarOpen();
  const setSidebarOpen = useGenerationStore((state) => state.setSidebarOpen);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setSidebarOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className='p-6 flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 group'>
          {/* Mobile back button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className='md:hidden w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center mr-2'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <div className='flex items-center justify-center'>
            <Image
              src='/logo.svg'
              alt='MusicGPT Logo'
              width={32}
              height={32}
              className='text-white'
            />
          </div>
          <span className='font-medium text-white transition-colors'>
            MusicGPT
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className='px-4 mb-10'>
        <button className='w-full flex items-center gap-3 px-3 py-2.5 rounded-4xl bg-transparent  hover:bg-[#262626] transition-all group border border-[#FFFFFF29]'>
          <Search className='w-4 h-4' />
          <span className='text-sm'>Search</span>
          <span className='ml-auto text-xs text-[#525252] group-hover:text-[#737373] hidden md:inline'>
            Ctrl+K
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
                    'inline-flex items-center gap-3 px-4 py-2.5 rounded-4xl transition-all relative group',
                    isActive
                      ? 'text-white bg-[#FFFFFF17]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#FFFFFF17]'
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
                <span className='text-sm font-medium'>New Playlist</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Model Version Banner - Hidden on mobile */}
      <div className='p-4 hidden md:block'>
        <div className='p-4 rounded-xl bg-[linear-gradient(210deg,rgba(48,7,255,0.29)_0%,rgba(209,40,150,0.27)_50%,rgba(255,86,35,0.25)_100%)] border border-[#ffffff10]'>
          <div className='text-xs font-semibold text-white mb-1'>
            Model v6 Pro is here!
          </div>
          <p className='text-xs font-light text-[#ffffffdc] leading-relaxed'>
            Pushing boundaries to the world's best AI music model
          </p>
        </div>
      </div>

      {/* Footer Links */}
      <div className='px-4 pb-4'>
        <div className='flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50'>
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
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50 mt-1'>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Terms
          </a>
          <a href='#' className='hover:text-[#A3A3A3] transition-colors'>
            Privacy
          </a>
          <LanguageDropdown />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -240, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0, 0.55, 0.45, 1] }}
        className='hidden md:flex fixed left-0 top-0 h-screen w-60 bg-[rgb(255_255_255_/_0.03)] border-r border-[#1A1A1A] flex-col z-40'
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className='md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
            />
            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='md:hidden fixed left-0 top-0 h-screen w-60 bg-[rgb(255_255_255_/_0.03)] border-r border-[#1A1A1A] flex flex-col z-50'
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
