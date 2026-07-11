// Shared Framer Motion variants for consistent animation language site-wide.
// Easing: ease-out-expo — fast start, smooth settle. Feels premium, not bouncy.
export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

export const slideRight = {
  hidden: { opacity: 0, x: -24 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

export const lineReveal = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (delay = 0) => ({
    scaleX: 1,
    transition: { duration: 1.1, ease: EASE, delay },
  }),
};

export const VIEW_ONCE = { once: true, margin: "-80px 0px" } as const;
