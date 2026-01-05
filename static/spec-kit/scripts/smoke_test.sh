#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
FILES=("app.js" "worker.js" "index.html")
for f in "${FILES[@]}"; do
  echo "Checking $f..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$f")
  if [ "$STATUS" != "200" ]; then
    echo "FAIL $f: $STATUS" >&2
    exit 2
  fi
done

echo "All checks passed: ${FILES[*]} served OK from $BASE"
