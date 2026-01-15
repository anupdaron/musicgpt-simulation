'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerationStore } from '@/store';
import { GenerationCard } from './GenerationCard';
import { EmptyState } from './EmptyState';

export function RecentGenerations() {
  const generations = useGenerationStore((state) => state.generations);

  // Show empty state if no generations
  if (generations.length === 0) {
    return (
      <section className='w-full max-w-4xl mx-auto mt-16'>
        <EmptyState />
      </section>
    );
  }

  // Separate active (pending/generating) and completed/failed
  const activeGenerations = generations.filter(
    (g) => g.status === 'pending' || g.status === 'generating'
  );
  const completedGenerations = generations.filter(
    (g) => g.status === 'completed' || g.status === 'failed'
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className='w-full max-w-4xl mx-auto mt-16'
    >
      {/* Active Generations */}
      {activeGenerations.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B2C] opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-[#FF6B2C]'></span>
            </span>
            In Progress
          </h2>
          <div className='space-y-3'>
            <AnimatePresence mode='popLayout'>
              {activeGenerations.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed Generations */}
      {completedGenerations.length > 0 && (
        <div>
          <h2 className='text-lg font-semibold text-white mb-4'>
            Recent generations
          </h2>
          <div className='space-y-3'>
            <AnimatePresence mode='popLayout'>
              {completedGenerations.map((generation) => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.section>
  );
}
