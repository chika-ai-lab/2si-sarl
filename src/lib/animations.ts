// Framer Motion animation variants and configurations
import { Variants } from "framer-motion";

// Helper to check if device is mobile
const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

// Helper to check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Fade up animation variant - optimized with higher initial opacity
export const fadeUpVariant: Variants = {
  hidden: {
    opacity: 0.8, // Start at 0.8 instead of 0 for better UX
    y: isMobile() ? 15 : 30, // Less movement on mobile
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile() ? 0.4 : 0.6, // Faster on mobile
      ease: "easeOut",
    },
  },
};

// Fade in with scale - optimized
export const fadeInScaleVariant: Variants = {
  hidden: {
    opacity: 0.8,
    scale: 0.98, // Subtle scale change
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: isMobile() ? 0.3 : 0.5,
      ease: [0.34, 1.56, 0.64, 1], // back.out easing
    },
  },
};

// Stagger container for grids - optimized
export const staggerContainerVariant: Variants = {
  hidden: { opacity: 0.9 }, // Higher initial opacity
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isMobile() ? 0.05 : 0.1, // Faster stagger on mobile
      delayChildren: isMobile() ? 0.05 : 0.1,
    },
  },
};

// Stagger item - fade up with scale - optimized
export const staggerItemVariant: Variants = {
  hidden: {
    opacity: 0.8,
    y: isMobile() ? 20 : 50, // Less movement on mobile
    scale: 0.98, // Subtle scale
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: isMobile() ? 0.4 : 0.6,
      ease: "easeOut",
    },
  },
};

// Slide in from left - optimized
export const slideInLeftVariant: Variants = {
  hidden: {
    opacity: 0.8,
    x: isMobile() ? -50 : -100, // Less movement on mobile
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: isMobile() ? 0.5 : 0.8,
      ease: "easeOut",
    },
  },
};

// Slide in from right - optimized
export const slideInRightVariant: Variants = {
  hidden: {
    opacity: 0.8,
    x: isMobile() ? 50 : 100, // Less movement on mobile
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: isMobile() ? 0.5 : 0.8,
      ease: "easeOut",
    },
  },
};

// Bounce badge animation - keep full fade for badges (they're small)
export const bounceBadgeVariant: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: isMobile() ? 250 : 200, // Snappier on mobile
      damping: isMobile() ? 15 : 10,
    },
  },
};

// Card hover scale
export const cardHoverVariant: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Button press animation
export const buttonPressVariant: Variants = {
  rest: { scale: 1 },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

// Viewport animation options (for scroll animations) - responsive
export const viewportOptions = {
  once: true, // Animate only once for better performance
  amount: isMobile() ? 0.15 : 0.3, // Lower threshold on mobile (15% vs 30%)
  margin: isMobile() ? "0px 0px -50px 0px" : "0px 0px -100px 0px", // Earlier trigger on mobile
};

// Viewport options for instant trigger - responsive
export const viewportOptionsInstant = {
  once: true, // Animate only once
  amount: isMobile() ? 0.05 : 0.1, // Very low threshold
  margin: isMobile() ? "0px 0px -20px 0px" : "0px 0px -50px 0px",
};

// Viewport options for non-critical elements (can be disabled on mobile)
export const viewportOptionsNonCritical = {
  once: true,
  amount: isMobile() ? 0 : 0.2, // Disable threshold on mobile
  margin: "0px",
};

export default {
  fadeUpVariant,
  fadeInScaleVariant,
  staggerContainerVariant,
  staggerItemVariant,
  slideInLeftVariant,
  slideInRightVariant,
  bounceBadgeVariant,
  cardHoverVariant,
  buttonPressVariant,
  viewportOptions,
  viewportOptionsInstant,
  viewportOptionsNonCritical,
};
