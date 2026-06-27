# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions
Always read PROFILE.md, CONTEXT.md, and PRD-Phase-1.md before proposing any changes. In case of conflict: CONTEXT.md > PROFILE.md > PRD.

## Project Documentation
- Specification: docs/PRD-Phase-1.md
- Phase 1 implementation plan: docs/IMPLEMENTATION-PLAN.md
- Phase 2 (Supabase migration) plan: docs/IMPLEMENTATION-PLAN-Phase-2-Supabase.md
- Read the relevant ones before proposing any change.

## Communication

- Reply **in Spanish** always.
- No preambles, no closing summaries.
- Give a direct opinion + alternative, never the neutral list.
- The user is a senior frontend engineer (~15 years). Skip explaining basics (closures, event loop, box model, etc.) unless asked.
- Ask before assuming on tech, stack, software design or conventions.

## Project status

Personal SPA to manage favorite TV shows. The app is scaffolded and functional. **Phase 2 (Supabase migration) is essentially complete**: Dexie/IndexedDB has been removed and all persistence now goes through Supabase (Postgres + Auth + Storage + RLS). The optional F7 heartbeat is implemented, deployed and verified (GitHub Action + `heartbeat` table); only periodic backups and deploy remain, deferred to a later phase. See `docs/IMPLEMENTATION-PLAN-Phase-2-Supabase.md`.

## Stack (locked — do not swap without asking)

- React 19 + Vite + TypeScript
- **pnpm only** (never npm/yarn; only `pnpm-lock.yaml` is committed)
- React Router v6
- SASS scoped per component + CSS variables for theming
- React Hook Form + Zod
- Recharts
- Supabase (`@supabase/supabase-js` v2) for business data: Postgres + Auth + Storage + RLS. localStorage only for UI preferences (theme, view mode)
- Vitest + React Testing Library

## Architecture essentials

Read `PRD-Phase-1.md` for the full spec. Key invariants:

- **Services layer is the only path to persistence.** Components/hooks never touch Supabase directly. They go through `seriesService`, `usersService`, `authService`, `imageService`, `genresService`. All methods return `Promise<T>`. A **mappers** layer (`services/mappers/`) translates snake_case (DB) ↔ camelCase (app) so column names never leak to consumers.
- **Three roles** — Viewer (no login, read-only, default; resolved with public-read RLS on `series`), User (CRUD own series), Admin (CRUD all series + user management). Route protection via `<ProtectedRoute>` guard; session and roles handled by **Supabase Auth** + a `profiles` table.
- **Theming** uses CSS variables with semantic tokens (`--color-bg`, `--color-primary`, …) selected via `[data-theme="..."][data-mode="..."]`. 4 themes × light/dark = 8 combinations. `ThemeContext` owns `{ theme, mode }`; first render respects `prefers-color-scheme`. UI preferences are the only thing persisted in localStorage.
- **Cover images** live in the `covers` Storage bucket; the DB stores the path (`cover_image_path`), not the binary. `imageService` resolves `path → URL` for the `<img>`.
- **Genres** are a single catalog in the `genres` table, with an N:M relation to `series` via the `series_genres` join table.
- **UI copy in Spanish, centralized in `/src/constants`** (e.g. `messages.ts`) to prepare for i18n migration. Variables/functions/components in English.
- **Initial data** is created via the migration script (`scripts/migrate-to-supabase.ts`) + Supabase Auth admin API; there is no client-side seed.

## Folder layout (target)

```
src/
  components/{ui,features,layout}/   # ui = presentational only; features = with logic
  pages/                              # one per route
  hooks/                              # prefix `use`
  services/                           # stable public API, Supabase impl + mappers/
  context/                            # AuthContext, ThemeContext
  lib/                                # Supabase singleton client
  types/  utils/  constants/
  styles/                             # reset, variables, mixins, themes/
supabase/migrations/                  # versioned schema + RLS + Storage
scripts/                              # Node utilities (data migration, heartbeat)
```

## Code conventions

- Functional components only, one per file, PascalCase.
- Props with `interface` (use `type` only when `interface` doesn't fit).
- No `any`. No `@ts-ignore` without a justifying comment.
- Comments only when logic is non-obvious, 2–3 lines max.
- SASS scoped per component; global SASS limited to reset, variables, mixins, theme tokens.
- Absolute imports from `@/` or relative — follow standard practice.
- Every component ships with its `Component.test.tsx`. Test behavior, not implementation.

## Don'ts (from `CONTEXT.md` / `PROFILE.md`)

- Don't suggest or install external libraries without asking first.
- Don't touch code outside the requested scope.
- Don't use `useEffect` for logic that belongs in render — ask first.
- Don't assume browser APIs exist without checking SSR compatibility.
- Don't give the safe/opinion-less answer — ask if unsure.

## Git rules

- Conventional commits: `type(scope): description`.
- Stage files individually, never `git add -A`.
- Run lint and Vitest **before every commit**.
- Never push to `main`; use feature branches.
- PR titles under 70 characters. Include `Fixes #N` when closing issues.
- Commit only `pnpm-lock.yaml`; never `package-lock.json` / `yarn.lock`.
