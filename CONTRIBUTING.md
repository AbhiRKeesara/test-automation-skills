# Contributing to Test Automation Skills

Thank you for your interest in improving our test automation skills repository! This guide will help you contribute effectively.

## How to Contribute

### 1. Adding a New Skill

If you've discovered a best practice or pattern that should be shared:

1. **Create a new folder** in `skills/`:
   ```
   skills/your-skill-name/
   ├── SKILL.md (main documentation)
   ├── examples/ (code examples)
   └── patterns/ (reusable patterns)
   ```

2. **Follow the SKILL.md template:**
   - Clear title and description
   - Table of contents
   - Good vs bad examples
   - Code snippets with comments
   - Related resources section

3. **Update the main README** to include your new skill in the table

### 2. Improving Existing Skills

Found a better way to do something? Great!

1. **Fork the repository**
2. **Make your changes** to the relevant SKILL.md
3. **Add examples** if demonstrating a new pattern
4. **Submit a pull request** with:
   - Clear description of what you improved
   - Why it's better than the current approach
   - Any breaking changes (if applicable)

### 3. Adding Prompt Templates

Created a useful prompt for AI assistants?

1. Add it to `templates/prompt-templates/`
2. Include:
   - Clear use case
   - Example usage
   - Expected outcome

### 4. Sharing Real-World Examples

Encountered a tricky scenario and solved it elegantly?

1. Add to `examples/good-practices/` or `skills/[relevant-skill]/examples/`
2. Include:
   - The problem you were solving
   - Why your solution is good
   - What anti-patterns it avoids

## Contribution Guidelines

### Content Quality

- ✅ **Clear and concise** - Explain concepts simply
- ✅ **Practical examples** - Show real code, not pseudocode
- ✅ **Explain the why** - Don't just show what, explain why
- ✅ **Good vs bad** - Contrast patterns when helpful
- ✅ **Tested patterns** - Only share patterns you've actually used

### Code Style

- Follow existing formatting (Prettier config)
- Use TypeScript for all code examples
- Include comments explaining business logic
- Follow naming conventions in the code-organization skill

### Documentation Style

- Use Markdown formatting consistently
- Include code blocks with proper syntax highlighting
- Link to related skills and resources
- Keep language clear and professional

## Review Process

1. **Self-review** your changes before submitting
2. **Check for duplicates** - is this covered elsewhere?
3. **Test code examples** - ensure they actually work
4. **Update related docs** if your change affects other skills

## Getting Help

- **Questions?** Open an issue with the "question" label
- **Unsure?** Start a discussion in the repository
- **Need review?** Tag team leads in your pull request

## Recognition

Contributors will be acknowledged in:
- The repository README
- Release notes
- Team meetings (if applicable)

## Code of Conduct

- Be respectful and constructive
- Focus on the content, not the person
- Assume good intent
- Help others learn and grow

## Quick Checklist for Pull Requests

Before submitting a PR, ensure:

- [ ] Changes follow existing patterns and style
- [ ] Code examples are tested and work
- [ ] Documentation is clear and well-formatted
- [ ] Related files are updated (README, indexes, etc.)
- [ ] No sensitive information (passwords, API keys, etc.)
- [ ] Commit messages are descriptive
- [ ] PR description explains what and why

## Examples of Good Contributions

### Example 1: New Skill
```
Added "Visual Regression Testing" skill

- Comprehensive guide to visual testing with Playwright
- Examples using screenshot comparison
- Integration with CI/CD pipelines
- Best practices for handling flaky visual tests
```

### Example 2: Improved Pattern
```
Improved selector strategy for dynamic content

- Added pattern for handling dynamically generated IDs
- Updated examples with real-world scenario
- Added decision tree for selector choice
```

### Example 3: New Prompt Template
```
Added prompt template for API testing setup

- Template helps set up API testing with Playwright
- Includes authentication patterns
- Examples for common REST operations
```

---

**Thank you for helping make our test automation better for everyone!** 🚀
