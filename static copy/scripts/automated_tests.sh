#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}

echo "Running automated tests against $BASE"
bash scripts/smoke_test.sh
bash scripts/a11y_smoke.sh "$BASE"
echo "Automated tests passed"
