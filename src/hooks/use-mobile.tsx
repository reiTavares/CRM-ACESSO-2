import { useEffect, useState } from 'react';

interface UseMobileOptions {
  breakpoint?: number;
}

/**
 * Custom hook to detect if the viewport is mobile size
 */
export const useMobile = ({ breakpoint = 768 }: UseMobileOptions = {}) => {
  // For SSR, initialize as desktop to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value once mounted
    setIsMobile(window.innerWidth < breakpoint);

    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener('resize', handleResize);
    
    // Cleanup function to remove listener
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return { isMobile };
};
