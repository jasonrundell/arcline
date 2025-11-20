import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound Component (404 Page)
 *
 * Displays a 404 error page when a user navigates to a non-existent route.
 * Logs the attempted route path for debugging purposes and provides a
 * link to return to the home page.
 *
 * @component
 * @example
 * ```tsx
 * // Used as a catch-all route in React Router
 * <Route path="*" element={<NotFound />} />
 * ```
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
