'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Failed to load details</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1 break-words">{this.state.error.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 dark:border-red-800/50"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
