'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PromptBox } from '@/components/create';

interface GenreCard {
  id: string;
  name: string;
  likes: string;
  image: string;
}

const trendingGenres: GenreCard[] = [
  {
    id: '1',
    name: 'Top 100',
    likes: '97K Likes',
    image:
      'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=800&fit=crop',
  },
  {
    id: '2',
    name: 'Vocal Drum & Bass',
    likes: '48K Likes',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop',
  },
  {
    id: '3',
    name: 'Slap House Vocals',
    likes: '45K Likes',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=800&fit=crop',
  },
  {
    id: '4',
    name: 'Dark R&B',
    likes: '4.9K Likes',
    image:
      'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=800&h=800&fit=crop',
  },
  {
    id: '5',
    name: 'Dark Country',
    likes: '32K Likes',
    image:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=800&fit=crop',
  },
  {
    id: '6',
    name: 'Hip Hop',
    likes: '29K Likes',
    image:
      'https://images.unsplash.com/photo-1571609652410-c3f0d6f0ef9c?w=800&h=800&fit=crop',
  },
  {
    id: '7',
    name: 'Afrobeat',
    likes: '13K Likes',
    image:
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=800&fit=crop',
  },
  {
    id: '8',
    name: 'Eurovision Reimagined',
    likes: '22K Likes',
    image:
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=800&fit=crop',
  },
  {
    id: '9',
    name: 'Popular Remixes',
    likes: '57K Likes',
    image:
      'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=800&fit=crop',
  },
  {
    id: '10',
    name: 'House Essentials',
    likes: '48K Likes',
    image:
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&h=800&fit=crop',
  },
];

function GenreCard({ genre }: { genre: GenreCard }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className='flex-shrink-0 cursor-pointer group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <div className='relative w-52 h-52 rounded-2xl overflow-hidden'>
        {/* Background Image */}
        <div className='absolute inset-0'>
          <Image
            src={genre.image}
            alt={genre.name}
            fill
            className='object-cover'
            unoptimized
          />
        </div>

        {/* Overlay gradient for better text visibility on hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className='absolute inset-0 flex items-center justify-center bg-black/40'
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center'
          >
            <Play className='w-6 h-6 text-white ml-0.5' fill='white' />
          </motion.div>
        </motion.div>
      </div>

      {/* Genre Info Below Image */}
      <div className='mt-3'>
        <h3 className='text-white font-semibold text-sm mb-1 truncate'>
          {genre.name}
        </h3>
        {genre.likes && <p className='text-[#737373] text-xs'>{genre.likes}</p>}
      </div>
    </motion.div>
  );
}

function ScrollableSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
      const scrollAmount = 400;
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

  return (
    <div className='relative group'>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        >
          <ChevronLeft className='w-6 h-6 text-white' />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        >
          <ChevronRight className='w-6 h-6 text-white' />
        </button>
      )}

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn('flex gap-4 overflow-x-auto scroll-smooth', className)}
      >
        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className='min-h-[calc(100vh-80px)] flex flex-col items-center pt-8 md:pt-20'>
      {/* Hero Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1] }}
        className='text-xl md:text-[32px] font-semibold text-white text-center mb-6 md:mb-12'
      >
        What Song to Create?
      </motion.h1>

      {/* Prompt Box */}
      <PromptBox />

      {/* Trending Section */}
      <section className='w-full mt-32'>
        <ScrollableSection>
          {trendingGenres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </ScrollableSection>
      </section>
    </div>
  );
}
