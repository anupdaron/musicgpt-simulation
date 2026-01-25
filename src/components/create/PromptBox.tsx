'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip,
  Settings2,
  Music,
  ChevronDown,
  ArrowRight,
  Loader2,
  Upload,
  Mic,
  Link2,
  AudioLines,
  Plus,
  Lock,
  Info,
  Sparkles,
  Pencil,
  X,
} from 'lucide-react';
import { cn, PLACEHOLDER_PROMPTS, EASING, DURATION } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { useGenerationStore } from '@/store';

export const glowGroups: string[][] = [
  // ORANGE → BLACK
  [
    'bg-linear-to-r from-[#FF7B16] to-black/55 mix-blend-screen opacity-55',
    'bg-linear-to-r from-[#FF7B16] to-black/55 blur-lg',
    'bg-linear-to-r from-[#FF7B16] to-black/55 mix-blend-screen opacity-55',
  ],

  // PURPLE (middle)
  [
    'bg-linear-to-r from-black/55 via-[#EA2EFF] to-black/55 opacity-55',
    'bg-linear-to-r from-black/55 via-[#EA2EFF] to-black/55',
    'bg-linear-to-r from-black/55 via-[#EA2EFF] to-black/55 blur-lg',
  ],

  // BLACK → ORANGE
  [
    'bg-linear-to-r from-black/55 to-[#FF7B16] mix-blend-screen opacity-55',
    'bg-linear-to-r from-black/55 to-[#FF7B16] mix-blend-screen opacity-55',
    'bg-linear-to-r from-black/55 to-[#FF7B16] blur-lg',
  ],
];

interface GlowGroupProps {
  layers: string[];
  delay: number;
}

export const GlowGroup: React.FC<GlowGroupProps> = ({ layers, delay }) => {
  return (
    <motion.div
      className='absolute inset-0 pointer-events-none'
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2.3,
        delay,
        ease: 'easeInOut',
        repeat: Infinity,
        times: [0, 0.25, 0.5, 1],
      }}
    >
      {layers.map((classes, i) => (
        <div
          key={i}
          className={`
            absolute -inset-1
            rounded-3xl md:rounded-[34px]
            h-[calc(100%+7px)]

            ${classes}
          `}
        />
      ))}
    </motion.div>
  );
};
export function PromptBox() {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [activeGroup, setActiveGroup] = useState(0);
  const [promptIntensity, setPromptIntensity] = useState(85);
  const [lyricsIntensity, setLyricsIntensity] = useState(85);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [showGenerateInput, setShowGenerateInput] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [showImproveInput, setShowImproveInput] = useState(false);
  const [improvePrompt, setImprovePrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lyricsRef = useRef<HTMLTextAreaElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const advancedMenuRef = useRef<HTMLDivElement>(null);
  const generateInputRef = useRef<HTMLDivElement>(null);
  const improveInputRef = useRef<HTMLDivElement>(null);
  const { submitPrompt } = useSocket();

  const user = useGenerationStore((state) => state.user);
  const hasCredits = user.credits > 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGroup((prev) => (prev + 1) % glowGroups.length);
    }, 2000); // change group every 2s

    return () => clearInterval(interval);
  }, []);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(e.target as Node)
      ) {
        setIsAttachMenuOpen(false);
      }
      if (
        advancedMenuRef.current &&
        !advancedMenuRef.current.contains(e.target as Node)
      ) {
        setIsAdvancedOpen(false);
      }
      if (
        generateInputRef.current &&
        !generateInputRef.current.contains(e.target as Node)
      ) {
        setShowGenerateInput(false);
      }
      if (
        improveInputRef.current &&
        !improveInputRef.current.contains(e.target as Node)
      ) {
        setShowImproveInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              (prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length,
            );
            isDeleting = false;
            setIsTyping(false);
          }
        }
      },
      isDeleting ? 30 : 50,
    );

    return () => clearInterval(typeInterval);
  }, [placeholderIndex, isFocused, prompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150,
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
    <div className='w-full max-w-4xl mx-auto px-2 md:px-0'>
      {/* Main Container with Animated Border */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASING.decelerate }}
        className='relative'
      >
        <GlowGroup layers={glowGroups[0]} delay={1} />
        <GlowGroup layers={glowGroups[1]} delay={1.5} />
        <GlowGroup layers={glowGroups[2]} delay={2} />
        {/* Inner Container */}
        <div className='relative bg-[#1D2125] rounded-3xl md:rounded-4xl border border-[#262626]'>
          {/* Prompt Textarea */}
          <div className='p-3 md:p-4 pb-2'>
            <div className='relative'>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder=''
                className='w-full bg-transparent text-white text-base md:text-md placeholder:text-[#525252] resize-none outline-none min-h-12 max-h-32.5'
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
                    <span className='text-base md:text-lg text-[#525252]'>
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
                  <span className='text-base md:text-lg text-[#525252]'>
                    Describe your song
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lyrics Section */}
          <AnimatePresence>
            {showLyrics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='overflow-hidden'
              >
                {/* Separator */}
                <div className='mx-4 border-t border-[#333]' />

                {/* Lyrics Input Area */}
                <div className='p-3 md:p-4 pt-3'>
                  <div className='relative'>
                    <textarea
                      ref={lyricsRef}
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder='Add your lyrics'
                      className='w-full bg-transparent text-white text-base placeholder:text-[#525252] resize-none outline-none min-h-8'
                      rows={1}
                    />

                    {/* Action Buttons - Right aligned */}
                    <div className='flex items-center gap-2 justify-end mt-2'>
                      {/* Improve Button - Show when lyrics has content */}
                      <AnimatePresence>
                        {lyrics.trim() && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className='relative'
                            ref={improveInputRef}
                          >
                            <button
                              onClick={() => {
                                setShowImproveInput(!showImproveInput);
                                setShowGenerateInput(false);
                              }}
                              className='flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-white text-sm transition-colors'
                            >
                              <Pencil className='w-4 h-4' />
                              <span>Improve</span>
                            </button>

                            {/* Improve Input Popup */}
                            <AnimatePresence>
                              {showImproveInput && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50'
                                >
                                  <div className='flex items-center gap-2 bg-[#1a1d20] rounded-full pl-4 pr-2 py-1.5 border border-white/20 shadow-xl'>
                                    <input
                                      type='text'
                                      value={improvePrompt}
                                      onChange={(e) =>
                                        setImprovePrompt(e.target.value)
                                      }
                                      placeholder='How do you want to improve?'
                                      className='flex-1 h-10 bg-transparent text-white text-sm outline-none placeholder:text-white/70'
                                      autoFocus
                                    />
                                    {improvePrompt.trim() && (
                                      <button className='w-7 h-7 rounded-full bg-white flex items-center justify-center text-black shrink-0'>
                                        <ArrowRight className='w-4 h-4' />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Generate Button */}
                      <div className='relative' ref={generateInputRef}>
                        <button
                          onClick={() => {
                            setShowGenerateInput(!showGenerateInput);
                            setShowImproveInput(false);
                          }}
                          className='flex items-center gap-2 px-4 py-2 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-white text-sm transition-colors'
                        >
                          <Sparkles className='w-4 h-4' />
                          <span>Generate</span>
                        </button>

                        {/* Generate Input Popup */}
                        <AnimatePresence>
                          {showGenerateInput && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className='absolute bottom-full right-0 mb-2 w-64 z-50'
                            >
                              <div className='flex items-center gap-2 bg-[#1a1d20] rounded-full pl-4 pr-2 py-1.5 border border-white/20 shadow-xl'>
                                <input
                                  type='text'
                                  value={generatePrompt}
                                  onChange={(e) =>
                                    setGeneratePrompt(e.target.value)
                                  }
                                  placeholder='Lyrics to be about what?'
                                  className='flex-1 h-10 bg-transparent text-white text-sm outline-none placeholder:text-white/70'
                                  autoFocus
                                />
                                {generatePrompt.trim() && (
                                  <button className='w-7 h-7 rounded-full bg-white flex items-center justify-center text-black shrink-0'>
                                    <ArrowRight className='w-4 h-4' />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Toolbar */}
          <div className='px-3 md:px-4 pb-3 md:pb-4 flex items-center justify-between gap-2'>
            <div className='flex items-center gap-0.5 md:gap-2'>
              {/* Attachment Button with Dropdown */}
              <div className='relative' ref={attachMenuRef}>
                <button
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center transition-all border border-white/30 rounded-full',
                    isAttachMenuOpen
                      ? 'text-white bg-[#1F1F1F]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F]',
                  )}
                >
                  <Paperclip className='w-5 h-5' />
                </button>

                <AnimatePresence>
                  {isAttachMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className='absolute top-full left-0 mt-2 w-44 bg-[#1D2125] rounded-xl border shadow-xl z-[100] border-white/10'
                    >
                      <div className='py-1'>
                        <button
                          onClick={() => setIsAttachMenuOpen(false)}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-[#E5E5E5] hover:bg-[#262626] transition-colors'
                        >
                          <Upload className='w-4 h-4 text-[#737373]' />
                          <span className='text-sm'>Upload file</span>
                        </button>
                        <button
                          onClick={() => setIsAttachMenuOpen(false)}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-[#E5E5E5] hover:bg-[#262626] transition-colors'
                        >
                          <Mic className='w-4 h-4 text-[#737373]' />
                          <span className='text-sm'>Record</span>
                        </button>
                        <button
                          onClick={() => setIsAttachMenuOpen(false)}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-[#E5E5E5] hover:bg-[#262626] transition-colors'
                        >
                          <Link2 className='w-4 h-4 text-[#737373]' />
                          <span className='text-sm'>Youtube link</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Settings Button with Dropdown */}
              <div className='relative' ref={advancedMenuRef}>
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center transition-all border border-white/30 rounded-full',
                    isAdvancedOpen
                      ? 'text-white bg-[#1F1F1F]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F]',
                  )}
                  title='Advanced settings'
                >
                  <Settings2 className='w-5 h-5' />
                </button>

                <AnimatePresence>
                  {isAdvancedOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className='absolute top-full left-0 mt-2 w-[440px] bg-[#1D2125] rounded-3xl border border-white/10 shadow-xl z-[100] p-4'
                    >
                      {/* Pro Banner */}
                      <div className='flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#FF6B2C]/20 to-[#FF2C9C]/20 border border-[#FF6B2C]/30 mb-4'>
                        <span className='text-sm text-[#FFB088]'>
                          Unlock customization with Pro
                        </span>
                        <Lock className='w-4 h-4 text-[#FFB088]' />
                      </div>

                      {/* Title Input */}
                      <div className='mb-6 flex items-center gap-3'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-sm text-white'>Title</span>
                          <Info className='w-3.5 h-3.5 text-[#525252]' />
                        </div>
                        <input
                          type='text'
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          placeholder='Enter song title (optional)'
                          className='w-full bg-transparent border-b border-[#333] text-white text-sm py-2 outline-none focus:border-[#525252] transition-colors placeholder:text-[#525252]'
                        />
                      </div>

                      {/* Prompt Intensity */}
                      <div className='mb-6 flex items-center gap-5'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-white'>
                            Prompt intensity
                          </span>
                          <Info className='w-3.5 h-3.5 text-[#525252]' />
                        </div>
                        <IntensitySlider
                          value={promptIntensity}
                          onChange={setPromptIntensity}
                        />
                      </div>

                      {/* Lyrics Intensity */}
                      <div className='flex items-center gap-5'>
                        <div className='flex items-center gap-2 mb-3'>
                          <span className='text-sm text-white'>
                            Lyrics intensity
                          </span>
                          <Info className='w-3.5 h-3.5 text-[#525252]' />
                        </div>
                        <IntensitySlider
                          value={lyricsIntensity}
                          onChange={setLyricsIntensity}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ToolbarButton
                icon={AudioLines}
                tooltip='Instrumental'
                active={isInstrumental}
                onClick={() => setIsInstrumental(!isInstrumental)}
              />
              <ToolbarButton
                icon={Plus}
                tooltip='Add Lyrics'
                text='Lyrics'
                className='rounded-3xl'
                active={showLyrics}
                onClick={() => {
                  setShowLyrics(!showLyrics);
                  if (!showLyrics) {
                    // Focus lyrics input when opening
                    setTimeout(() => lyricsRef.current?.focus(), 100);
                  }
                }}
              />
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              {/* Tools Dropdown - Hidden on mobile */}
              <button className='hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F] transition-all'>
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
                    : 'bg-[#262626] text-[#525252] cursor-not-allowed',
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

      {/* Model Info - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mt-4 text-center hidden md:block'
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
  text?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  text,
  className,
  active,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={cn(
        'h-10 border rounded-full flex items-center justify-center transition-all',
        text ? 'px-3 gap-1.5' : 'w-10',
        active
          ? 'border-white text-white bg-white/10'
          : 'border-white/30 text-[#A3A3A3] hover:text-white hover:bg-[#1F1F1F]',
        className,
      )}
    >
      <Icon className='w-5 h-5' />
      {text && <span className='text-sm'>{text}</span>}
    </button>
  );
}

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const steps = 8;
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onChange(Math.round(percentage));
  };

  return (
    <div className='flex items-center gap-5'>
      <div
        ref={sliderRef}
        onClick={handleClick}
        className='relative flex items-center gap-6 flex-1 cursor-pointer py-2'
      >
        {/* Static bars */}
        {Array.from({ length: steps }).map((_, i) => {
          const barPosition = (i / (steps - 1)) * 100;
          const isActive = value >= barPosition;
          // Calculate opacity: starts at 0.3 and goes to 1.0 as bars go higher
          const opacity = 0.1 + (i / (steps - 1)) * 0.7;

          return (
            <div
              key={i}
              className='h-4 w-0.5 rounded-sm transition-colors'
              style={{
                backgroundColor: isActive
                  ? `rgba(255, 255, 255, ${opacity})`
                  : '#333',
              }}
            />
          );
        })}

        {/* Sliding thumb */}
        <div
          className='absolute top-1/2 -translate-y-1/2 w-2 h-8 bg-[#B0B0B0] rounded-sm shadow-[0_0_8px_2px_rgba(255,255,255,0.3)] transition-all pointer-events-none'
          style={{ left: `calc(${value}% - 4px)` }}
        />
      </div>
      <div className='w-12 h-8 rounded-full border border-[#333] flex items-center justify-center'>
        <span className='text-xs text-[#525252]'>{value}</span>
      </div>
    </div>
  );
}
