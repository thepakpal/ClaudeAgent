import { profile } from "./profile";
import type { RawJob } from "./fetchJobs";

export type ScoredJob = RawJob & {
  id: string; // "<source>-<external_id>", used as the DB primary key
  score: number;
  matched_terms: string[];
};

const MIN_SCORE = 2;

function locationOk(location: string): boolean {
  const loc = (location || "").toLowerCase();
  for (const want of profile.locations) {
    const w = want.toLowerCase();
    if (w === "remote" && (loc.includes("remote") || loc.includes("worldwide") || loc.includes("anywhere") || loc === "")) {
      return true;
    }
    if (w === "india" && loc.includes("india")) return true;
    if (loc.includes(w)) return true;
  }
  return false;
}

function scoreJob(job: RawJob): { score: number; matched: string[] } {
  const text = [job.title, job.company, (job.tags || []).join(" ")].join(" ").toLowerCase();
  let score = 0;
  const matched: string[] = [];

  for (const skill of profile.skills) {
    if (text.includes(skill.term.toLowerCase())) {
      score += skill.weight;
      matched.push(skill.term);
    }
  }

  const titleLower = (job.title || "").toLowerCase();
  if (profile.targetTitles.some((t) => titleLower.includes(t.toLowerCase()))) {
    score += 4;
  }

  return { score, matched };
}

export function scoreAndRank(jobs: RawJob[], topN = 30): { scored: ScoredJob[]; totalCandidates: number } {
  const candidates: ScoredJob[] = [];

  for (const job of jobs) {
    if (!locationOk(job.location)) continue;
    const { score, matched } = scoreJob(job);
    if (score < MIN_SCORE) continue;
    candidates.push({
      ...job,
      id: `${job.source}-${job.external_id}`,
      score,
      matched_terms: matched,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return { scored: candidates.slice(0, topN), totalCandidates: candidates.length };
}
