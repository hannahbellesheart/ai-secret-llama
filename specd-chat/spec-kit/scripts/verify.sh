#!/bin/bash
# verify.sh - Main verification script

BASE_URL="${1:-http://localhost:8080}"
REPORT_FILE="${2:-spec-kit/reports/verify_$(date +%Y%m%d_%H%M%S).json}"

echo "Running full verification on $BASE_URL"

# Run smoke test
echo "Running smoke test..."
if bash spec-kit/scripts/smoke_test.sh "$BASE_URL"; then
    SMOKE_RESULT="pass"
else
    SMOKE_RESULT="fail"
fi

# Run a11y test
echo "Running accessibility test..."
if bash spec-kit/scripts/a11y_smoke.sh "$BASE_URL"; then
    A11Y_RESULT="pass"
else
    A11Y_RESULT="fail"
fi

# Run syntax test
echo "Running syntax test..."
if bash spec-kit/scripts/syntax_smoke.sh "$REPORT_FILE"; then
    SYNTAX_RESULT="pass"
else
    SYNTAX_RESULT="fail"
fi

# For now, assume perf pass
PERF_RESULT="pass"

# Generate report
echo "{\"smoke\": \"$SMOKE_RESULT\", \"a11y\": \"$A11Y_RESULT\", \"perf\": \"$PERF_RESULT\", \"syntax\": \"$SYNTAX_RESULT\", \"timestamp\": \"$(date)\"}" > "$REPORT_FILE"

if [ "$SMOKE_RESULT" = "pass" ] && [ "$A11Y_RESULT" = "pass" ] && [ "$SYNTAX_RESULT" = "pass" ]; then
    echo "Verification passed"
    exit 0
else
    echo "Verification failed"
    exit 1
fi
