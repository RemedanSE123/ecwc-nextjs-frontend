'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const content = (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-start justify-center pt-2 sm:pt-3 pb-4 sm:pb-8 px-4 sm:px-8 bg-black/50 dark:bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[calc(100vh-2rem)] flex items-center justify-center bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-white/90 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-neutral-700 shadow-lg border border-gray-200/50 dark:border-neutral-600/50"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[calc(100vh-3rem)] w-auto h-auto object-contain p-3 sm:p-4"
        />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
