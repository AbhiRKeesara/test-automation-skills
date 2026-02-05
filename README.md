# Test Automation Skills

A comprehensive collection of best practices, patterns, and guidelines for test automation that can be used by AI coding assistants (Kiro IDE, Amazon Q CLI) and human developers.

## 🎯 Purpose

This repository provides structured skills and patterns to:
- Maintain high code quality in test automation
- Enable AI assistants to write better test code
- Prevent common anti-patterns and technical debt
- Support incremental migration between testing frameworks
- Ensure consistency across team members

## 🚀 Quick Start

### For Team Members

1. **Clone this repository** to your local machine or reference it in your project
2. **Read the [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md)** guide for prompt templates
3. **Browse [skills/](./skills/)** to find relevant best practices
4. **Use [templates/](./templates/)** for quick-start code

### For AI Assistants (Kiro IDE / Amazon Q CLI)

Reference these skills in your prompts:
```
Using the playwright-best-practices skill, create a test for login functionality.
```

See [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md) for detailed prompt examples.

## 📚 Available Skills

| Skill | Description | Use When |
|-------|-------------|----------|
| [Playwright Best Practices](./skills/playwright-best-practices/) | Core patterns for Playwright + TypeScript | Writing new tests, refactoring existing ones |
| [Selector Strategies](./skills/selector-strategies/) | Resilient selector patterns | Finding elements, improving test stability |
| [Migration Patterns](./skills/migration-patterns/) | Framework migration guide | Moving from Puppeteer/Selenium to Playwright |
| [Accessibility Testing](./skills/accessibility-testing/) | A11y testing patterns | Adding accessibility checks |
| [Localization Testing](./skills/localization-testing/) | i18n/l10n testing approaches | Testing multi-language apps |
| [Code Organization](./skills/code-organization/) | Project structure & naming | Setting up new projects, reorganizing tests |

## 🛠️ Setup

### 1. Install Pre-commit Hooks (Recommended)

Enforce code quality at commit time:

```bash
npm install --save-dev husky lint-staged @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-plugin-playwright
npx husky init
```

Copy configurations from [configs/](./configs/) to your project.

### 2. Configure Your IDE

**For Kiro IDE:**
- Reference this repo in your workspace settings
- Use prompt templates from [templates/prompt-templates/](./templates/prompt-templates/)

**For Amazon Q CLI:**
- Include skill references in your prompts
- Use the migration tracker for incremental work

### 3. Set Up ESLint + Prettier

```bash
# Copy config files to your project root
cp configs/eslint.config.js your-project/
cp configs/.prettierrc your-project/
cp configs/playwright.config.ts your-project/
```

## 📖 Documentation Structure

```
test-automation-skills/
├── README.md (you are here)
├── QUICK-START.md (5-minute setup guide)
├── HOW-TO-USE-WITH-AI.md (AI prompting guide)
├── skills/ (best practices by topic)
│   ├── playwright-best-practices/
│   ├── selector-strategies/
│   ├── migration-patterns/
│   ├── accessibility-testing/
│   ├── localization-testing/
│   └── code-organization/
├── templates/ (copy-paste starters)
│   ├── prompt-templates/
│   ├── test-templates/
│   └── migration-tracker/
├── configs/ (ESLint, Prettier, etc.)
└── examples/ (good vs bad code)
```

## 🔄 Migration Workflow

If you're migrating from another framework (Puppeteer, Selenium, etc.):

1. Read [skills/migration-patterns/MIGRATION-STRATEGY.md](./skills/migration-patterns/MIGRATION-STRATEGY.md)
2. Use [templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md](./templates/migration-tracker/MIGRATION-LOG-TEMPLATE.md)
3. Follow incremental migration checklist
4. Check for code reusability before creating new files

## 🤝 Contributing

Team members can contribute new skills or improve existing ones:

1. Fork this repository
2. Add your skill in `skills/your-skill-name/`
3. Follow the SKILL.md template structure
4. Submit a pull request

## 📝 License

MIT License - Feel free to use and modify for your team.

## 🆘 Need Help?

- **Lost?** Start with [QUICK-START.md](./QUICK-START.md)
- **Migrating code?** See [skills/migration-patterns/](./skills/migration-patterns/)
- **Writing tests?** Check [skills/playwright-best-practices/](./skills/playwright-best-practices/)
- **Using AI tools?** Read [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md)

---

**Maintained by:** [Your Team Name]  
**Last Updated:** January 2026
