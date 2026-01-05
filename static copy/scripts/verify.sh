#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
REPORT=${2:-/tmp/verify_report.txt}
rm -f "$REPORT"
{
  echo "Verification report: $(date)"
  echo "Running syntax checks..."
  node --check app.js worker.js && echo "Syntax: OK"
  echo "Running smoke tests..."
  bash scripts/smoke_test.sh && echo "Smoke: OK"
  echo "Accessibility checks: (basic)"
  # Basic accessibility heuristics: ensure important elements exist
  curl -sS "$BASE/index.html" | grep -i "aria" >/dev/null && echo "Accessibility: ARIA attributes present" || echo "Accessibility: ARIA attributes not found (manual check recommended)"
  echo "Verification complete."
} | tee "$REPORT"
