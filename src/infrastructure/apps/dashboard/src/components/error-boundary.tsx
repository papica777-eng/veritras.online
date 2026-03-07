/**
 * @fileoverview Error Boundary Component
 * @description Graceful error handling with fallback UI
 */

'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  // Complexity: O(1)
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Log error to monitoring service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  // Complexity: O(1)
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-left text-xs bg-[#0a0a12] border border-red-500/20 rounded-lg p-4 mb-6 overflow-auto max-h-40 text-red-300">
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button
                onClick={this.handleReset}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper with useErrorBoundary hook pattern
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    // Complexity: O(1)
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    // Complexity: O(1)
    setError(error);
    console.error('Error caught:', error);
  }, []);

  return { error, handleError, resetError };
}
