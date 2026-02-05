# Reusability Check Prompts

Copy-paste prompts for checking code reusability before creating new components.

## Prompt 1: Check for Existing Page Objects

```
Using the migration-patterns and code-organization skills:

Before creating a new page object for [page/component name]:

1. Search existing page objects in /page-objects/[domain]/
2. List any similar page objects found
3. Analyze if I can:
   - Reuse an existing page object
   - Extend an existing page object
   - Need to create a new one
4. If creating new, explain why existing ones don't fit

Context:
[Paste the page/component you're working with]
```

**Example:**
```
Using the migration-patterns and code-organization skills:

Before creating a new page object for the prescription refill confirmation page:

1. Search existing page objects in /page-objects/pharmacy/
2. List any similar page objects found
3. Analyze if I can:
   - Reuse an existing page object
   - Extend an existing page object
   - Need to create a new one
4. If creating new, explain why existing ones don't fit

Context:
I'm migrating a test that refills a prescription. The flow is:
- Search for prescription
- Click refill button
- Confirm refill in modal
- See success message
```

---

## Prompt 2: Check for Existing Utilities

```
Using the migration-patterns skill:

Before creating a new utility function for [functionality]:

1. Search /utils/[domain]/ for existing helpers
2. Check if similar functionality already exists
3. If exists, show me how to use it
4. If not, create a new helper following our patterns

Functionality needed:
[Describe what the utility needs to do]
```

**Example:**
```
Using the migration-patterns skill:

Before creating a new utility function for creating test prescriptions:

1. Search /utils/pharmacy/ for existing helpers
2. Check if similar functionality already exists
3. If exists, show me how to use it
4. If not, create a new helper following our patterns

Functionality needed:
Create a test prescription with specific medication, dosage, and refills remaining.
Should use API to create the prescription quickly.
```

---

## Prompt 3: Full Pre-Migration Analysis

```
Using the migration-patterns, playwright-best-practices, and code-organization skills:

I'm about to migrate this test:
[Paste test code]

Before migrating, perform complete analysis:

1. **Reusability Check:**
   - Search /page-objects/ for existing page objects
   - Search /utils/ for existing helpers
   - List what can be REUSED

2. **Domain & Location:**
   - Determine business domain
   - Suggest folder location
   - Suggest file name

3. **Migration Plan:**
   - Identify selectors to update
   - Identify waits to remove
   - List new components needed
   - Estimate complexity (Low/Medium/High)

4. **Business Logic:**
   - Explain what business rule this test validates
   - Note any edge cases

Then show me:
- Pre-migration checklist (completed)
- Migration plan
- Where this test should live
```

---

## Prompt 4: Check Migration Log for Similar Tests

```
Using the migration-patterns skill:

Review our migration log:
[Paste recent migration log entries]

I'm planning to migrate: [test name/description]

Questions:
1. Have we migrated any similar tests?
2. What page objects were created that I might reuse?
3. What utilities exist that I might need?
4. Any patterns I should follow from previous migrations?
```

---

## Prompt 5: Validate No Duplicates Created

```
Using the code-organization skill:

Review my migrated test and check for duplicates:

[Paste your migrated test code]

Check:
1. Are there existing page objects I should have reused?
2. Are there existing utilities I should have reused?
3. Did I create any duplicates?
4. Suggest refactoring if duplicates exist

Also review our existing code:
[Paste list of existing page objects and utilities]
```

---

## Prompt 6: Incremental Migration (Day N)

```
Using the migration-patterns skill:

**Previous Migration (Day N-1):**
[Paste yesterday's migration log entry]

**Today's Test to Migrate:**
[Paste test code]

Analysis needed:
1. What from yesterday's migration can I reuse today?
2. What's NEW that I need to create?
3. Where should this test live (same domain as yesterday)?
4. How can I maximize code reuse?

Show me:
- Reusability analysis
- Migration plan highlighting REUSED vs NEW
- Updated migration log entry
```

---

## Prompt 7: Extend vs Create Decision

```
Using the playwright-best-practices and code-organization skills:

I have an existing page object:
[Paste existing page object code]

I need to handle this new scenario:
[Describe new scenario]

Should I:
A) Extend the existing page object?
B) Create a new page object?
C) Add methods to existing page object?

Provide:
1. Recommendation with reasoning
2. Code example of the recommended approach
3. Trade-offs of each option
```

**Example:**
```
Using the playwright-best-practices and code-organization skills:

I have an existing page object:
```typescript
export class PrescriptionSearchPage {
  async searchByMedication(name: string) { ... }
  async searchById(id: string) { ... }
}
```

I need to handle this new scenario:
Searching prescriptions by date range

Should I:
A) Extend the existing page object?
B) Create a new page object?
C) Add methods to existing page object?

Provide:
1. Recommendation with reasoning
2. Code example of the recommended approach
3. Trade-offs of each option
```

---

## Prompt 8: Post-Migration Review

```
Using the migration-patterns and playwright-best-practices skills:

I just migrated a test. Review for quality and reusability:

**Migrated Test:**
[Paste migrated test code]

**Page Objects Created:**
[Paste page object code]

**Utilities Created:**
[Paste utility code]

Review:
1. Are there duplicates I created?
2. Is code properly reusable for future tests?
3. Does it follow best practices?
4. What should go in the migration log?
5. Any improvements needed?

Provide:
- Quality assessment
- Improvement suggestions
- Migration log entry
```

---

## Quick Reference

### When to Use Which Prompt

- **Before starting any migration** → Prompt 3 (Full Pre-Migration Analysis)
- **Before creating page object** → Prompt 1 (Check for Existing Page Objects)
- **Before creating utility** → Prompt 2 (Check for Existing Utilities)
- **Day-to-day incremental work** → Prompt 6 (Incremental Migration)
- **After migration** → Prompt 8 (Post-Migration Review)
- **When unsure about duplicates** → Prompt 5 (Validate No Duplicates)
- **When deciding extend vs create** → Prompt 7 (Extend vs Create Decision)
- **Reviewing past work** → Prompt 4 (Check Migration Log)

---

## Tips for Better Results

1. **Be specific** - Include actual code snippets
2. **Provide context** - Reference migration log when relevant
3. **Ask for explanations** - Understand WHY something should be reused
4. **Iterate** - If results aren't clear, refine your prompt
5. **Keep migration log updated** - Better log = better reusability checks
