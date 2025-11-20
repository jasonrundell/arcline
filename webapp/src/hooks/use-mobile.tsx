import * as React from "react";
import { BREAKPOINTS } from "@/constants";

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
