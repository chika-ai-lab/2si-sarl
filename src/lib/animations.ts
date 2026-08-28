// Framer Motion animation variants and configurations
import { Variants } from "framer-motion";

// Helper to check if device is mobile
const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

// Helper to check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Principes de réglage (révision : les apparitions semblaient désordonnées).
 *
 * - On part de `opacity: 0` : à 0.8 on apercevait l'élément avant qu'il ne
 *   saute en place, ce qui se lisait comme un bug d'affichage.
 * - Déplacements courts (8–14px) et durées brèves : un décalage de 50px sur
 *   600ms donne l'impression que la mise en page bouge toute seule.
 * - Décalage entre enfants très serré, et plafonné : au-delà de quelques
 *   éléments, une grille de 20 cartes mettait plusieurs secondes à se remplir.
 * - Déclenchement dès que l'élément effleure le viewport, pour que le contenu
 *   soit déjà stable quand l'utilisateur le regarde.
 */
const DUR = () => (isMobile() ? 0.3 : 0.35);
const EASE = [0.22, 1, 0.36, 1] as const; // easeOutQuint : démarre franc, finit doux

// Coupe toute animation si l'utilisateur a demandé à les réduire.
const still = { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0 } };

// Fade up : titres et blocs de section
export const fadeUpVariant: Variants = {
  hidden: prefersReducedMotion() ? still : { opacity: 0, y: 12 },
  visible: prefersReducedMotion()
    ? still
    : {
        opacity: 1,
        y: 0,
        transition: { duration: DUR(), ease: EASE },
      },
};

// Fade in with scale
export const fadeInScaleVariant: Variants = {
  hidden: prefersReducedMotion() ? still : { opacity: 0, scale: 0.99 },
  visible: prefersReducedMotion()
    ? still
    : {
        opacity: 1,
        scale: 1,
        transition: { duration: DUR(), ease: EASE },
      },
};

// Conteneur de grille : les enfants apparaissent dans l'ordre du DOM, vite.
// Décalage court (35ms) : sur une grille de 20 cartes la cascade complète tient
// en ~700ms, au lieu de plusieurs secondes qui donnaient l'impression d'un bug.
export const staggerContainerVariant: Variants = {
  hidden: { opacity: 1 }, // le conteneur ne clignote pas, seuls les enfants animent
  visible: {
    opacity: 1,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : {
          staggerChildren: 0.035,
          delayChildren: 0,
        },
  },
};

// Élément de grille
export const staggerItemVariant: Variants = {
  hidden: prefersReducedMotion() ? still : { opacity: 0, y: 8 },
  visible: prefersReducedMotion()
    ? still
    : {
        opacity: 1,
        y: 0,
        transition: { duration: DUR(), ease: EASE },
      },
};

// Slide in from left
export const slideInLeftVariant: Variants = {
  hidden: prefersReducedMotion() ? still : { opacity: 0, x: -14 },
  visible: prefersReducedMotion()
    ? still
    : {
        opacity: 1,
        x: 0,
        transition: { duration: DUR(), ease: EASE },
      },
};

// Slide in from right
export const slideInRightVariant: Variants = {
  hidden: prefersReducedMotion() ? still : { opacity: 0, x: 14 },
  visible: prefersReducedMotion()
    ? still
    : {
        opacity: 1,
        x: 0,
        transition: { duration: DUR(), ease: EASE },
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

/**
 * Seuils de déclenchement. La marge basse est POSITIVE : l'animation part quand
 * l'élément est encore 200px sous le pli, donc il est déjà en place quand il
 * entre réellement dans le champ. Les anciennes marges négatives obligeaient à
 * scroller *au-delà* de l'élément pour le voir apparaître, d'où l'effet
 * surprise. `amount: 0` déclenche dès le premier pixel visible.
 */
export const viewportOptions = {
  once: true,
  amount: 0,
  margin: "0px 0px 200px 0px",
};

// Déclenchement immédiat (éléments déjà proches du pli au chargement)
export const viewportOptionsInstant = {
  once: true,
  amount: 0,
  margin: "0px 0px 300px 0px",
};

// Éléments non critiques
export const viewportOptionsNonCritical = {
  once: true,
  amount: 0,
  margin: "0px 0px 300px 0px",
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
