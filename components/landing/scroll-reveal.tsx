"use client";

import * as React from "react";
import { animate, createScope, onScroll, type Scope } from "animejs";

/**
 * Fades + slides children in via anime.js when scrolled into view. Falls
 * back to fully visible immediately under prefers-reduced-motion, or if
 * anime.js throws for any reason (so a JS/animation failure can never leave
 * a section permanently invisible).
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      return;
    }

    // onScroll's ScrollObserver only evaluates on a scroll/resize event, so
    // content already inside the viewport at mount (above the fold) never
    // gets triggered by it - waiting for a scroll that may never come. Play
    // immediately in that case instead of handing control to onScroll.
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;

    let scope: Scope | undefined;
    try {
      scope = createScope({ root: rootRef }).add(() => {
        animate(el, {
          opacity: [0, 1],
          translateY: [28, 0],
          duration: 800,
          delay,
          ease: "outExpo",
          autoplay: alreadyInView ? true : onScroll({ enter: "bottom-=40 top", repeat: false }),
        });
      });
    } catch {
      el.style.opacity = "1";
    }

    return () => scope?.revert();
  }, [delay]);

  return (
    <div ref={rootRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
