#!/bin/bash
# syntax_smoke.sh - Basic syntax check for JS files

REPORT_FILE="${1:-spec-kit/reports/syntax_$(date +%Y%m%d_%H%M%S).json}"

echo "Running syntax smoke test"

# Check if JS files exist and are not empty
if [ ! -f "src/app.js" ] || [ ! -s "src/app.js" ]; then
    echo "FAIL: src/app.js missing or empty"
    echo "{\"result\": \"fail\", \"details\": \"app.js missing\"}" > "$REPORT_FILE"
    exit 1
fi

if [ ! -f "src/worker.js" ] || [ ! -s "src/worker.js" ]; then
    echo "FAIL: src/worker.js missing or empty"
    echo "{\"result\": \"fail\", \"details\": \"worker.js missing\"}" > "$REPORT_FILE"
    exit 1
fi

# Basic checks: no obvious syntax errors (e.g., unmatched braces, but simple)
# Since no Node, just check for balanced braces roughly
BRACES_APP=$(grep -o '{' src/app.js | wc -l)
BRACES_CLOSE_APP=$(grep -o '}' src/app.js | wc -l)
if [ "$BRACES_APP" -ne "$BRACES_CLOSE_APP" ]; then
    echo "FAIL: Unmatched braces in app.js"
    echo "{\"result\": \"fail\", \"details\": \"unmatched braces app.js\"}" > "$REPORT_FILE"
    exit 1
fi

BRACES_WORKER=$(grep -o '{' src/worker.js | wc -l)
BRACES_CLOSE_WORKER=$(grep -o '}' src/worker.js | wc -l)
if [ "$BRACES_WORKER" -ne "$BRACES_CLOSE_WORKER" ]; then
    echo "FAIL: Unmatched braces in worker.js"
    echo "{\"result\": \"fail\", \"details\": \"unmatched braces worker.js\"}" > "$REPORT_FILE"
    exit 1
fi

echo "PASS: Syntax smoke test passed"
echo "{\"result\": \"pass\", \"timestamp\": \"$(date)\"}" > "$REPORT_FILE"