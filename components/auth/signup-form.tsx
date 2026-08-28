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
import { signUpWithPassword, signInWithGoogle, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, initialState);
  const [captchaToken, setCaptchaToken] = React.useState("");
  const captchaRequired = Boolean(TURNSTILE_SITE_KEY);
  const captchaPending = captchaRequired && !captchaToken;
  const turnstileRef = React.useRef<TurnstileWidgetHandle>(null);

  React.useEffect(() => {
    if (state.message || state.errors) {
      setCaptchaToken("");
      turnstileRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">Sign up</h1>
        <p className="text-sm text-muted-foreground">
          Create your JobBase account. You can turn on two-factor authentication
          later in Settings.
        </p>
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
          <Label htmlFor="password" className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(state.errors?.password)}
            required
          />
          {state.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>

        <input type="hidden" name="captchaToken" value={captchaToken} />
        <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

        {state.message && !state.errors && (
          <p className="text-xs text-destructive">{state.message}</p>
        )}

        <Button type="submit" disabled={pending || captchaPending} className="w-full">
          {pending ? "Creating account..." : captchaPending ? "Completing security check..." : "Sign up"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
