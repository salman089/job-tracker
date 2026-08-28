"use client";

import * as React from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export interface TurnstileWidgetHandle {
  /** Forces a fresh challenge/token — call after a failed submission, since
   * a token Supabase already rejected (or already consumed) will just be
   * rejected again if resubmitted as-is. */
  reset: () => void;
}

/**
 * Cloudflare Turnstile widget. Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * isn't configured, so auth keeps working exactly as before until it's set up
 * (Supabase Dashboard -> Authentication -> Attack Protection) - see .env.example.
 *
 * Reports token expiry/failure back through onVerify("") so callers can
 * re-disable submit until a fresh token comes in - otherwise a stale or
 * never-issued token gets posted and Supabase rejects with "no captcha_token
 * found".
 */
export const TurnstileWidget = React.forwardRef<TurnstileWidgetHandle, { onVerify: (token: string) => void }>(
  function TurnstileWidget({ onVerify }, ref) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const widgetIdRef = React.useRef<string | undefined>(undefined);
    const [scriptLoaded, setScriptLoaded] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    React.useEffect(() => {
      if (!scriptLoaded || !containerRef.current || !window.turnstile || !TURNSTILE_SITE_KEY) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: onVerify,
        "expired-callback": () => onVerify(""),
        "error-callback": () => onVerify(""),
      });
    }, [scriptLoaded, onVerify]);

    if (!TURNSTILE_SITE_KEY) return null;

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          onLoad={() => setScriptLoaded(true)}
        />
        <div ref={containerRef} />
      </>
    );
  }
);
