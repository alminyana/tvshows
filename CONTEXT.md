# CONTEXT.md

## Claude instructions
- Always reply in Spanish
- No preambles or closing summaries
- Give me your direct opinion, not the neutral version
- Ask before assuming when in doubt (technical, stack, software design, conventions)

---

# Project Overview
SPA built with React 19 + Vite + TypeScript to manage information about the user's favorite TV shows. Supports creating, listing, editing and removing series, plus a dashboard with metrics. The app must be visually attractive, intuitive, fully responsive and themable (multiple color themes with light/dark mode).

Phase 1 was frontend-only (IndexedDB + localStorage). **Phase 2 (Supabase migration) is essentially complete:** Dexie/IndexedDB has been removed and all business-data persistence now goes through Supabase (Postgres + Auth + Storage + RLS). Only optional F7 tasks remain (heartbeat done and verified; periodic backups and deploy deferred to a later phase). Hosting comes later.

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Package manager:** pnpm (not npm, not yarn)
- **Routing:** React Router v6
- **Styling:** SASS (component-scoped) + CSS variables for theming
- **Forms & validation:** React Hook Form + Zod
- **Charts:** Recharts
- **Persistence:** Supabase (Postgres + Auth + Storage + RLS) for business data; localStorage only for UI preferences (theme, view mode)
- **Testing:** Vitest + React Testing Library

## Project Structure
Component-based architecture. Each component has its own folder with component file, styles and tests.

```
src/
  components/
    ui/          # Pure presentational components (Button, Input, Card...)
    features/    # Components with business logic (SeriesForm, SeriesList...)
    layout/      # Header, Sidebar, Layout
  pages/         # One per route (Dashboard, SeriesList, SeriesDetail, Login...)
  hooks/         # Custom hooks, prefixed with `use`
  services/      # Data layer (stable public API + Supabase impl + mappers/)
  context/       # AuthContext, ThemeContext
  types/
  utils/
  constants/     # UI strings (preparation for future i18n)
  styles/        # Variables, mixins, reset, theme tokens
  lib/           # Supabase singleton client
```
> `supabase/migrations/` (outside `src/`) holds the versioned schema + RLS + Storage; `scripts/` holds Node utilities (data migration, user creation, heartbeat).

## Code Style & Conventions
- Functional components with hooks, no class components
- Components in PascalCase, one component per file
- Props typed with TypeScript `interface` (use `type` only when `interface` doesn't fit)
- No `any`. No `@ts-ignore` without a justifying comment
- SASS styles scoped per component (no global styles except variables, reset and theme tokens)
- Comments only when the logic is not evident, max 2-3 lines
- Descriptive naming in English for variables, functions and components
- UI copy in Spanish, centralized in `/src/constants` to ease future i18n migration
- Absolute imports from `@/` or relative, following standard practices
- SPA must be responsive for web, tablet and mobile
- Follow standard frontend best practices and software architecture principles

## Testing
- Unit tests with Vitest and React Testing Library
- Every component should have its corresponding test file
- Test behavior, not implementation details

## Current State
- Phase 1 fully implemented; Phase 2 (Supabase migration) essentially complete — F0–F7 (heartbeat) done
- Remaining: optional F7 periodic backups + deploy (treated as a separate phase)

## Don'ts
- Do not suggest external libraries without asking first
- Do not rewrite code outside the requested scope
- Do not use `useEffect` for logic that can live in the render
- Do not assume browser APIs are available without verifying SSR compatibility
- Do not give the "safe, opinion-less" version — ask first

## Git Rules
- Use conventional commits: `type(scope): description`
- Never use `git add -A`, stage files individually
- Always run the linter before committing
- Never push directly to main, use feature branches
- PR titles must be under 70 characters
- Include "Fixes #N" in commits when resolving issues
- Run Vitest tests before committing
- Use pnpm for all package operations. Never commit `package-lock.json` or `yarn.lock`; only `pnpm-lock.yaml`
