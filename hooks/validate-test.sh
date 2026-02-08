#!/bin/bash
# Hook: Self-validate a Playwright test by running it multiple times
# Works with: Claude Code, Cline, Kiro IDE (any tool that supports shell hooks)
#
# Runs a specific test 5 times to verify it's not flaky before considering it done.
# The agent should call this after writing or modifying a test.
#
# Usage:
#   ./hooks/validate-test.sh "Should display product details"
#   ./hooks/validate-test.sh "tests/checkout/cart.spec.ts"
#
# Setup:
#   chmod +x hooks/validate-test.sh

TEST_TARGET="${1:?Usage: validate-test.sh <test-title-or-file>}"
REPEAT_COUNT="${2:-5}"

echo "🔄 Running test ${REPEAT_COUNT} times to verify stability..." >&2

# Check if input looks like a file path or a test title
if [[ "$TEST_TARGET" == *.spec.ts ]] || [[ "$TEST_TARGET" == *.test.ts ]]; then
  OUTPUT=$(npx playwright test "$TEST_TARGET" --repeat-each="$REPEAT_COUNT" --reporter=line 2>&1)
else
  OUTPUT=$(npx playwright test -g "$TEST_TARGET" --repeat-each="$REPEAT_COUNT" --reporter=line 2>&1)
fi

EXIT_CODE=$?

echo "$OUTPUT" >&2

if [ $EXIT_CODE -eq 0 ]; then
  echo "" >&2
  echo "✅ Test passed ${REPEAT_COUNT}/${REPEAT_COUNT} times. Not flaky!" >&2
  exit 0
else
  echo "" >&2
  echo "❌ Test failed during ${REPEAT_COUNT}x validation. Fix flakiness before proceeding." >&2
  exit 2
fi
