# CI/CD Integration

GitHub Actions setup, parallel execution, sharding, test filtering, artifact management, and pipeline optimization for Playwright tests.

## What's Inside

- **GitHub Actions** — basic workflow, env vars, secrets
- **Sharding** — split tests across multiple CI machines with merged reports
- **Test filtering** — run only changed files on PR, tag-based execution (`@smoke`, `@regression`)
- **Caching** — cache Playwright browsers for faster runs
- **Docker** — containerized test execution with `docker-compose`
- **Artifacts** — upload reports, traces, screenshots on failure
- **Nightly regression** — scheduled full browser matrix runs
- **Deploy preview testing** — test against Vercel/Netlify preview URLs
- **Flaky test management** — retries, detection, tracking
- **Performance tips** — fewer browsers on PR, full matrix on main

## Quick Start

Reference this skill in your AI prompt:
```
Using the ci-cd-integration skill, set up GitHub Actions for Playwright with sharding.
```

## See Also

- [SKILL.md](./SKILL.md) — Full skill definition
- [Test Fixtures & Setup](../test-fixtures-setup/) — Setup projects, global setup
- [Authentication Testing](../authentication-testing/) — Auth in CI pipelines
- [Debugging & Troubleshooting](../debugging-troubleshooting/) — Debugging CI failures
