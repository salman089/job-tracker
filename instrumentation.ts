export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Vercel's serverless network resolves some hosts (Supabase included) to
    // an IPv6 address that isn't actually reachable, so the first connection
    // attempt hangs until Node's ~2 minute TCP connect timeout before falling
    // back to IPv4 - this is what made login "hang" for 2-3 minutes. Forcing
    // IPv4 first skips the broken attempt entirely.
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
