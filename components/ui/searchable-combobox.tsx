'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchableComboboxOption = string | { value: string; label: string };

function normalizeOptions(options: SearchableComboboxOption[]): { value: string; label: string }[] {
  if (!options.length) return [];
  if (typeof options[0] === 'string') {
    return (options as string[]).map((o) => ({ value: o, label: o }));
  }
  return options as { value: string; label: string }[];
}

export interface SearchableComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableComboboxOption[];
  placeholder?: string;
  loading?: boolean;
  /** If true, show "—" option to clear selection */
  allowEmpty?: boolean;
  /** If true, input is required */
  required?: boolean;
  disabled?: boolean;
  /**
   * local: filter options by what you type (default).
   * none: options are already filtered (e.g. server-side); still type to trigger onQueryChange.
   */
  filterMode?: 'local' | 'none';
  /** Fires on every keystroke when the user edits the text (for debounced API search). */
  onQueryChange?: (query: string) => void;
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
  disabled = false,
  filterMode = 'local',
  onQueryChange,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);

  const rows = useMemo(() => normalizeOptions(options), [options]);

  const closedDisplay = useMemo(() => {
    const row = rows.find((r) => r.value === value);
    return row?.label ?? value;
  }, [rows, value]);

  const filtered = useMemo(() => {
    if (filterMode === 'none') return rows;
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.label.toLowerCase().includes(q) || r.value.toLowerCase().includes(q));
  }, [rows, search, filterMode]);

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 200) });
    }
  }, [open, rows.length, search, filtered.length]);

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
        type="text"
        name={`${id}-search`}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={open ? search : closedDisplay}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          setOpen(true);
          onQueryChange?.(v);
        }}
        onFocus={() => {
          setSearch(closedDisplay);
          setOpen(true);
          onQueryChange?.(closedDisplay);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={loading ? 'Loading…' : placeholder}
        className="pr-9"
        required={required}
        disabled={
          disabled ||
          (Boolean(loading) && !onQueryChange)
        }
      />
      <button
        ref={chevronRef}
        type="button"
        tabIndex={-1}
        aria-label="Open list"
        className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60"
        onMouseDown={(e) => {
          e.preventDefault();
          inputRef.current?.focus({ preventScroll: true });
          setSearch(closedDisplay);
          setOpen(true);
          onQueryChange?.(closedDisplay);
        }}
      >
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>
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
            {filtered.length === 0 && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                {loading ? 'Loading…' : 'No matches'}
              </div>
            )}
            {filtered.map((opt, i) => (
              <div
                key={`${opt.value}-${i}`}
                className={cn(
                  'cursor-pointer select-none rounded-sm py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground whitespace-nowrap',
                  value === opt.value && 'bg-accent'
                )}
                onClick={() => {
                  onChange(opt.value);
                  setSearch('');
                  setOpen(false);
                }}
              >
                {opt.label.length > 80 ? `${opt.label.slice(0, 80)}…` : opt.label}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
