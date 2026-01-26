'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0, 0.55, 0.45, 1] }}
      className='flex flex-col items-center justify-center py-20 text-center'
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='relative mb-6'
      >
        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-background-tertiary to-[#141414] flex items-center justify-center border border-[#262626]'>
          <Music className='w-10 h-10 text-[#525252]' />
        </div>
        {/* Floating sparkles */}
        <motion.div
          animate={{
            y: [-2, 2, -2],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute -top-2 -right-2'
        >
          <Sparkles className='w-6 h-6 text-[#FF6B2C]' />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className='text-xl font-semibold text-white mb-2'>
          Start Creating Music
        </h3>
        <p className='text-[#737373] max-w-md'>
          Describe the song you want to create and let our AI compose it for
          you. Your generated tracks will appear here.
        </p>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className='mt-8 flex gap-2'
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scaleY: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            className='w-1 h-8 rounded-full bg-gradient-to-t from-[#FF6B2C]/20 to-[#FF2C9C]/20'
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
