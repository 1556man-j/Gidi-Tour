import type { Action } from 'svelte/action';

export const reveal: Action<HTMLElement, void> = (node) => {
  // Respect reduced-motion: leave content visible, skip the reveal entirely.
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  node.style.opacity = '0';
  node.style.transform = 'translateY(12px)';
  node.style.transition = 'opacity 400ms ease, transform 400ms ease';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
          observer.unobserve(node);
        }
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};