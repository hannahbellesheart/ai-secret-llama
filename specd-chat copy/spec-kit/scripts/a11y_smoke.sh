#!/bin/bash
# a11y_smoke.sh - Basic accessibility smoke test

BASE_URL="${1:-http://localhost:8080}"
REPORT_FILE="spec-kit/reports/a11y_smoke_$(date +%Y%m%d_%H%M%S).json"

echo "Running accessibility smoke test on $BASE_URL"

echo "Running accessibility smoke test on $BASE_URL"

HTML=$(curl -s "$BASE_URL/index.html" 2>/dev/null)

# Check for ARIA labels
if ! echo "$HTML" | grep -q "aria-label"; then
    echo "FAIL: No aria-label found"
    echo "{\"result\": \"fail\", \"details\": \"no aria-label\"}" > "$REPORT_FILE"
    exit 1
fi

# Check for semantic HTML
if ! echo "$HTML" | grep -q "<main>"; then
    echo "FAIL: No <main> element"
    echo "{\"result\": \"fail\", \"details\": \"no main element\"}" > "$REPORT_FILE"
    exit 1
fi

# Check for heading hierarchy (basic)
if ! echo "$HTML" | grep -q "<h1>"; then
    echo "FAIL: No h1 heading"
    echo "{\"result\": \"fail\", \"details\": \"no h1\"}" > "$REPORT_FILE"
    exit 1
fi

echo "PASS: Accessibility smoke test passed"
echo "{\"result\": \"pass\", \"timestamp\": \"$(date)\"}" > "$REPORT_FILE"
