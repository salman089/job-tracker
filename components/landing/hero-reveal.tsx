"use client";

import * as React from "react";
import { createTimeline, stagger, type Timeline } from "animejs";

/**
 * Sequences the hero's direct children in with an anime.js timeline
 * (headline, subtext, CTA) rather than the CSS animate-in utility classes
 * used elsewhere — this is the one entrance anime.js drives end to end.
 */
export function HeroReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const targets = Array.from(el.children) as HTMLElement[];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((t) => {
        t.style.opacity = "1";
      });
      return;
    }

    targets.forEach((t) => {
      t.style.opacity = "0";
    });

    let tl: Timeline | undefined;
    try {
      tl = createTimeline({ defaults: { ease: "outExpo" } });
      tl.add(targets, {
        opacity: [0, 1],
        translateY: [32, 0],
        duration: 800,
        delay: stagger(120),
      });
    } catch {
      targets.forEach((t) => {
        t.style.opacity = "1";
      });
    }

    return () => {
      tl?.pause();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
