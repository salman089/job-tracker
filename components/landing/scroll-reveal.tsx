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

    let scope: Scope | undefined;
    try {
      scope = createScope({ root: rootRef }).add(() => {
        animate(el, {
          opacity: [0, 1],
          translateY: [28, 0],
          duration: 800,
          delay,
          ease: "outExpo",
          autoplay: onScroll({ enter: "bottom-=40 top", repeat: false }),
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
