import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles both flows that land here: OAuth (Google) redirects with `code`,
 * email confirmation / recovery links redirect with `token_hash` + `type`.
 * Google reaches aal1 only - TOTP is opt-in, so this only detours through
 * /login/verify for accounts that have actually enrolled a factor.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=oauth`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery" | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=link`);
    }
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: userData } = await supabase.auth.getUser();
  const factors = userData.user?.factors ?? [];
  const hasVerifiedTotp = factors.some(
    (f) => f.factor_type === "totp" && f.status === "verified"
  );

  return NextResponse.redirect(
    `${origin}${hasVerifiedTotp ? "/login/verify" : "/dashboard"}`
  );
}
