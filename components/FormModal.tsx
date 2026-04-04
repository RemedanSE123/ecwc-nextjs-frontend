'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const FormModalHeaderActionsContext = createContext<((node: React.ReactNode) => void) | null>(null);

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);

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
    <FormModalHeaderActionsContext.Provider value={setHeaderActions}>
      {/* Backdrop — low transparency so background stays visible */}
      <div
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'form-modal-title' : undefined}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Floating panel — full height so form body can fill it */}
        <div className="min-h-full h-[100vh] w-full flex flex-col items-stretch p-0">
          <div className="relative w-full max-w-[77rem] h-full max-h-[100vh] min-h-0 flex flex-col bg-white rounded-none sm:rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden mx-auto">

            {/* Panel top bar — title, optional actions (e.g. Preview), close */}
            <div className="shrink-0 z-10 flex items-center justify-between h-11 px-5 border-b border-zinc-200 bg-white/95 backdrop-blur-sm gap-3">
              {title && (
                <span
                  id="form-modal-title"
                  className="text-sm font-medium text-zinc-700 truncate flex-1 min-w-0"
                >
                  {title}
                </span>
              )}
              {headerActions}
              <button
                onClick={onClose}
                className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form content — no padding/margin; form sits flush with body */}
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden p-0 m-0">
              {children}
            </div>

          </div>
        </div>
      </div>
    </FormModalHeaderActionsContext.Provider>
  );
}
