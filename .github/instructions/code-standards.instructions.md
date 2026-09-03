---
description: 'Shared coding, commenting, documentation, and TypeScript formatting standards'
applyTo: '**/*'
---

# Coding Standards

## Comments

- Comment **why** code exists: capture intent, constraints, tradeoffs, or a non-obvious decision.
- Do not comment **what** the code does when its names and control flow already make that clear.
- Delete comments that only paraphrase the next statement.
- Treat stale comments as bugs. Update or remove related comments in the same change that changes the code.
- Prefer clearer names or a small refactor over a comment that compensates for hard-to-read code.

## API Documentation

- Every exported function in `db/` and `src/lib/` must have a TSDoc/JSDoc block that:
  - summarizes its purpose;
  - includes an `@param` tag for every parameter; and
  - includes an `@returns` tag describing the returned value, including meaningful nullability or ordering guarantees.
- For data-access helpers, document the injectable `db` parameter and why callers provide it, so the production and in-memory test usage remains clear.
- Every reusable `.astro` component must define a `Props` interface and document each property with a TSDoc/JSDoc comment. Describe the component contract or behavior rather than repeating the property's type.

## TypeScript Formatting

- Match the indentation established by the surrounding file and keep nested blocks consistent.
- Use single quotes for strings. Use template literals for interpolation, not as a replacement for ordinary strings.
- End statements and declarations with semicolons.
- Include trailing commas in multiline arrays, objects, parameter lists, and imports.
- Keep exported function parameter and return types explicit, especially in `db/` and `src/lib/`.
- Run ESLint after TypeScript or Astro changes. ESLint enforces quotes, semicolons, and multiline trailing commas; code review should verify consistent indentation, intent, and maintainability.
