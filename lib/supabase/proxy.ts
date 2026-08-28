import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Accessible with no session at all.
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth"];
// Accessible once authenticated at aal1, without being bounced to /login/verify,
// regardless of whether the user has a factor enrolled.
const AAL1_ALLOWED_ROUTES = [...PUBLIC_ROUTES, "/mfa"];
const AAL_VERIFY_ROUTE = "/login/verify";

/**
 * Refreshes the Supabase session on every request and gates access:
 * unauthenticated -> /login. TOTP is optional (see 0003_optional_mfa.sql) -
 * a user who never enrolled a factor is let through at aal1; a user who DID
 * enroll one is bounced to /login/verify until they complete the aal2
 * challenge. This is an optimistic check only - the RLS restrictive policy
 * mirrors this exact condition and is the real access boundary.
 */
export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set - " +
        "auth gating is disabled until supabase/migrations are applied and .env.local is filled in."
    );
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const pathname = request.nextUrl.pathname;

  const isFullyPublicRoute =
    pathname === "/" || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAal1AllowedRoute = AAL1_ALLOWED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthFormRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAal2 = claims?.aal === "aal2";

  if (!claims && !isFullyPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (claims && !isAal2 && !isAal1AllowedRoute) {
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasEnrolledFactor = (factorsData?.totp.length ?? 0) > 0;
    if (hasEnrolledFactor) {
      const url = request.nextUrl.clone();
      url.pathname = AAL_VERIFY_ROUTE;
      return NextResponse.redirect(url);
    }
  }

  if (claims && isAal2 && isAuthFormRoute && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
