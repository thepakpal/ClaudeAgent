import { supabaseAdmin } from "@/lib/supabase";
import { profile } from "@/lib/profile";
import JobBoard from "@/components/JobBoard";
import type { JobRow, SyncStatusRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = supabaseAdmin();

  const [{ data: jobs, error: jobsErr }, { data: status }] = await Promise.all([
    db.from("jobs").select("*").order("score", { ascending: false }).limit(30),
    db.from("sync_status").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (jobsErr) {
    throw new Error(`Failed to load jobs: ${jobsErr.message}`);
  }

  return (
    <JobBoard
      profile={{ name: profile.name, headline: profile.headline, portfolio: profile.portfolio }}
      initialJobs={(jobs || []) as JobRow[]}
      status={status as SyncStatusRow | null}
    />
  );
}
