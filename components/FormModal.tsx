'use client';

import { useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title?: string;
}

export default function FormModal({ isOpen, onClose, src, title }: FormModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'form-modal-title' : undefined}
    >
      <div className="absolute inset-0 flex flex-col bg-white dark:bg-zinc-900">

        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between h-12 px-5 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
            {title && (
              <span
                id="form-modal-title"
                className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
              >
                {title}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <iframe
            src={src}
            title={title || 'Form'}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
