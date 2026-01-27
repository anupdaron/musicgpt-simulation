'use client';

import { motion } from 'framer-motion';
import { PromptBox, RecentGenerations } from '@/components/create';

export default function CreatePage() {
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

      {/* Recent Generations */}
      <RecentGenerations />
    </div>
  );
}
