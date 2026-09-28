"use client";

import type { JobRow, JobStatus } from "@/lib/types";

function scoreClass(score: number) {
  if (score >= 10) return "text-emerald-700 border-emerald-700";
  if (score >= 5) return "text-amber-700 border-amber-700";
  return "text-slate-500 border-slate-400";
}

export default function JobCard({
  job,
  onStatusChange,
}: {
  job: JobRow;
  onStatusChange: (id: string, status: JobStatus) => void;
}) {
  const toggle = (target: JobStatus) => {
    onStatusChange(job.id, job.status === target ? "new" : target);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[17px] leading-snug">{job.title || "Untitled role"}</p>
          <div className="text-[13.5px] text-slate-500 mt-0.5">{job.company || "Unknown company"}</div>
        </div>
        <span
          className={`shrink-0 whitespace-nowrap text-[12.5px] font-mono font-semibold border rounded-full px-2.5 py-0.5 ${scoreClass(
            job.score
          )}`}
        >
          match {job.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[12.5px] text-slate-500">
        {job.location && <span>📍 {job.location}</span>}
        {job.job_type && <span>{job.job_type}</span>}
        {job.is_new && (
          <span className="text-emerald-700 bg-emerald-50 font-bold uppercase tracking-wide text-[11px] rounded-full px-2 py-0.5">
            New
          </span>
        )}
      </div>

      {job.matched_terms && job.matched_terms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {job.matched_terms.slice(0, 8).map((t) => (
            <span key={t} className="text-[11.5px] bg-accent/10 text-accent rounded-full px-2 py-0.5">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-1">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent text-white text-[13px] font-semibold rounded-lg px-3 py-1.5"
        >
          View &amp; apply →
        </a>
        <button
          type="button"
          onClick={() => toggle("saved")}
          className={`text-[12px] font-semibold rounded-lg px-2.5 py-1.5 border ${
            job.status === "saved"
              ? "bg-amber-50 text-amber-700 border-amber-700"
              : "bg-white text-slate-600 border-slate-300"
          }`}
        >
          {job.status === "saved" ? "★ Saved" : "☆ Save"}
        </button>
        <button
          type="button"
          onClick={() => toggle("applied")}
          className={`text-[12px] font-semibold rounded-lg px-2.5 py-1.5 border ${
            job.status === "applied"
              ? "bg-emerald-50 text-emerald-700 border-emerald-700"
              : "bg-white text-slate-600 border-slate-300"
          }`}
        >
          {job.status === "applied" ? "✓ Applied" : "Mark applied"}
        </button>
        <span className="ml-auto text-[11.5px] text-slate-400 font-mono">{job.source}</span>
      </div>
    </div>
  );
}
