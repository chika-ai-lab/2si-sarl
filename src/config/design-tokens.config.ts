// Design Tokens Configuration
// Modern flat design system - NO gradients, NO shadows

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
  };
  semantic: {
    trust: {
      background: string;
      border: string;
      icon: string;
    };
    rating: {
      star: string;
      background: string;
    };
    badge: {
      new: string;
      sale: string;
      featured: string;
      outOfStock: string;
    };
  };
  backgrounds: {
    page: string;
    card: string;
    elevated: string;
    muted: string;
    accent: string;
  };
  shadows: {
    none: string;
    soft: string;
    medium: string;
    large: string;
    glow: string;
  };
  typography: {
    fontFamily: {
      display: string;
      body: string;
      mono: string;
    };
    fontSize: Record<string, [string, { lineHeight: string; letterSpacing?: string }]>;
    fontWeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  borders: {
    width: Record<string, string>;
    colors: Record<string, string>;
  };
  transitions: Record<string, string>;
  animations: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
}

export const designTokens: DesignTokens = {
  colors: {
    // Primary - Professional blue (trusted, modern)
    primary: {
      50: "215 50% 96%",
      100: "215 50% 90%",
      200: "215 50% 80%",
      300: "215 50% 65%",
      400: "215 50% 45%",
      500: "215 50% 23%",  // Base - Professional blue
      600: "215 55% 18%",
      700: "215 60% 14%",
      800: "215 65% 10%",
      900: "215 70% 7%",
      950: "215 75% 4%",
    },
    // Secondary - Warm beige/cream (background accent)
    secondary: {
      50: "35 40% 98%",
      100: "35 45% 95%",   // Light cream background
      200: "35 40% 90%",
      300: "35 35% 82%",
      400: "35 30% 70%",
      500: "35 25% 55%",
      600: "35 22% 42%",
      700: "35 20% 32%",
      800: "35 18% 22%",
      900: "35 15% 14%",
      950: "35 12% 8%",
    },
    // Accent - Vibrant orange (CTAs, highlights)
    accent: {
      50: "38 92% 95%",
      100: "38 92% 88%",
      200: "38 92% 78%",
      300: "38 92% 65%",
      400: "38 92% 55%",
      500: "38 92% 50%",   // Base - Vibrant orange
      600: "38 92% 45%",
      700: "38 92% 38%",
      800: "38 92% 30%",
      900: "38 92% 22%",
      950: "38 92% 15%",
    },
    // Neutral - Clean grays
    neutral: {
      50: "220 20% 98%",
      100: "220 15% 96%",
      200: "220 13% 91%",
      300: "220 12% 84%",
      400: "220 10% 65%",
      500: "220 8% 46%",
      600: "220 10% 38%",
      700: "220 12% 28%",
      800: "220 14% 18%",
      900: "220 16% 12%",
      950: "220 18% 6%",
    },
    success: {
      50: "145 80% 96%",
      100: "145 75% 90%",
      200: "145 70% 80%",
      300: "145 65% 65%",
      400: "145 60% 48%",
      500: "145 65% 36%",
      600: "145 70% 30%",
      700: "145 75% 24%",
      800: "145 80% 18%",
      900: "145 85% 12%",
      950: "145 90% 6%",
    },
    warning: {
      50: "45 100% 96%",
      100: "45 100% 90%",
      200: "45 100% 80%",
      300: "45 100% 68%",
      400: "45 95% 55%",
      500: "45 90% 48%",   // Golden yellow
      600: "40 85% 42%",
      700: "35 80% 35%",
      800: "30 75% 28%",
      900: "25 70% 20%",
      950: "20 65% 12%",
    },
    error: {
      50: "0 85% 97%",
      100: "0 80% 92%",
      200: "0 75% 84%",
      300: "0 70% 72%",
      400: "0 65% 58%",
      500: "0 72% 51%",
      600: "0 75% 44%",
      700: "0 78% 36%",
      800: "0 80% 28%",
      900: "0 82% 20%",
      950: "0 85% 12%",
    },
  },
  semantic: {
    trust: {
      background: "215 50% 96%",  // Very light blue
      border: "215 50% 80%",
      icon: "215 50% 23%",
    },
    rating: {
      star: "45 100% 51%",        // Gold
      background: "45 100% 96%",
    },
    badge: {
      new: "142 76% 36%",         // Success green
      sale: "0 84% 60%",          // Destructive red
      featured: "38 92% 50%",     // Accent orange
      outOfStock: "220 10% 46%",  // Neutral gray
    },
  },
  backgrounds: {
    page: "0 0% 100%",           // Pure white
    card: "0 0% 100%",           // White cards
    elevated: "35 45% 97%",      // Slight cream tint
    muted: "220 15% 96%",        // Light gray
    accent: "35 45% 95%",        // Cream accent
  },
  shadows: {
    none: "none",
    soft: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
    medium: "0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)",
    large: "0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)",
    glow: "0 0 20px rgba(38, 92%, 50%, 0.3)",
  },
  typography: {
    fontFamily: {
      display: "'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      "display-xl": ["3.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      "display-lg": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      "heading-xl": ["2.25rem", { lineHeight: "1.22", letterSpacing: "-0.01em" }],
      "heading-lg": ["1.875rem", { lineHeight: "1.27", letterSpacing: "-0.01em" }],
      "heading-md": ["1.5rem", { lineHeight: "1.33" }],
      "heading-sm": ["1.25rem", { lineHeight: "1.4" }],
      "body-lg": ["1.125rem", { lineHeight: "1.56" }],
      "body-base": ["1rem", { lineHeight: "1.5" }],
      "body-sm": ["0.875rem", { lineHeight: "1.43" }],
      "body-xs": ["0.75rem", { lineHeight: "1.33" }],
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },
  spacing: {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
  },
  borderRadius: {
    none: "0",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
    "3xl": "24px",
    full: "9999px",
  },
  borders: {
    width: {
      thin: "1px",
      base: "2px",
      thick: "3px",
      accent: "4px",
    },
    colors: {
      default: "220 13% 91%",
      hover: "220 10% 65%",
      focus: "145 45% 28%",
      accent: "25 95% 53%",
    },
  },
  transitions: {
    fast: "150ms ease-out",
    base: "200ms ease-out",
    smooth: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  animations: {
    duration: {
      fast: "150ms",
      base: "250ms",
      slow: "400ms",
      slower: "600ms",
    },
    easing: {
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
};
