"use client";

import * as React from "react";
import { animate } from "animejs";

/**
 * Animates a stat number counting up from 0 on mount via anime.js, writing
 * directly to the element's textContent (skipping React re-renders per
 * frame) for smoothness. Falls back to the plain final value under
 * prefers-reduced-motion or if anime.js throws for any reason.
 */
export function CountUpNumber({ value }: { value: number }) {
  const ref = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(value);
      return;
    }

    const counter = { n: 0 };
    try {
      const anim = animate(counter, {
        n: value,
        duration: 900,
        ease: "outExpo",
        onUpdate: () => {
          el.textContent = String(Math.round(counter.n));
        },
      });
      return () => {
        anim.pause();
      };
    } catch {
      el.textContent = String(value);
    }
  }, [value]);

  return (
    <p ref={ref} className="font-heading text-2xl font-semibold text-foreground">
      0
    </p>
  );
}
