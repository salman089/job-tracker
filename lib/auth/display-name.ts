import type { User } from "@supabase/supabase-js";

export function getDisplayName(user: Pick<User, "user_metadata" | "email"> | null | undefined) {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) return fullName.trim();
  return user?.email?.split("@")[0] ?? "there";
}
