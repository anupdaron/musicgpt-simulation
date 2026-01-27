'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RadioStation {
  id: string;
  name: string;
  host: string;
  listeners: string;
  image: string;
  isLive: boolean;
}

interface GenreCard {
  id: string;
  name: string;
  likes: string;
  image: string;
  gradient?: string;
}

const radioStations: RadioStation[] = [
  {
    id: '1',
    name: 'Chill Lounge',
    host: '@mercury',
    listeners: '925 Listening',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    isLive: true,
  },
  {
    id: '2',
    name: 'Miami 1985',
    host: '@musicgpt',
    listeners: '487 Listening',
    image:
      'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=800&h=600&fit=crop',
    isLive: true,
  },
  {
    id: '3',
    name: 'Elegant Jazz',
    host: '@musicgpt',
    listeners: '106 Listening',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop',
    isLive: true,
  },
  {
    id: '4',
    name: 'Aura Phonk',
    host: '@yuni',
    listeners: '5.7K Listening',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    isLive: true,
  },
  {
    id: '5',
    name: 'Tokyo Lofi',
    host: '@yumi',
    listeners: '1.4K Listening',
    image:
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&h=600&fit=crop',
    isLive: true,
  },
  {
    id: '6',
    name: 'Heavenly Beats',
    host: '@mercury',
    listeners: '5.7K Listening',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
    isLive: true,
  },
];

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

const beatsGenres: GenreCard[] = [
  {
    id: '1',
    name: 'Type Beats',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop',
  },
  {
    id: '2',
    name: 'Heavenly Beats',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=800&h=800&fit=crop',
  },
  {
    id: '3',
    name: 'LoFi beats',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=800&fit=crop',
  },
  {
    id: '4',
    name: 'Phonk',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1571173069043-ce4f5cdb5b96?w=800&h=800&fit=crop',
  },
  {
    id: '5',
    name: 'Melodic House',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop',
  },
  {
    id: '6',
    name: 'Deep House',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&h=800&fit=crop',
  },
  {
    id: '7',
    name: 'Slap House Beats - Best...',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop',
  },
  {
    id: '8',
    name: 'Japanese Beats',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800&h=800&fit=crop',
  },
  {
    id: '9',
    name: 'Liquid Drum & Bass - ...',
    likes: '',
    image:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop',
  },
  {
    id: '10',
    name: 'Metal - Rock',
    likes: '',
    image: '',
    gradient: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)',
  },
];

function RadioCard({ station }: { station: RadioStation }) {
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
      <div className='relative w-96 h-56 rounded-2xl overflow-hidden'>
        {/* Background Image */}
        <div className='absolute inset-0'>
          <Image
            src={station.image}
            alt={station.name}
            fill
            className='object-cover'
            unoptimized
          />
        </div>

        {/* Overlay gradient for better visibility */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

        {/* Live Badge */}
        {station.isLive && (
          <div className='absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-md'>
            <div className='w-1.5 h-1.5 bg-white rounded-full animate-pulse' />
            <span className='text-xs font-semibold text-white'>LIVE</span>
          </div>
        )}

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
            <Play className='w-6 h-6 text-white ml-1' fill='white' />
          </motion.div>
        </motion.div>
      </div>

      {/* Station Info Below Image */}
      <div className='mt-3 flex items-start gap-3'>
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0'>
          <span className='text-white text-sm font-semibold'>
            {station.host.charAt(1).toUpperCase()}
          </span>
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-white font-semibold text-sm truncate'>
            {station.name}
          </h3>
          <p className='text-[#737373] text-xs truncate'>{station.host}</p>
          <p className='text-[#525252] text-xs mt-0.5'>{station.listeners}</p>
        </div>
      </div>
    </motion.div>
  );
}

function GenreCard({
  genre,
  size = 'md',
}: {
  genre: GenreCard;
  size?: 'sm' | 'md';
}) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSize = size === 'sm' ? 'w-44 h-44' : 'w-52 h-52';

  return (
    <motion.div
      className='flex-shrink-0 cursor-pointer group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Container */}
      <div className={cn('relative rounded-2xl overflow-hidden', imageSize)}>
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
        className={cn(
          'flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className='min-h-screen pb-32'>
      {/* Hero Section - Radio Stations */}
      <section className='mb-12'>
        <div className='flex items-center gap-2 mb-6'>
          <div className='w-2 h-2 bg-red-600 rounded-full animate-pulse' />
          <h1 className='text-2xl font-bold text-white'>
            Listen with MusicGPT Radio
          </h1>
        </div>

        <ScrollableSection>
          {radioStations.map((station) => (
            <RadioCard key={station.id} station={station} />
          ))}
        </ScrollableSection>
      </section>

      {/* Features Banner */}
      <section className='mb-12'>
        <div className='flex flex-wrap items-center justify-center gap-8 py-6 px-4 bg-[#1A1A1A]/50 rounded-2xl border border-[#262626]'>
          {[
            { icon: '✓', text: 'Unlimited Streaming' },
            { icon: '✓', text: 'Free Downloads' },
            { icon: '✓', text: 'No Copyright Issues' },
            { icon: '✓', text: 'Royalty Free' },
          ].map((feature, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div className='w-5 h-5 rounded-full bg-white flex items-center justify-center'>
                <span className='text-black text-xs font-bold'>
                  {feature.icon}
                </span>
              </div>
              <span className='text-white text-sm font-medium'>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className='mb-12'>
        <div className='flex items-center gap-2 mb-4'>
          <span className='text-2xl'>🚀</span>
          <h2 className='text-xl font-bold text-white'>Trending</h2>
        </div>
        <p className='text-sm text-[#737373] mb-6'>Updated today</p>

        <ScrollableSection>
          {trendingGenres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </ScrollableSection>
      </section>

      {/* Beats Section */}
      <section className='mb-12'>
        <div className='flex items-center gap-2 mb-4'>
          <h2 className='text-xl font-bold text-white'>Beats</h2>
        </div>
        <p className='text-sm text-[#737373] mb-6'>Updated today</p>

        <ScrollableSection>
          {beatsGenres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} size='sm' />
          ))}
        </ScrollableSection>
      </section>
    </div>
  );
}
