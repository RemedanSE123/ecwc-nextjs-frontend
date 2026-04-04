'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';

/**
 * Route-level error UI — never show raw exception text to end users in production.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[App Error]', error);
    }
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md space-y-4">
        <div className="inline-flex p-4 rounded-full bg-muted border border-border mb-1">
          <ShieldOff className="w-10 h-10 text-[#70c82a]" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Sorry — we couldn&apos;t open this page
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You can&apos;t access this content right now. Please try again in a moment. If it keeps happening,
          contact your administrator.
        </p>
        {isDev && error?.message && (
          <p className="text-xs text-muted-foreground/80 font-mono break-all border border-dashed border-border rounded-lg p-2">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button type="button" onClick={reset} className="bg-[#70c82a] hover:bg-[#5fa822] text-black font-semibold">
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
