# Hooks Setup Guide

Auto-validation hooks that run automatically when AI agents edit test files. These ensure code quality without manual intervention.

## Available Hooks

| Hook | Purpose | When It Runs |
|------|---------|--------------|
| `lint-e2e.sh` | Runs ESLint on test files | After every file edit |
| `validate-test.sh` | Runs a test 5x to check for flakiness | After test creation/modification |

---

## Setup by AI Tool

### Claude Code

Create a `.claude/settings.json` in your project root:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "statusMessage": "Running lint checks...",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/hooks/lint-e2e.sh"
          }
        ]
      }
    ]
  }
}
```

Make the hooks executable:
```bash
chmod +x hooks/lint-e2e.sh hooks/validate-test.sh
```

### Kiro IDE

Add hooks to your skill's YAML frontmatter:

```yaml
---
name: playwright-best-practices
description: Core patterns for Playwright tests
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      statusMessage: "Running lint checks..."
      hooks:
        - type: command
          command: "$PROJECT_DIR/hooks/lint-e2e.sh"
---
```

### Cline

Cline supports hooks since v3.36. Configure in the Cline settings UI:

1. Open Cline settings (gear icon in chat panel)
2. Go to **Hooks** tab
3. Add a new hook:
   - **Event:** PostToolUse
   - **Matcher:** `Edit|Write`
   - **Command:** `./hooks/lint-e2e.sh`

Or add to your `.clinerules/hooks.md`:

```markdown
# Auto-Validation Hooks

After editing any test file (.spec.ts):
1. Run `./hooks/lint-e2e.sh` to check for lint errors
2. If creating a new test, run `./hooks/validate-test.sh "<test title>"` to verify it passes 5 times
```

### Roo Code

Roo Code does not currently support PostToolUse hooks natively. Instead, add validation instructions to your skill:

```markdown
## Post-Edit Validation

After writing or modifying any test file, always:
1. Run `npx eslint --ext .ts "tests/**/*.spec.ts"` to check for lint errors
2. Run `npx playwright test -g "<test title>" --repeat-each=5` to verify stability
```

### Amazon Q CLI

Amazon Q does not support hooks. Include validation steps in your prompts:

```
After writing the test, run these commands to validate:
1. npx eslint tests/checkout/cart.spec.ts
2. npx playwright test -g "test title" --repeat-each=5 --reporter=line
```

---

## How It Works

### lint-e2e.sh

```
AI edits a .spec.ts file
        │
        ▼
  Hook triggers automatically
        │
        ▼
  ESLint runs on test files
        │
    ┌───┴───┐
    │       │
  Pass    Fail
    │       │
    ▼       ▼
 Continue  Exit code 2 (blocking)
           → Agent must fix errors
```

### validate-test.sh

```
AI finishes writing a test
        │
        ▼
  Agent runs: ./hooks/validate-test.sh "test title"
        │
        ▼
  Playwright runs test 5 times
        │
    ┌───┴───┐
    │       │
  5/5 pass  Any failure
    │       │
    ▼       ▼
  Done!    Exit code 2 (blocking)
           → Agent must fix flakiness
```

## Related Resources

- [Claude Code Hooks Docs](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Cline Hooks Docs](https://docs.cline.bot/features/hooks)
- [Kiro Skills Docs](https://kiro.dev/docs/skills/)
- [Error Handling Skill](../skills/error-handling/SKILL.md)
- [Debugging Skill](../skills/debugging-troubleshooting/SKILL.md)
