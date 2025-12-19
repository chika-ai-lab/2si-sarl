import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "prefers-reduced-motion"
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Update on change
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}

/**
 * Combined hook for animation preferences
 * Returns object with animation settings based on device and user preferences
 */
export function useAnimationPreferences() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  return {
    shouldReduceMotion: prefersReducedMotion,
    isMobile,
    // Disable complex animations on mobile or when user prefers reduced motion
    shouldDisableComplexAnimations: prefersReducedMotion || isMobile,
    // Use simpler animations
    animationDuration: prefersReducedMotion ? 0 : isMobile ? 0.3 : 0.6,
  };
}
