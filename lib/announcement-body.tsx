'use client';

import React from 'react';

/** Status words and their Tailwind color classes (text + bg for badges) */
const STATUS_STYLES: Record<string, string> = {
  op: 'text-emerald-700 dark:text-emerald-300 font-semibold',
  idle: 'text-amber-600 dark:text-amber-400 font-semibold',
  ur: 'text-orange-600 dark:text-orange-400 font-semibold',
  down: 'text-red-600 dark:text-red-400 font-semibold',
  hr: 'text-rose-600 dark:text-rose-400 font-semibold',
  ui: 'text-amber-500 dark:text-amber-400 font-medium',
  wi: 'text-amber-500 dark:text-amber-400 font-medium',
  uc: 'text-amber-500 dark:text-amber-400 font-medium',
  rfd: 'text-slate-600 dark:text-slate-400 font-medium',
  afd: 'text-slate-600 dark:text-slate-400 font-medium',
  accident: 'text-red-700 dark:text-red-400 font-semibold',
  other: 'text-slate-500 dark:text-slate-400 font-medium',
  '—': 'text-muted-foreground italic',
};

const STATUS_PATTERN = /\b(Op|Idle|UR|Down|HR|UI|WI|UC|RFD|AFD|Accident|Other|—)\b/gi;

function getStatusClass(word: string): string {
  const key = word.toLowerCase();
  return STATUS_STYLES[key] ?? STATUS_STYLES['—'] ?? '';
}

/**
 * Renders announcement body text with status words colored.
 * Splits by status pattern and wraps matches in spans.
 */
export function AnnouncementBodyWithStatus({ text, className = '' }: { text: string; className?: string }) {
  if (!text?.trim()) return null;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(STATUS_PATTERN.source, 'gi');
  re.lastIndex = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const word = match[0];
    const cls = getStatusClass(word);
    parts.push(
      <span key={`${match.index}-${word}`} className={cls}>
        {word}
      </span>
    );
    lastIndex = match.index + word.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <span className={className}>{parts.length > 0 ? parts : text}</span>;
}
