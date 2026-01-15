'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GradientProgressProps {
  progress: number;
  size?: number;
  imageUrl?: string;
  className?: string;
}

export function GradientProgress({
  progress,
  size = 56,
  imageUrl = '/album-art.jpg',
  className = '',
}: GradientProgressProps) {
  // Show image at 75% or above
  const showImage = progress >= 75;

  // Image opacity increases as progress goes up (0.4 at 75, 0.6 at 90, 0.8 at 100)
  const imageOpacity = showImage ? 0.4 + ((progress - 75) / 25) * 0.4 : 0;

  // Gradient opacity decreases after 75% (100% at 75, 75% at 90, 50% at 100)
  const gradientOpacity = showImage
    ? progress >= 100
      ? 0.5
      : progress >= 90
      ? 0.75
      : 1
    : 1;

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Static border container */}
      <div className='absolute inset-0 rounded-2xl p-[1px] overflow-hidden'>
        {/* Rotating gradient inside the border */}
        <motion.div
          className='absolute inset-[-50%] w-[200%] h-[200%]'
          style={{
            background: `conic-gradient(from 0deg, rgba(255, 98, 0, 1), rgba(170, 0, 255, 0.7), rgba(0, 0, 0, 0), rgba(170, 0, 255, 0.7), rgba(255, 98, 0, 1))`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner background to create border effect */}
        <div className='absolute inset-[1px] rounded-2xl bg-[#0d0d0d]' />
      </div>

      {/* Inner content container */}
      <div
        className='absolute inset-[1px] rounded-2xl overflow-hidden'
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d0d 100%)',
        }}
      >
        {/* Album art background (visible at 75%+) */}
        {showImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageOpacity }}
            className='absolute inset-0'
          >
            <Image
              src={imageUrl}
              alt='Album art'
              fill
              className='object-cover'
            />
          </motion.div>
        )}

        {/* Gradient overlay - linear gradient that shifts angle */}
        <motion.div
          className='absolute inset-0'
          style={{ opacity: gradientOpacity }}
          animate={{
            background: [
              'linear-gradient(135deg, rgba(170, 0, 255, 0.5) 0%, rgba(255, 98, 0, 0.3) 50%, rgba(0, 0, 0, 0.4) 100%)',
              'linear-gradient(180deg, rgba(255, 98, 0, 0.4) 0%, rgba(170, 0, 255, 0.4) 50%, rgba(0, 0, 0, 0.4) 100%)',
              'linear-gradient(225deg, rgba(170, 0, 255, 0.5) 0%, rgba(255, 98, 0, 0.3) 50%, rgba(0, 0, 0, 0.4) 100%)',
              'linear-gradient(270deg, rgba(255, 98, 0, 0.4) 0%, rgba(170, 0, 255, 0.4) 50%, rgba(0, 0, 0, 0.4) 100%)',
              'linear-gradient(135deg, rgba(170, 0, 255, 0.5) 0%, rgba(255, 98, 0, 0.3) 50%, rgba(0, 0, 0, 0.4) 100%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />

        {/* Percentage text */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-sm font-medium text-white/70'>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
