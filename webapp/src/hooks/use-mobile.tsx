import * as React from "react";
import { BREAKPOINTS } from "@/constants";

/**
 * Custom hook to detect if the current viewport is mobile-sized.
 *
 * Uses a media query listener to track window width and determine if the
 * viewport is below the mobile breakpoint. Prevents memory leaks by tracking
 * component mount state.
 *
 * @returns {boolean} True if viewport width is below the mobile breakpoint (768px), false otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileLayout /> : <DesktopLayout />;
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`);
    let isMounted = true;

    const onChange = () => {
      if (isMounted) {
        setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE);
      }
    };

    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE);

    return () => {
      isMounted = false;
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
