#!/usr/bin/env python3
"""Fetch job/internship listings from public, ToS-compliant job board APIs.

No LinkedIn scraping or automated LinkedIn activity happens anywhere in this
project — LinkedIn's User Agreement prohibits automated scraping and
automated job applications. This pulls from job boards that offer public,
key-free APIs intended for programmatic use.

Sources:
  - Remotive (https://remotive.com/api-documentation) - remote jobs, has a
    "design" category.
  - RemoteOK (https://remoteok.com/api) - remote jobs, tag-searchable.

Both are global/remote-leaning; on-site India-only roles are not well
covered by free key-less APIs. See README for how to add Adzuna (needs a
free API key) for broader India coverage.
"""
import json
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

HEADERS = {"User-Agent": "job-digest-bot/1.0 (personal use, respects robots.txt)"}
TIMEOUT = 20


def fetch_remotive():
    jobs = []
    try:
        resp = requests.get(
            "https://remotive.com/api/remote-jobs",
            params={"category": "design"},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        for j in resp.json().get("jobs", []):
            jobs.append(
                {
                    "source": "remotive",
                    "id": f"remotive-{j.get('id')}",
                    "title": j.get("title", ""),
                    "company": j.get("company_name", ""),
                    "location": j.get("candidate_required_location", ""),
                    "url": j.get("url", ""),
                    "tags": j.get("tags", []),
                    "description": (j.get("description") or "")[:4000],
                    "published": j.get("publication_date", ""),
                    "job_type": j.get("job_type", ""),
                }
            )
    except requests.RequestException as e:
        print(f"[warn] Remotive fetch failed: {e}", file=sys.stderr)
    return jobs


def fetch_remoteok():
    jobs = []
    try:
        resp = requests.get("https://remoteok.com/api", headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        for j in data:
            if not isinstance(j, dict) or "id" not in j or "position" not in j:
                continue  # first element is a legal notice, skip non-job entries
            jobs.append(
                {
                    "source": "remoteok",
                    "id": f"remoteok-{j.get('id')}",
                    "title": j.get("position", ""),
                    "company": j.get("company", ""),
                    "location": j.get("location", "") or "Remote",
                    "url": j.get("url", "") or f"https://remoteok.com/remote-jobs/{j.get('id')}",
                    "tags": j.get("tags", []),
                    "description": (j.get("description") or "")[:4000],
                    "published": j.get("date", ""),
                    "job_type": "",
                }
            )
    except requests.RequestException as e:
        print(f"[warn] RemoteOK fetch failed: {e}", file=sys.stderr)
    return jobs


def main():
    all_jobs = []
    all_jobs.extend(fetch_remotive())
    all_jobs.extend(fetch_remoteok())

    out_path = DATA_DIR / "raw_jobs.json"
    out_path.write_text(json.dumps({"fetched_at": time.time(), "jobs": all_jobs}, indent=2))
    print(f"Fetched {len(all_jobs)} jobs -> {out_path}")


if __name__ == "__main__":
    main()
