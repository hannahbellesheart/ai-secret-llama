#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
echo "Basic perf check: measuring download times for key assets"
for f in app.js worker.js index.html; do
  echo -n "$f: "
  curl -s -w "\n%{time_total}s\n" -o /dev/null "$BASE/$f"
done

echo "Perf check complete"
