# Daily Job Digest

A daily-refreshed page ranking job/internship listings against your resume —
**not** a LinkedIn auto-apply bot. LinkedIn's User Agreement prohibits
automated scraping and automated job applications, so this project
deliberately doesn't touch LinkedIn at all. Instead it:

1. Pulls listings from public, key-free job-board APIs.
2. Scores each listing against `config/profile.yaml` (built from your
   resume: skills, target titles, locations).
3. Renders the top matches into a digest page you review and apply to
   yourself, one click at a time.

## How it runs

A scheduled Routine fires into this Claude session once a day. Claude runs
`scripts/run_daily.py`, then republishes `data/digest.html` to the existing
Artifact URL so the same link always shows the latest matches.

Live digest: (see the artifact link shared in chat)

## Project layout

- `config/profile.yaml` — your skills, target titles, locations, weights.
  Edit this whenever your resume or job search changes.
- `scripts/fetch_jobs.py` — pulls raw listings from Remotive and RemoteOK
  (both public, key-free APIs).
- `scripts/score_jobs.py` — filters by location, scores by weighted keyword
  match against your profile, tracks which jobs were already shown
  (`data/seen.json`) so the digest can flag new matches.
- `scripts/build_digest.py` — renders `templates/digest_template.html` +
  the scored data into `data/digest.html`.
- `scripts/run_daily.py` — runs all three in order.
- `data/` — generated output (gitignored except `.gitkeep`).

## Running manually

```bash
pip install -r requirements.txt
python3 scripts/run_daily.py
```

Then publish/update `data/digest.html` as a Claude Artifact.

## Coverage limits (and how to extend)

Remotive and RemoteOK are both remote-job-leaning boards with free,
key-less APIs — they don't have deep coverage of India-only, on-site
listings. To broaden India coverage:

- **Adzuna** has an India index and a free API key
  (https://developer.adzuna.com/). Sign up, then add `ADZUNA_APP_ID` /
  `ADZUNA_APP_KEY` and a new `fetch_adzuna()` function in
  `scripts/fetch_jobs.py` following the same job-schema shape as the
  existing fetchers.
- Company career pages that run Greenhouse or Lever expose public JSON
  boards (e.g. `https://boards-api.greenhouse.io/v1/boards/<company>/jobs`)
  if you want to track specific companies.

## Network access

This runs in a sandboxed environment with an allowlisted egress policy. If
`fetch_jobs.py` reports 403s from the proxy, the job-board hosts
(`remotive.com`, `remoteok.com`, and later `api.adzuna.com` if added) need
to be added to the environment's allowed network domains (environment
settings → Network access, in the session's title bar menu).
