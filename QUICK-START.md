# Quick Start Guide

Get up and running with test automation best practices in 5 minutes.

## Step 1: Understand the Structure (1 min)

This repository contains **skills** - structured best practices that both humans and AI can follow:

- **Skills** = Best practice guides for specific topics
- **Templates** = Copy-paste starter code
- **Configs** = ESLint, Prettier, TypeScript configurations
- **Examples** = Good vs bad code comparisons

## Step 2: Choose Your Path (1 min)

### I'm Writing New Tests
→ Go to [skills/playwright-best-practices/SKILL.md](./skills/playwright-best-practices/SKILL.md)

### I'm Migrating from Another Framework
→ Go to [skills/migration-patterns/MIGRATION-STRATEGY.md](./skills/migration-patterns/MIGRATION-STRATEGY.md)

### I Need Better Selectors
→ Go to [skills/selector-strategies/SKILL.md](./skills/selector-strategies/SKILL.md)

### I'm Using Kiro IDE or Amazon Q
→ Go to [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md)

## Step 3: Set Up Quality Checks (3 min)

### Install Dependencies

```bash
npm install --save-dev \
  husky \
  lint-staged \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  eslint-plugin-playwright
```

### Copy Config Files

```bash
# From this repo to your test project
cp configs/eslint.config.js your-project/
cp configs/.prettierrc your-project/
cp configs/playwright.config.ts your-project/
cp configs/package.json.example your-project/package.json
```

### Initialize Git Hooks

```bash
cd your-project
npx husky init
cp ../test-automation-skills/.husky/pre-commit .husky/
```

## Step 4: Start Coding! ✨

### Using AI Tools

```
Using the playwright-best-practices skill:

Create a test for user login with email and password.
Include accessibility checks.
```

### Using Templates

Copy from [templates/test-templates/](./templates/test-templates/) and modify for your use case.

## Next Steps

- Read [HOW-TO-USE-WITH-AI.md](./HOW-TO-USE-WITH-AI.md) for advanced AI prompts
- Browse [examples/](./examples/) to see good vs bad patterns
- Check [skills/](./skills/) for specific topics

## Common Questions

**Q: Do I need to read everything?**  
A: No! Start with one skill relevant to your current task.

**Q: Can I modify the configs?**  
A: Yes! These are starting points. Adapt to your team's needs.

**Q: How do I know if my code follows best practices?**  
A: Run `npm run lint` and `npm run format:check` (if you set up the configs).

**Q: What if I'm stuck?**  
A: Check the [troubleshooting section in each skill's README](./skills/).

---

**Time to first test:** ~5 minutes  
**Time to mastery:** Ongoing (reference as needed)
