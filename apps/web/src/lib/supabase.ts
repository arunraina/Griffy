import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Every caller on a page (Navbar, NotificationProvider, the page component
// itself, ...) invokes createClient() independently. Without caching a
// single instance, each call spins up its own GoTrueClient with its own
// auto-refresh timer, all sharing the same localStorage session — and since
// Supabase rotates refresh tokens on every refresh, concurrent instances
// racing to refresh the same session cause one to win and the rest to
// invalidate, intermittently turning a perfectly valid session into
// "Invalid token" mid-page. Cache one instance per page load instead.
let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
