import gsap from "gsap";

export const fadeUp = (
  target: Element | Element[] | string,
  opts?: { duration?: number; delay?: number; y?: number; opacity?: number }
) => {
  const { duration = 0.6, delay = 0, y = 12, opacity = 0 } = opts || {};
  gsap.fromTo(
    target,
    { y, opacity },
    { y: 0, opacity: 1, duration, delay, ease: "power2.out" }
  );
};

export const staggerFadeUp = (
  target: Element | Element[] | string,
  opts?: { duration?: number; stagger?: number; delay?: number; y?: number }
) => {
  const { duration = 0.6, stagger = 0.08, delay = 0, y = 12 } = opts || {};
  gsap.fromTo(
    target,
    { y, opacity: 0 },
    { y: 0, opacity: 1, duration, stagger, delay, ease: "power2.out" }
  );
};

export const animateHeaderCollapse = (
  topBar: HTMLElement | null,
  logo: HTMLElement | null,
  nav: HTMLElement | null,
  collapsed: boolean
) => {
  if (topBar) {
    gsap.to(topBar, {
      height: collapsed ? 0 : "auto",
      opacity: collapsed ? 0 : 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  if (logo) {
    gsap.to(logo, {
      scale: collapsed ? 0.9 : 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }

  if (nav) {
    gsap.to(nav, {
      height: collapsed ? 28 : "auto",
      opacity: collapsed ? 0.9 : 1,
      duration: 0.25,
      ease: "power2.out",
    });
  }
};

export default gsap;
