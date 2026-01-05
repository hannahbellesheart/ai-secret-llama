#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:8000}
PAGE=$(mktemp)
curl -sS "$BASE/index.html" -o "$PAGE"
PASS=0
FAIL=0
check() {
  if eval "$1"; then
    echo "OK: $2"
    PASS=$((PASS+1))
  else
    echo "FAIL: $2"
    FAIL=$((FAIL+1))
  fi
}

# 1. page contains aria-live
check "grep -qi 'aria-live' $PAGE" "aria-live present"
# 2. images have alt attributes
check "grep -qi '<img[^>]*alt=' $PAGE" "images have alt"
# 3. form inputs/selects/textarea have labels or aria-label
check "(grep -qi '<textarea' $PAGE && grep -qi '\(aria-label\|<label\|id=\)' $PAGE) || ! grep -qi '<textarea' $PAGE" "textarea has label or aria-label"
check "(grep -qi '<select' $PAGE && grep -qi '\(aria-label\|<label\|id=\)' $PAGE) || ! grep -qi '<select' $PAGE" "select has label or aria-label"
check "(grep -qi '<input' $PAGE && grep -qi '\(aria-label\|<label\|id=\)' $PAGE) || ! grep -qi '<input' $PAGE" "inputs have label or aria-label"
# 4. buttons use aria-label or visible text
check "grep -qi '<button' $PAGE && (grep -qi 'aria-label' $PAGE || grep -qi '<button[^>]*>[^<]' $PAGE)" "buttons have aria-label or text"

rm -f "$PAGE"

echo "a11y smoke: pass=$PASS fail=$FAIL"
if [ "$FAIL" -ne 0 ]; then
  exit 2
fi
