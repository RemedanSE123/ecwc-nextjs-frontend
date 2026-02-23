'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  loading?: boolean;
  /** If true, show "—" option to clear selection */
  allowEmpty?: boolean;
  /** If true, input is required */
  required?: boolean;
}

export function SearchableCombobox({
  id,
  value,
  onChange,
  options,
  placeholder = 'Type to search',
  loading = false,
  allowEmpty = false,
  required = false,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? options.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200) });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={open ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setSearch(value);
          setOpen(true);
        }}
        placeholder={loading ? 'Loading…' : placeholder}
        className="pr-9"
        required={required}
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] overflow-y-auto rounded-md border border-[#16A34A]/30 bg-popover text-popover-foreground shadow-lg max-h-[220px] min-w-[200px]"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxWidth: 'min(90vw, 400px)',
          }}
        >
          <div className="p-1">
            {allowEmpty && (
              <div
                className={cn(
                  'cursor-pointer select-none rounded-sm py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
                  !value && 'bg-accent'
                )}
                onClick={() => {
                  onChange('');
                  setSearch('');
                  setOpen(false);
                }}
              >
                —
              </div>
            )}
            {filtered.map((opt) => (
              <div
                key={opt}
                className={cn(
                  'cursor-pointer select-none rounded-sm py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
                  value === opt && 'bg-accent'
                )}
                onClick={() => {
                  onChange(opt);
                  setSearch('');
                  setOpen(false);
                }}
              >
                {opt.length > 60 ? `${opt.slice(0, 60)}…` : opt}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
