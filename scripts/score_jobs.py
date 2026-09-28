#!/usr/bin/env python3
"""Score and rank fetched jobs against the candidate profile.

Reads data/raw_jobs.json + config/profile.yaml, filters to relevant/
locationally-plausible listings, scores by weighted keyword overlap,
tracks which jobs have already been shown (data/seen.json) so the daily
digest can flag genuinely new matches, and writes data/latest_digest.json.
"""
import json
import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CONFIG_PATH = ROOT / "config" / "profile.yaml"

TOP_N = 15
MIN_SCORE = 2  # jobs scoring below this are dropped as irrelevant


def load_profile():
    return yaml.safe_load(CONFIG_PATH.read_text())


def load_seen():
    seen_path = DATA_DIR / "seen.json"
    if seen_path.exists():
        return set(json.loads(seen_path.read_text()))
    return set()


def save_seen(seen_ids):
    (DATA_DIR / "seen.json").write_text(json.dumps(sorted(seen_ids), indent=2))


def location_ok(location, wanted_locations):
    loc = (location or "").lower()
    for w in wanted_locations:
        w = w.lower()
        if w == "remote" and ("remote" in loc or "worldwide" in loc or "anywhere" in loc or loc == ""):
            return True
        if w == "india" and "india" in loc:
            return True
        if w in loc:
            return True
    return False


def score_job(job, skills, target_titles):
    text = " ".join(
        [
            job.get("title", ""),
            job.get("company", ""),
            " ".join(job.get("tags", []) or []),
            job.get("description", ""),
        ]
    ).lower()

    score = 0
    matched_terms = []
    for skill in skills:
        term = skill["term"].lower()
        weight = skill.get("weight", 1)
        if re.search(re.escape(term), text):
            score += weight
            matched_terms.append(skill["term"])

    title_lower = job.get("title", "").lower()
    title_bonus = 0
    for t in target_titles:
        if t.lower() in title_lower:
            title_bonus = 4
            break
    score += title_bonus

    return score, matched_terms


def main():
    raw_path = DATA_DIR / "raw_jobs.json"
    if not raw_path.exists():
        raise SystemExit("data/raw_jobs.json not found — run fetch_jobs.py first")

    raw = json.loads(raw_path.read_text())
    profile = load_profile()
    seen = load_seen()

    scored = []
    for job in raw["jobs"]:
        if not location_ok(job.get("location", ""), profile["locations"]):
            continue
        score, matched = score_job(job, profile["skills"], profile["target_titles"])
        if score < MIN_SCORE:
            continue
        job_out = dict(job)
        job_out["score"] = score
        job_out["matched_terms"] = matched
        job_out["is_new"] = job["id"] not in seen
        scored.append(job_out)

    scored.sort(key=lambda j: j["score"], reverse=True)
    top = scored[:TOP_N]

    # mark surfaced jobs as seen for future runs
    seen.update(j["id"] for j in top)
    save_seen(seen)

    digest = {
        "generated_at": raw.get("fetched_at"),
        "profile_headline": profile.get("headline"),
        "total_candidates": len(scored),
        "jobs": top,
    }
    (DATA_DIR / "latest_digest.json").write_text(json.dumps(digest, indent=2))
    new_count = sum(1 for j in top if j["is_new"])
    print(f"Scored {len(scored)} relevant jobs, kept top {len(top)} ({new_count} new) -> data/latest_digest.json")


if __name__ == "__main__":
    main()
