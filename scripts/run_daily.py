#!/usr/bin/env python3
"""Orchestrator: fetch -> score -> build digest HTML. Run this daily.

After this runs, republish data/digest.html to the existing Artifact URL
(via the Artifact tool, passing the stored url=) to push the update live.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

STEPS = ["fetch_jobs.py", "score_jobs.py", "build_digest.py"]


def main():
    for step in STEPS:
        result = subprocess.run([sys.executable, str(ROOT / "scripts" / step)])
        if result.returncode != 0:
            print(f"[error] {step} failed, stopping.", file=sys.stderr)
            sys.exit(result.returncode)
    print("Daily digest data ready at data/digest.html — publish it via the Artifact tool.")


if __name__ == "__main__":
    main()
