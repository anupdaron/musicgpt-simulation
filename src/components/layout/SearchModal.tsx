'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'playlist' | 'artist';
  title: string;
  subtitle: string;
  image: string;
  gradient?: string;
}

const quickSearches = ['Rap', 'Lofi', 'Classical', 'EDM', 'Pop', 'Rock'];

const searchResults: SearchResult[] = [
  {
    id: '1',
    type: 'playlist',
    title: 'Top 50',
    subtitle: '@musicgpt • Playlist • 50K Likes',
    image:
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    type: 'playlist',
    title: 'LoFi beats',
    subtitle: '@musicgpt • Playlist • 38K Likes',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    type: 'playlist',
    title: 'Type Beats',
    subtitle: '@musicgpt • Playlist • 92K Likes',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    type: 'playlist',
    title: 'Angel Wings',
    subtitle: '@mercury • 53K Plays',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    gradient: 'linear-gradient(135deg, #00D9FF 0%, #A78BFA 100%)',
  },
  {
    id: '5',
    type: 'artist',
    title: 'Mercury',
    subtitle: '@mercury • 18K Followers',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Mobile only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className='md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
          />

          {/* Search Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0, 0.55, 0.45, 1] }}
            className='fixed left-2.5 top-1/2 -translate-y-1/2 md:translate-x-0 md:left-54 md:top-2 md:translate-y-0 w-[95vw] md:w-105 h-140 bg-primary-100 border-2 border-primary-250 rounded-2xl shadow-2xl overflow-hidden z-50'
          >
            {/* Search Input */}
            <div className='p-4 border-b border-[#262626]'>
              <div className='flex items-center gap-3 px-4 py-3 bg-[#0D0D0D] rounded-2xl'>
                <Search className='w-5 h-5 text-[#737373]' />
                <input
                  ref={inputRef}
                  type='text'
                  placeholder='Search'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='flex-1 bg-transparent text-white placeholder:text-[#525252] outline-none text-sm'
                />
              </div>
            </div>

            {/* Quick Searches */}
            <div className='p-4 border-b border-[#262626]'>
              <div className='relative group'>
                {/* Left Arrow */}
                {canScrollLeft && (
                  <button
                    onClick={() => scroll('left')}
                    className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                  >
                    <ChevronLeft className='w-4 h-4 text-white' />
                  </button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                  <button
                    onClick={() => scroll('right')}
                    className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                  >
                    <ChevronRight className='w-4 h-4 text-white' />
                  </button>
                )}

                {/* Scrollable Pills */}
                <div
                  ref={scrollRef}
                  onScroll={checkScroll}
                  className='flex gap-2 overflow-x-auto scroll-smooth'
                >
                  {quickSearches.map((term) => (
                    <button
                      key={term}
                      className='flex items-center gap-2 px-4 py-2 bg-[#262626] hover:bg-[#333333] rounded-full transition-colors flex-shrink-0'
                    >
                      <Search className='w-3 h-3 text-[#A3A3A3]' />
                      <span className='text-sm text-white'>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className='max-h-[400px] overflow-y-auto'>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  className='w-full flex items-center gap-3 p-4 hover:bg-[#262626] transition-colors group'
                >
                  {/* Image */}
                  <div className='relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0'>
                    {result.gradient ? (
                      <div
                        className='w-full h-full'
                        style={{ background: result.gradient }}
                      />
                    ) : (
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className='object-cover'
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1 text-left min-w-0'>
                    <h3 className='text-white font-semibold text-sm truncate'>
                      {result.title}
                    </h3>
                    <p className='text-[#737373] text-xs truncate'>
                      {result.subtitle}
                    </p>
                  </div>

                  {/* Trending Icon */}
                  <TrendingUp className='w-5 h-5 text-[#525252] group-hover:text-[#737373] transition-colors flex-shrink-0' />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
