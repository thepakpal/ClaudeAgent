import { NextRequest, NextResponse } from "next/server";
import { fetchAllJobs } from "@/lib/fetchJobs";
import { scoreAndRank } from "@/lib/scoreJobs";
import { supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE, expectedSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function isAuthorized(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization");
  if (auth && process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return false;
  return cookie === (await expectedSessionToken());
}

async function runSync() {
  const raw = await fetchAllJobs();
  const { scored, totalCandidates } = scoreAndRank(raw, 30);

  if (raw.length === 0) {
    return { ok: false, reason: "both job-board fetches failed or returned nothing", totalCandidates: 0, kept: 0, dropped: 0 };
  }

  const db = supabaseAdmin();

  const { data: existingRows, error: selErr } = await db.from("jobs").select("id, status");
  if (selErr) throw selErr;
  const existingIds = new Set((existingRows || []).map((r) => r.id));

  const newIds = new Set(scored.map((j) => j.id));

  const upsertRows = scored.map((job) => ({
    id: job.id,
    source: job.source,
    external_id: job.external_id,
    title: job.title,
    company: job.company,
    location: job.location,
    url: job.url,
    tags: job.tags,
    job_type: job.job_type,
    published: job.published,
    score: job.score,
    matched_terms: job.matched_terms,
    is_new: !existingIds.has(job.id),
    updated_at: new Date().toISOString(),
  }));

  if (upsertRows.length > 0) {
    const { error: upsertErr } = await db.from("jobs").upsert(upsertRows, { onConflict: "id" });
    if (upsertErr) throw upsertErr;
  }

  // Drop stale "new" (never saved/applied) listings that fell out of the ranked set.
  // Anything the user marked saved/applied is kept as a personal record.
  const toDelete = (existingRows || [])
    .filter((r) => !newIds.has(r.id) && (r.status === "new" || !r.status))
    .map((r) => r.id);

  let dropped = 0;
  if (toDelete.length > 0) {
    const { error: delErr } = await db.from("jobs").delete().in("id", toDelete);
    if (delErr) throw delErr;
    dropped = toDelete.length;
  }

  const { error: statusErr } = await db.from("sync_status").upsert({
    id: 1,
    last_synced: new Date().toISOString(),
    total_candidates: totalCandidates,
    total_shown: scored.length,
  });
  if (statusErr) throw statusErr;

  return { ok: true, totalCandidates, kept: scored.length, dropped, newCount: upsertRows.filter((r) => r.is_new).length };
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runSync();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[sync] failed:", err);
    return NextResponse.json({ ok: false, error: err?.message || "sync failed" }, { status: 500 });
  }
}

export const POST = GET;
