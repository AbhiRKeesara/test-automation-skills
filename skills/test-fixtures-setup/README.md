# Test Fixtures & Setup

Custom fixtures, `test.extend()`, setup/teardown projects, global setup, and test lifecycle management in Playwright.

## What's Inside

- **Custom fixtures** with `test.extend()` for reusable setup/teardown
- **Worker-scoped fixtures** for expensive shared state (auth tokens, databases)
- **Auto-fixtures** for tracing, logging, and screenshots
- **Setup projects** for auth state and database seeding
- **Global setup/teardown** for one-time environment prep
- **Test data factories** with Faker for realistic, unique test data
- **Fixture composition** and `mergeTests()` patterns
- **Anti-patterns** to avoid (global variables, skipped teardown, hardcoded data)

## Quick Start

Reference this skill in your AI prompt:
```
Using the test-fixtures-setup skill, create a custom fixture for [your use case].
```

## See Also

- [SKILL.md](./SKILL.md) — Full skill definition
- [Authentication Testing](../authentication-testing/) — Storage state, 2FA patterns
- [Page Object Model](../page-object-model/) — POM fixtures
- [CI/CD Integration](../ci-cd-integration/) — Setup projects in CI
