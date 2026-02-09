# Authentication Testing

Storage state reuse, 2FA/TOTP, multi-role auth, session management, OAuth flows, and secure credential handling in Playwright.

## What's Inside

- **Storage state pattern** — authenticate once, reuse everywhere
- **Multi-role auth** — admin, editor, viewer with separate state files
- **2FA/TOTP testing** — generate TOTP codes with `otplib`
- **API-based auth** — skip UI login for speed
- **OAuth/SSO mocking** — intercept OAuth flows with `page.route()`
- **Session management** — expiry, timeout, logout testing
- **Credential management** — environment variables, `.gitignore` patterns
- **Anti-patterns** — UI login in every test, shared state, hardcoded tokens

## Quick Start

Reference this skill in your AI prompt:
```
Using the authentication-testing skill, set up storage state for multi-role auth.
```

## See Also

- [SKILL.md](./SKILL.md) — Full skill definition
- [Test Fixtures & Setup](../test-fixtures-setup/) — Custom fixtures, `test.extend()`
- [Error Handling](../error-handling/) — Handle auth failures gracefully
- [CI/CD Integration](../ci-cd-integration/) — Secrets management in pipelines
