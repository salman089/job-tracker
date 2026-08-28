"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TurnstileWidget,
  TURNSTILE_SITE_KEY,
  type TurnstileWidgetHandle,
} from "@/components/auth/turnstile-widget";
import { signInWithPassword, signInWithGoogle, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInWithPassword, initialState);
  const [captchaToken, setCaptchaToken] = React.useState("");
  const captchaRequired = Boolean(TURNSTILE_SITE_KEY);
  const captchaPending = captchaRequired && !captchaToken;
  const turnstileRef = React.useRef<TurnstileWidgetHandle>(null);

  // A rejected/consumed token would otherwise just get resubmitted as-is on
  // the next click, failing identically every time — force a fresh
  // challenge whenever the previous submission came back with an error.
  React.useEffect(() => {
    if (state.message || state.errors) {
      setCaptchaToken("");
      turnstileRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">Log in</h1>
        <p className="text-sm text-muted-foreground">Welcome back to JobBase.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(state.errors?.email)}
            required
          />
          {state.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(state.errors?.password)}
            required
          />
          {state.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <input type="hidden" name="captchaToken" value={captchaToken} />
        <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

        {state.message && !state.errors && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}

        <Button type="submit" disabled={pending || captchaPending} className="w-full">
          {pending ? "Logging in..." : captchaPending ? "Completing security check..." : "Log in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
