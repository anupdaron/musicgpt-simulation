'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  progress,
  size = 44,
  strokeWidth = 3,
  className = '',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className='circular-progress' width={size} height={size}>
        {/* Background track */}
        <circle
          className='circular-progress-track'
          strokeWidth={strokeWidth}
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress bar */}
        <motion.circle
          className='circular-progress-bar'
          strokeWidth={strokeWidth}
          fill='transparent'
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Percentage text */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-xs font-medium text-white'>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
