'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Settings2,
  AudioWaveform,
  Music,
  ChevronDown,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { cn, PLACEHOLDER_PROMPTS, EASING, DURATION } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { useGenerationStore } from '@/store';

export function PromptBox() {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { submitPrompt } = useSocket();

  const user = useGenerationStore((state) => state.user);
  const hasCredits = user.credits > 0;

  // Cycling placeholder animation
  useEffect(() => {
    if (isFocused || prompt.length > 0) return;

    const currentPlaceholder = PLACEHOLDER_PROMPTS[placeholderIndex];
    let charIndex = 0;
    let isDeleting = false;

    const typeInterval = setInterval(
      () => {
        if (!isDeleting) {
          // Typing
          if (charIndex <= currentPlaceholder.length) {
            setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex));
            charIndex++;
            setIsTyping(true);
          } else {
            // Pause before deleting
            setTimeout(() => {
              isDeleting = true;
            }, 2000);
          }
        } else {
          // Deleting
          if (charIndex > 0) {
            charIndex--;
            setDisplayedPlaceholder(currentPlaceholder.slice(0, charIndex));
            setIsTyping(true);
          } else {
            // Move to next placeholder
            setPlaceholderIndex(
              (prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length
            );
            isDeleting = false;
            setIsTyping(false);
          }
        }
      },
      isDeleting ? 30 : 50
    );

    return () => clearInterval(typeInterval);
  }, [placeholderIndex, isFocused, prompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isSubmitting || !hasCredits) return;

    setIsSubmitting(true);
    try {
      await submitPrompt(prompt.trim());
      setPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to submit prompt:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, isSubmitting, hasCredits, submitPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='w-full max-w-3xl mx-auto'>
      {/* Main Container with Animated Border */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASING.decelerate }}
        className='relative'
      >
        {/* Image-based glow animation frames */}
        <div className='glow-image-container'>
          <div className='glow-image-frame glow-frame-1' />
          <div className='glow-image-frame glow-frame-2' />
          <div className='glow-image-frame glow-frame-3' />
          <div className='glow-image-frame glow-frame-4' />
        </div>

        {/* Inner Container */}
        <div className='relative bg-[#1D2125] rounded-4xl overflow-hidden border border-[#262626]'>
          {/* Textarea */}
          <div className='p-4 pb-2'>
            <div className='relative'>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder=''
                className='w-full bg-transparent text-white text-md placeholder:text-[#525252] resize-none outline-none min-h-7 max-h-32.5'
                rows={1}
                disabled={isSubmitting}
              />

              {/* Custom Animated Placeholder */}
              <AnimatePresence>
                {!prompt && !isFocused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='absolute top-0 left-0 pointer-events-none'
                  >
                    <span className='text-lg text-[#525252]'>
                      {displayedPlaceholder}
                      {isTyping && (
                        <span className='inline-block w-0.5 h-5 bg-[#FF6B2C] ml-0.5 animate-pulse' />
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Static placeholder when focused but empty */}
              {!prompt && isFocused && (
                <div className='absolute top-0 left-0 pointer-events-none'>
                  <span className='text-lg text-[#525252]'>
                    Describe your song
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className='px-4 pb-4 flex items-center justify-between'>
            <div className='flex items-center gap-1'>
              {/* Attachment Button */}
              <ToolbarButton icon={Paperclip} tooltip='Attach reference' />

              {/* Settings Button */}
              <ToolbarButton icon={Settings2} tooltip='Advanced settings' />

              {/* Audio Reference Button */}
              <ToolbarButton icon={AudioWaveform} tooltip='Audio reference' />

              {/* Lyrics Button */}
              <button className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-all'>
                <Music className='w-4 h-4' />
                <span className='text-sm'>+ Lyrics</span>
              </button>
            </div>

            <div className='flex items-center gap-2'>
              {/* Tools Dropdown */}
              <button className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-all'>
                <span className='text-sm'>Tools</span>
                <ChevronDown className='w-4 h-4' />
              </button>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isSubmitting || !hasCredits}
                whileHover={{
                  scale:
                    prompt.trim() && !isSubmitting && hasCredits ? 1.05 : 1,
                }}
                whileTap={{
                  scale:
                    prompt.trim() && !isSubmitting && hasCredits ? 0.95 : 1,
                }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  prompt.trim() && !isSubmitting && hasCredits
                    ? 'bg-gradient-to-r from-[#FF6B2C] to-[#FF2C9C] text-white shadow-lg shadow-[#FF6B2C]/30'
                    : 'bg-[#262626] text-[#525252] cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <ArrowRight className='w-5 h-5' />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Model Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mt-4 text-center'
      >
        <span className='text-sm text-[#525252]'>
          MusicGPT v6 Pro - Our latest AI audio model!{' '}
          <button className='text-[#737373] hover:text-[#A3A3A3] underline transition-colors'>
            Example prompts
          </button>
        </span>
      </motion.div>
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick?: () => void;
}

function ToolbarButton({ icon: Icon, tooltip, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className='w-10 h-10 rounded-lg flex items-center justify-center text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-all'
    >
      <Icon className='w-5 h-5' />
    </button>
  );
}
