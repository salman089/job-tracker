import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const initial = name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-muted font-mono text-xs text-foreground">
        {initial}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
