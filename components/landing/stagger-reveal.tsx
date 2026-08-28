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

    let scope: Scope | undefined;
    try {
      scope = createScope({ root: rootRef }).add(() => {
        animate(Array.from(el.children), {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          delay: stagger(staggerDelay),
          ease: "outExpo",
          autoplay: onScroll({ target: el, enter: "bottom-=40 top", repeat: false }),
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
