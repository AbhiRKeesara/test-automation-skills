# Test Automation Skills

A comprehensive collection of best practices, patterns, and guidelines for test automation that can be used by AI coding assistants (Claude Code, Kiro IDE, Amazon Q CLI) and human developers.

## Purpose

This repository provides structured skills and patterns to:
- Maintain high code quality in test automation
- Enable AI assistants to write better test code
- Prevent common anti-patterns and technical debt
- Support incremental migration between testing frameworks
- Ensure consistency across team members

## Quick Start

### For Team Members

1. **Clone this repository** to your local machine or reference it in your project
2. **Read the [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md)** guide for prompt templates
3. **Browse [skills/](./skills/)** to find relevant best practices
4. **Use [templates/](./templates/)** for quick-start code

### For AI Assistants

Choose your tool below for setup instructions, then see [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md) for prompt templates.

<details>
<summary><strong>🟣 Kiro IDE</strong> (click to expand)</summary>

Kiro auto-activates skills when your prompt matches a skill's description. Install skills at workspace level (project-specific) or global level (all projects).

**Option A: Workspace skills (recommended for teams)**
```bash
# From your Playwright project root
mkdir -p .kiro/skills/
cp -r path/to/test-automation-skills/skills/* .kiro/skills/
```

**Option B: Global skills (available in all projects)**
```bash
cp -r path/to/test-automation-skills/skills/* ~/.kiro/skills/
```

**Verify it works** — type this in Kiro chat:
```
Using the error-handling skill, create a test that verifies
my app shows a friendly error when the /api/products endpoint returns 500.
```

Kiro reads each `SKILL.md` automatically and activates the right skill based on your prompt. Workspace skills take priority over global ones.

</details>

<details>
<summary><strong>🟠 Claude Code</strong> (click to expand)</summary>

Claude Code can reference skills when this repo is in your workspace or referenced via CLAUDE.md.

**Option A: Add to your project's CLAUDE.md**
```markdown
## Test Automation Skills
When writing Playwright tests, reference the skills in ./test-automation-skills/skills/:
- playwright-best-practices/SKILL.md for core patterns
- selector-strategies/SKILL.md for finding elements
- error-handling/SKILL.md for handling failures
- page-object-model/SKILL.md for POM architecture
```

**Option B: Clone into your project**
```bash
git clone <this-repo-url> test-automation-skills
```

**Verify it works** — type this in Claude Code:
```
Using the playwright-best-practices and selector-strategies skills
from test-automation-skills/, create a test for user login.
```

</details>

<details>
<summary><strong>🔵 Amazon Q CLI</strong> (click to expand)</summary>

Reference skills directly in your prompts with Amazon Q.

**Setup:** Clone or copy this repo into your project workspace so Amazon Q can see the files.

```bash
git clone <this-repo-url> test-automation-skills
```

**Usage** — include skill paths in your prompt:
```
Read test-automation-skills/skills/playwright-best-practices/SKILL.md
and test-automation-skills/skills/selector-strategies/SKILL.md,
then create a test for the checkout flow.
```

**Tip:** Amazon Q works best when you explicitly point to the SKILL.md files in your prompt.

</details>

<details>
<summary><strong>🟢 Roo Code</strong> (click to expand)</summary>

Roo Code supports [Agent Skills](https://docs.roocode.com/features/skills) with `SKILL.md` files — the same format this repo uses! Skills auto-activate when your prompt matches the skill description.

**Option A: Workspace skills (recommended for teams)**
```bash
# From your Playwright project root
mkdir -p .roo/skills/
cp -r path/to/test-automation-skills/skills/* .roo/skills/
```

**Option B: Global skills (all projects)**
```bash
cp -r path/to/test-automation-skills/skills/* ~/.roo/skills/
```

**Option C: Mode-specific skills (e.g., only in Code mode)**
```bash
cp -r path/to/test-automation-skills/skills/* ~/.roo/skills-code/
```

> **Note:** Roo requires YAML frontmatter (`name` and `description`) in SKILL.md files. The skills in this repo are compatible — Roo reads the first heading and content as the description if frontmatter is absent.

**Verify it works** — type this in Roo Code chat:
```
Create a Playwright test that handles network errors gracefully
when the products API returns a 500 error.
```

Roo auto-discovers skills based on your request — no need to reference them by name.

</details>

<details>
<summary><strong>⚪ Cline</strong> (click to expand)</summary>

Cline uses [.clinerules](https://docs.cline.bot/features/cline-rules) for project-specific instructions. You can point Cline to these skills via rules files.

**Option A: Create a .clinerules directory (recommended)**
```bash
# From your Playwright project root
mkdir -p .clinerules/

# Create a rule that references the skills
cat > .clinerules/test-automation.md << 'EOF'
# Test Automation Standards

When writing or reviewing Playwright tests, follow the best practices defined in:
- test-automation-skills/skills/playwright-best-practices/SKILL.md
- test-automation-skills/skills/selector-strategies/SKILL.md
- test-automation-skills/skills/error-handling/SKILL.md
- test-automation-skills/skills/page-object-model/SKILL.md
- test-automation-skills/skills/debugging-troubleshooting/SKILL.md

Key rules:
- Use accessibility-first selectors (getByRole, getByLabel) over CSS/XPath
- Never use hard-coded waits (waitForTimeout)
- Follow Page Object Model pattern
- Include meaningful assertion messages
- Handle errors gracefully with route interception, not try-catch around assertions
EOF
```

**Option B: Single .clinerules file**
```bash
# Create a single rules file at project root
echo "When writing Playwright tests, read and follow the patterns in test-automation-skills/skills/ directory. Start with playwright-best-practices/SKILL.md for core patterns." > .clinerules
```

**Usage** — reference skills explicitly in your prompt:
```
Read test-automation-skills/skills/error-handling/SKILL.md and create
a test that verifies my app handles API failures gracefully.
```

**Tip:** Cline rules are version-controllable — commit `.clinerules/` to Git so your whole team shares the same standards.

</details>

#### Quick Example (works in any AI tool)
```
Using the playwright-best-practices skill, create a test for login functionality.
```

## Available Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| [Playwright Best Practices](./skills/playwright-best-practices/) | Core patterns for Playwright + TypeScript | Writing new tests, refactoring existing ones |
| [Page Object Model](./skills/page-object-model/) | Complete POM design patterns | Building maintainable test architecture |
| [Action Utilities](./skills/action-utilities/) | UIActions - Centralized interaction gateway with advanced wait patterns | Implementing clean Page Object interactions, custom waits |
| [Assertion Utilities](./skills/assertion-utilities/) | AssertUtils & ExpectUtils patterns | Centralized validations, soft assertions |
| [Selector Strategies](./skills/selector-strategies/) | Resilient selector patterns with advanced filtering (hasText, has, and, or) | Finding elements, filtering lists, improving test stability |
| [Migration Patterns](./skills/migration-patterns/) | Framework migration guide | Moving from Puppeteer/Selenium/Cypress to Playwright |
| [Accessibility Testing](./skills/accessibility-testing/) | A11y testing patterns | Adding accessibility checks |
| [Localization Testing](./skills/localization-testing/) | i18n/l10n testing approaches | Testing multi-language apps |
| [Code Organization](./skills/code-organization/) | Project structure & naming | Setting up new projects, reorganizing tests |
| [API Testing](./skills/api-testing/) | REST API testing with Playwright | Testing backend APIs |
| [Visual Regression Testing](./skills/visual-regression-testing/) | Screenshot comparison patterns | Catching unintended UI changes |
| [Performance Testing](./skills/performance-testing/) | Web Vitals & load time testing | Measuring and asserting performance |
| [Error Handling](./skills/error-handling/) | Network errors, retries, graceful degradation | Handling failures in tests and testing app error states |
| [Debugging & Troubleshooting](./skills/debugging-troubleshooting/) | Inspector, traces, video analysis | Debugging flaky or failing tests |
| [Iframe Handling](./skills/iframe-handling/) | Working with iframes and nested frames | Testing embedded content, payment widgets |
| [Shadow DOM Handling](./skills/shadow-dom-handling/) | Interacting with web components, filtering shadow elements | Testing custom elements, design systems, component libraries |
| [Dialog Handling](./skills/dialog-handling/) | Browser alerts, prompts, modals | Handling browser dialogs and modal components |

## Setup

### 1. Install Pre-commit Hooks (Recommended)

Enforce code quality at commit time:

```bash
npm install --save-dev husky lint-staged @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-plugin-playwright
npx husky init
```

Copy configurations from [configs/](./configs/) to your project.

### 2. Install Skills in Your AI Tool

Follow the setup instructions in [Quick Start > For AI Assistants](#for-ai-assistants) above to install skills for your tool (Kiro IDE, Claude Code, or Amazon Q CLI).

### 3. Set Up ESLint + Prettier

```bash
# Copy config files to your project root
cp configs/eslint.config.js your-project/
cp configs/.prettierrc your-project/
cp configs/playwright.config.ts your-project/
```

## Documentation Structure

```
test-automation-skills/
├── README.md (you are here)
├── QUICK-START.md (5-minute setup guide)
├── HOW-TO-USE-WITH-AI.md (AI prompting guide)
├── skills/ (best practices by topic)
│   ├── playwright-best-practices/
│   ├── page-object-model/
│   ├── action-utilities/
│   ├── assertion-utilities/
│   ├── selector-strategies/
│   ├── migration-patterns/
│   ├── accessibility-testing/
│   ├── localization-testing/
│   ├── code-organization/
│   ├── api-testing/
│   ├── visual-regression-testing/
│   ├── performance-testing/
│   ├── error-handling/
│   ├── debugging-troubleshooting/
│   ├── iframe-handling/
│   ├── shadow-dom-handling/
│   └── dialog-handling/
├── templates/ (copy-paste starters)
│   ├── prompt-templates/
│   ├── test-templates/
│   └── migration-tracker/
├── configs/ (ESLint, Prettier, etc.)
├── docs/diagrams/ (architecture diagrams)
└── examples/ (good vs bad code)
```

## Migration Workflow

If you're migrating from another framework (Puppeteer, Selenium, Cypress, etc.):

1. Read [skills/migration-patterns/SKILL.md](./skills/migration-patterns/SKILL.md)
2. Use [templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md](./templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md)
3. Follow incremental migration checklist
4. Check for code reusability before creating new files

## Contributing

Team members can contribute new skills or improve existing ones:

1. Fork this repository
2. Add your skill in `skills/your-skill-name/`
3. Follow the SKILL.md template structure
4. Submit a pull request

## License

MIT License - Feel free to use and modify for your team.

## Architecture Diagrams

Visual learners can find ASCII architecture diagrams in [docs/diagrams/ARCHITECTURE.md](./docs/diagrams/ARCHITECTURE.md), including:
- Repository structure overview
- Skills dependency map
- Page Object Model architecture
- Domain-based folder organization
- Migration workflow
- Selector priority hierarchy
- Error handling flow

## Need Help?

- **Lost?** Start with [QUICK-START.md](./QUICK-START.md)
- **Migrating code?** See [skills/migration-patterns/](./skills/migration-patterns/)
- **Writing tests?** Check [skills/playwright-best-practices/](./skills/playwright-best-practices/)
- **Using AI tools?** Read [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md)

---

**Maintained by:** Your Team Name
**Last Updated:** February 2026
