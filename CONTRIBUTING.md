# Contributing to Markly

Welcome! Thank you for your interest in contributing to **Markly**. This document outlines guidelines and best practices to ensure the codebase remains clean, maintainable, and scalable.

> Private project — contributors only.

---

## General Principles

- **Modularity:** Every function should fit within **one screen/page** whenever possible. Keep things small and focused.  
- **Separation of Concerns:** Organize code into clear modules: `handlers`, `database`, `models`, `services`, etc.  
- **Readability:** Code should be easy for any contributor to understand at a glance.
- **Consistency:** Follow established formatting and style guides for Go and Next.js.

---

## Code Style & Formatting

### Go
- Use `gofmt` or `goimports` to automatically format Go code.  
- All Go code must follow [Effective Go](https://golang.org/doc/effective_go.html) guidelines.  
- Suggested command to format Go files:
```bash
gofmt -w .
goimports -w .
```

### Next.js / TypeScript
- Use **Prettier** as the default formatter.  
- Recommended commands:
```bash
npm install --save-dev prettier
npx prettier --write .
```
- Follow consistent naming conventions and file organization.

---

## Branching & Commits

- Use **feature branches**: `feature/<name>` for new features, `bugfix/<name>` for fixes.  
- Write clear commit messages: `<type>(<scope>): <description>` (e.g., `feat(bookmarks): add tag filtering`).  
- Always pull the latest main branch before creating a PR.

---

## Pull Requests

- PRs should reference the related issue.  
- Include a concise description of what the PR changes and why.  
- Ensure all tests pass before merging.  
- Keep PRs small and focused; large refactors should be split into multiple PRs.

---

## Testing

- Write unit tests for backend and frontend functionality.  
- Run all existing tests before submitting a PR:  
```bash
# Backend
go test ./...

# Frontend
npm test
```
- Tests should be isolated, reproducible, and easy to understand.

---

## Folder & File Structure

**Backend (`/backend/markly`):**
- `cmd/` – main entry points
- `internal/` – modular packages (handlers, models, database, services)
- `Makefile` – commands for building, running, testing

**Frontend (`/client`):**
- `src/` – pages, components, utilities
- `public/` – static assets
- Keep components modular; one component per file.

---

## Additional Tips

- Comment complex logic where necessary, but don’t over-comment obvious code.  
- Favor clear variable and function names over long comments.  
- Break large functions into smaller sub-functions if they exceed a screen.  
- Ask questions or propose improvements in PR discussions when in doubt.

---

By following these guidelines, Markly will remain maintainable, modular, and easy to scale as our team grows.