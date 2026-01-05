#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
REPORT=${2:-/tmp/speckit_verify_report.txt}
rm -f "$REPORT"
# resolve paths relative to this script so it can be called from anywhere
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STATIC_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
SMOKE="$SCRIPT_DIR/smoke_test.sh"
A11Y="$SCRIPT_DIR/a11y_smoke.sh"
PERF="$SCRIPT_DIR/perf_test.sh"

{
  echo "Spec-kit verification report: $(date)"
  echo "Running syntax checks..."
  node --check "$STATIC_ROOT/app.js" "$STATIC_ROOT/worker.js" && echo "Syntax: OK"
  echo "Running smoke tests..."
  bash "$SMOKE" "$BASE" && echo "Smoke: OK"
  echo "Running accessibility checks..."
  bash "$A11Y" "$BASE" && echo "Accessibility: OK"
  echo "Running basic perf checks..."
  bash "$PERF" "$BASE" && echo "Perf: OK"
  echo "Verification complete."
} | tee "$REPORT"
