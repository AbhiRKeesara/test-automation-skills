# Action Utilities

Implement the UIActions pattern to centralize all Playwright interactions into a single, expressive gateway.

## What You'll Learn

- How to build a centralized UIActions class for clicks, fills, and navigation
- Patterns for unified wait handling, retry logic, and error messages
- How to keep page objects focused on "what" while UIActions handles "how"
- Adding cross-cutting concerns like logging and screenshots in one place

## Quick Start

See [SKILL.md](./SKILL.md) for the full guide. Review the **Core Architecture** diagram to understand how UIActions fits between tests and page objects.

## Related Skills

- [Page Object Model](../page-object-model/SKILL.md) - Page objects that delegate to UIActions
- [Assertion Utilities](../assertion-utilities/SKILL.md) - Companion pattern for centralized assertions
- [Error Handling](../error-handling/SKILL.md) - Strategies for handling failures in action utilities
