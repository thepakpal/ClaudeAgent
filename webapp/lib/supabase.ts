import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. Never import this from a
// "use client" component — it must only run in Server Components, Route
// Handlers, and the cron sync job. All reads/writes for this single-user
// app go through the server, so the browser never sees Supabase credentials.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
