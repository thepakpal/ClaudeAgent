#!/usr/bin/env python3
"""Render data/latest_digest.json + config/profile.yaml into a static HTML
digest page (data/digest.html). This file is what gets published/updated as
a Claude Artifact each day.
"""
import json
import time
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CONFIG_PATH = ROOT / "config" / "profile.yaml"
TEMPLATE_PATH = ROOT / "templates" / "digest_template.html"
OUT_PATH = DATA_DIR / "digest.html"


def main():
    digest = json.loads((DATA_DIR / "latest_digest.json").read_text())
    profile = yaml.safe_load(CONFIG_PATH.read_text())
    template = TEMPLATE_PATH.read_text()

    generated_at = digest.get("generated_at")
    generated_str = (
        time.strftime("%A, %d %B %Y — %H:%M UTC", time.gmtime(generated_at))
        if generated_at
        else "not yet run"
    )

    payload = {
        "name": profile.get("name"),
        "headline": profile.get("headline"),
        "portfolio": profile.get("portfolio"),
        "generated_str": generated_str,
        "total_candidates": digest.get("total_candidates", 0),
        "jobs": digest.get("jobs", []),
    }

    html = template.replace("__DIGEST_DATA__", json.dumps(payload))
    OUT_PATH.write_text(html)
    print(f"Built digest page -> {OUT_PATH} ({len(payload['jobs'])} jobs)")


if __name__ == "__main__":
    main()
