#!/usr/bin/env bash
set -euo pipefail
# Runs a per-iteration checklist using spec-kit verification scripts

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)
REPORT_JSON=${1:-/tmp/speckit_iteration_report.json}

echo "{\n  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"," > "$REPORT_JSON"
echo "  \"checks\": {" >> "$REPORT_JSON"

echo -n "    \"syntax\": \"" >> "$REPORT_JSON"
if node --check "$ROOT_DIR/app.js" "$ROOT_DIR/worker.js" >/dev/null 2>&1; then
  echo -n "ok" >> "$REPORT_JSON"
else
  echo -n "fail" >> "$REPORT_JSON"
fi
echo -n "\"," >> "$REPORT_JSON"

echo -n "    \"verify_harness\": \"" >> "$REPORT_JSON"
if bash "$SCRIPT_DIR/scripts/verify.sh" >/dev/null 2>&1; then
  echo -n "ok" >> "$REPORT_JSON"
else
  echo -n "fail" >> "$REPORT_JSON"
fi
echo -n "\"\n  }\n}" >> "$REPORT_JSON"

echo "Iteration checklist complete. Report: $REPORT_JSON"
