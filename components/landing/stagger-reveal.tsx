"use client";

import * as React from "react";
import { animate, createScope, onScroll, stagger, type Scope } from "animejs";

/**
 * Fades + slides each direct child in, staggered, when the container
 * scrolls into view. Children are pre-hidden via the [data-stagger-reveal]
 * CSS rule in globals.css so there's no flash before JS attaches; anime.js
 * sets inline opacity per child, which wins over that class rule.
 */
export function StaggerReveal({
  children,
  className,
  staggerDelay = 90,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Array.from(el.children).forEach((child) => {
        (child as HTMLElement).style.opacity = "1";
      });
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
        animate(Array.from(el.children), {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          delay: stagger(staggerDelay),
          ease: "outExpo",
          autoplay: alreadyInView
            ? true
            : onScroll({ target: el, enter: "bottom-=40 top", repeat: false }),
        });
      });
    } catch {
      Array.from(el.children).forEach((child) => {
        (child as HTMLElement).style.opacity = "1";
      });
    }

    return () => scope?.revert();
  }, [staggerDelay]);

  return (
    <div ref={rootRef} data-stagger-reveal className={className}>
      {children}
    </div>
  );
}
