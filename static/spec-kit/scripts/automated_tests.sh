#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
echo "Running full spec-kit automated tests against $BASE"
bash ./verify.sh "$BASE"
echo "Automated tests complete"
