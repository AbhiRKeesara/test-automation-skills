#!/bin/bash
# Hook: Auto-lint Playwright test files after AI edits
# Works with: Claude Code (PostToolUse hook), Cline (hooks), Kiro IDE
#
# This script runs ESLint on e2e test files and converts exit code 1 (lint errors)
# to exit code 2 (blocking) so the AI agent is forced to fix issues before continuing.
#
# Usage:
#   Claude Code: Add to .claude/hooks/lint-e2e.sh
#   Cline:       Add to hooks configuration
#   Kiro:        Add to skill hooks section
#
# Setup:
#   chmod +x hooks/lint-e2e.sh

# Run ESLint on the e2e test files
OUTPUT=$(npx eslint --ext .ts,.tsx "tests/**/*.spec.ts" "tests/**/*.ts" 2>&1)
EXIT_CODE=$?

# Print output to stderr so the agent can see lint errors
echo "$OUTPUT" >&2

if [ $EXIT_CODE -eq 1 ]; then
  echo "❌ Lint errors found. Please fix before continuing." >&2
  # Exit code 2 = blocking error (agent must fix before proceeding)
  exit 2
fi

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Lint check passed." >&2
fi

exit $EXIT_CODE
