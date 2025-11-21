import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Index = lazy(() => import("./pages/index"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * React Query client configuration.
 *
 * Configures caching, refetching, and retry behavior for all queries.
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - cacheTime: 10 minutes - Cached data is kept for 10 minutes after last use
 * - refetchOnWindowFocus: false - Prevents automatic refetching on window focus
 * - retry: 1 - Retry failed queries once before giving up
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * LoadingFallback Component
 *
 * Fallback UI displayed while lazy-loaded components are being loaded.
 * Shows a centered loading message with consistent styling.
 *
 * @component
 * @example
 * ```tsx
 * <Suspense fallback={<LoadingFallback />}>
 *   <LazyComponent />
 * </Suspense>
 * ```
 */
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="mb-4 text-muted-foreground">Loading...</div>
    </div>
  </div>
);

/**
 * App Component
 *
 * Root application component that sets up the application structure:
 * - Error Boundary for catching React errors
 * - React Query provider for data fetching
 * - React Router for navigation
 * - Code splitting with lazy loading and Suspense
 *
 * @component
 * @example
 * ```tsx
 * // Rendered in main.tsx
 * <App />
 * ```
 */
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
