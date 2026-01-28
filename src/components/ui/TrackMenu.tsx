'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Plus,
  ListPlus,
  Copy,
  Paperclip,
  Lock,
  BadgeCheck,
  Flag,
  Trash2,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackMenuProps {
  onDelete?: () => void;
  onAddToPlaylist?: () => void;
  onAddToQueue?: () => void;
  onCopy?: () => void;
  onAttachToPrompt?: () => void;
  onMakePrivate?: () => void;
  onDownloadLicense?: () => void;
  onReport?: () => void;
  onDownload?: () => void;
  triggerClassName?: string;
  position?: 'top' | 'bottom';
  align?: 'left' | 'right';
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  hasSubmenu?: boolean;
  danger?: boolean;
}

export function TrackMenu({
  onDelete,
  onAddToPlaylist,
  onAddToQueue,
  onCopy,
  onAttachToPrompt,
  onMakePrivate,
  onDownloadLicense,
  onReport,
  onDownload,
  triggerClassName,
  position = 'bottom',
  align = 'right',
  onMenuOpen,
  onMenuClose,
}: TrackMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems: MenuItem[] = [
    {
      icon: Download,
      label: 'Download',
      hasSubmenu: true,
      onClick: onDownload,
    },
    {
      icon: Plus,
      label: 'Add to playlist',
      hasSubmenu: true,
      onClick: onAddToPlaylist,
    },
    { icon: ListPlus, label: 'Add to Queue', onClick: onAddToQueue },
    { icon: Copy, label: 'Copy', hasSubmenu: true, onClick: onCopy },
    { icon: Paperclip, label: 'Attach to prompt', onClick: onAttachToPrompt },
    { icon: Lock, label: 'Make Private', onClick: onMakePrivate },
    { icon: BadgeCheck, label: 'Download license', onClick: onDownloadLicense },
    { icon: Flag, label: 'Report', onClick: onReport },
    { icon: Trash2, label: 'Delete', danger: true, onClick: onDelete },
  ];

  const calculatePosition = () => {
    if (!triggerRef.current) return {};

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 400;

    let top: number;
    let left: number;

    // Horizontal position
    if (align === 'left') {
      left = rect.left;
    } else {
      left = rect.right - menuWidth;
    }

    // Vertical position
    if (position === 'top') {
      top = rect.top - menuHeight - 8;
      if (top < 8) top = rect.bottom + 8;
    } else {
      top = rect.bottom + 8;
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 8;
      }
    }

    // Bounds checking
    if (top < 8) top = 8;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    return {
      position: 'fixed' as const,
      top,
      left,
      zIndex: 99999,
    };
  };

  const openMenu = () => {
    const style = calculatePosition();
    setMenuStyle(style);
    setIsOpen(true);
    onMenuOpen?.();
  };

  const closeMenu = () => {
    setIsOpen(false);
    onMenuClose?.();
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: position === 'top' ? 10 : -10,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
          transition={{ duration: 0.15 }}
          style={menuStyle}
          className='w-56 py-2 bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl'
        >
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick?.();
                if (!item.hasSubmenu) {
                  closeMenu();
                }
              }}
              className={cn(
                'w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors',
                item.danger
                  ? 'text-[#EF4444] hover:bg-[#EF4444]/10'
                  : 'text-white hover:bg-[#262626]',
              )}
            >
              <div className='flex items-center gap-3'>
                <item.icon className='w-4 h-4' />
                <span>{item.label}</span>
              </div>
              {item.hasSubmenu && (
                <ChevronRight className='w-4 h-4 text-[#525252]' />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        ref={triggerRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleTriggerClick}
        className={cn(
          'p-2 rounded-full text-[#737373] hover:text-white hover:bg-[#333] transition-colors',
          triggerClassName,
          isOpen && 'text-white bg-[#333]',
        )}
        data-menu-open={isOpen}
      >
        <MoreHorizontal className='w-4 h-4' />
      </motion.button>
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}
