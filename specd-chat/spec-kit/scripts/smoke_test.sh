#!/bin/bash
# smoke_test.sh - Basic smoke test for the application

BASE_URL="${1:-http://localhost:8080}"
REPORT_FILE="spec-kit/reports/smoke_test_$(date +%Y%m%d_%H%M%S).json"

echo "Running smoke test on $BASE_URL"

# Check if index.html loads
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/index.html" 2>/dev/null)
if [ "$STATUS" -ne 200 ] && [ "$STATUS" -ne 304 ]; then
    echo "FAIL: index.html returned $STATUS"
    echo "{\"result\": \"fail\", \"details\": \"index.html status $STATUS\"}" > "$REPORT_FILE"
    exit 1
fi

# Check if main JS loads
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/src/app.js" 2>/dev/null)
if [ "$STATUS" -ne 200 ] && [ "$STATUS" -ne 304 ]; then
    echo "FAIL: app.js returned $STATUS"
    echo "{\"result\": \"fail\", \"details\": \"app.js status $STATUS\"}" > "$REPORT_FILE"
    exit 1
fi

# Check if CSS loads
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/src/styles.css" 2>/dev/null)
if [ "$STATUS" -ne 200 ] && [ "$STATUS" -ne 304 ]; then
    echo "FAIL: styles.css returned $STATUS"
    echo "{\"result\": \"fail\", \"details\": \"styles.css status $STATUS\"}" > "$REPORT_FILE"
    exit 1
fi

# Check if worker.js loads
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/src/worker.js" 2>/dev/null)
if [ "$STATUS" -ne 200 ] && [ "$STATUS" -ne 304 ]; then
    echo "FAIL: worker.js returned $STATUS"
    echo "{\"result\": \"fail\", \"details\": \"worker.js status $STATUS\"}" > "$REPORT_FILE"
    exit 1
fi

# Check for basic HTML structure
HTML=$(curl -s "$BASE_URL/index.html" 2>/dev/null)
if ! echo "$HTML" | grep -q "<title>Secret Llama</title>"; then
    echo "FAIL: Title not found"
    echo "{\"result\": \"fail\", \"details\": \"title not found\"}" > "$REPORT_FILE"
    exit 1
fi

echo "PASS: Smoke test passed"
echo "{\"result\": \"pass\", \"timestamp\": \"$(date)\"}" > "$REPORT_FILE"
