"use client";

import { useMemo, useState, useTransition } from "react";
import JobCard from "./JobCard";
import type { JobRow, JobStatus, SyncStatusRow } from "@/lib/types";

type Filter = "all" | "new" | "saved" | "applied";

function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 2) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
}

export default function JobBoard({
  profile,
  initialJobs,
  status,
}: {
  profile: { name: string; headline: string; portfolio: string };
  initialJobs: JobRow[];
  status: SyncStatusRow | null;
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [filter, setFilter] = useState<Filter>("all");
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    if (filter === "all") return jobs;
    if (filter === "new") return jobs.filter((j) => j.is_new);
    return jobs.filter((j) => j.status === filter);
  }, [jobs, filter]);

  const newCount = jobs.filter((j) => j.is_new).length;

  const handleStatusChange = (id: string, nextStatus: JobStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: nextStatus } : j)));
    startTransition(async () => {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
    });
  };

  return (
    <main className="max-w-[720px] mx-auto px-4 pb-16 pt-6">
      <header className="sticky top-0 bg-paper pb-3 pt-1 border-b border-slate-200 mb-1 z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Job Match Board</h1>
            <p className="text-sm text-slate-500">{profile.headline}</p>
            <a
              href={profile.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-[13px] font-semibold"
            >
              {profile.portfolio.replace(/^https?:\/\//, "")}
            </a>
          </div>
          <form action="/api/logout" method="POST">
            <button className="text-[12px] text-slate-400 border border-slate-300 rounded-lg px-2.5 py-1.5" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-wrap gap-2.5 mt-3.5">
        <Stat label="Shown" value={jobs.length} />
        <Stat label="New" value={newCount} />
        <Stat label="Scanned" value={status?.total_candidates ?? "–"} />
      </div>
      <p className="text-[12px] text-slate-500 mt-2.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
        Last synced {timeAgo(status?.last_synced ?? null)} · auto-syncs daily
      </p>

      <div className="flex flex-wrap gap-2 mt-3.5">
        {(["all", "new", "saved", "applied"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[12.5px] px-3 py-1 rounded-full border ${
              filter === f ? "bg-accent text-white border-accent" : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-[12px] uppercase tracking-wide text-slate-400 font-mono mt-5 mb-2.5">Ranked matches</p>

      <div className="flex flex-col gap-3">
        {visible.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-2xl p-7 text-center text-slate-500 text-sm">
            {jobs.length === 0
              ? "No matches synced yet. Trigger /api/sync (the daily cron does this automatically) to populate the board."
              : "Nothing in this filter yet."}
          </div>
        ) : (
          visible.map((job) => <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />)
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex-1 min-w-[120px]">
      <span className="block font-mono text-xl font-semibold tabular-nums">{value}</span>
      <span className="text-[11.5px] uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}
