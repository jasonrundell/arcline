import React from "react";
import { captureException } from "../lib/sentry";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree, logs those errors,
 * reports them to Sentry, and displays a fallback UI instead of crashing the entire application.
 *
 * This component implements React's error boundary pattern using componentDidCatch
 * and getDerivedStateFromError lifecycle methods. Errors are automatically reported
 * to Sentry for monitoring and debugging.
 *
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Report to Sentry with additional context
    captureException(error, {
      tags: {
        errorBoundary: "true",
        componentStack: errorInfo.componentStack ? "available" : "unavailable",
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorInfo,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
