'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error);
  }, [error]);

  const errorMessage = error?.message || 'An unexpected error occurred.';
  const errorStack = error?.stack;

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-2">
          {errorMessage}
        </p>
        {process.env.NODE_ENV === 'development' && errorStack && (
          <pre className="text-left text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-32 mb-4 font-mono">
            {errorStack}
          </pre>
        )}
        <Button onClick={reset} className="bg-green-600 hover:bg-green-700">
          Try again
        </Button>
      </div>
    </div>
  );
}
