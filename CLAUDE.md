# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions
Always read PROFILE.md, CONTEXT.md, and PRD-Phase-1.md before proposing any changes. In case of conflict: CONTEXT.md > PROFILE.md > PRD.

## Project Documentation
- Specification: docs/PRD-Phase-1.md
- Implementation plan: docs/IMPLEMENTATION-PLAN.md
- Read both before proposing any change.

## Communication

- Reply **in Spanish** always.
- No preambles, no closing summaries.
- Give a direct opinion + alternative, never the neutral list.
- The user is a senior frontend engineer (~15 years). Skip explaining basics (closures, event loop, box model, etc.) unless asked.
- Ask before assuming on tech, stack, software design or conventions.

## Project status

Phase 1 of a personal SPA to manage favorite TV shows. Currently the repo contains only documentation (`CONTEXT.md`, `PROFILE.md`, `PRD-Phase-1.md`) — the React app has **not been scaffolded yet**. Confirm with the user before scaffolding.

## Stack (locked — do not swap without asking)

- React 19 + Vite + TypeScript
- **pnpm only** (never npm/yarn; only `pnpm-lock.yaml` is committed)
- React Router v6
- SASS scoped per component + CSS variables for theming
- React Hook Form + Zod
- Recharts
- Dexie (IndexedDB) for business data + localStorage for UI preferences
- Vitest + React Testing Library

## Architecture essentials

Read `PRD-Phase-1.md` for the full spec. Key invariants:

- **Services layer is the only path to persistence.** Components/hooks never touch Dexie directly. Service signatures (`seriesService`, `usersService`, `authService`, `imageService`) must stay stable so Phase 2 can swap the Dexie implementation for HTTP without touching consumers. All service methods return `Promise<T>` even when the underlying op is sync.
- **Three roles** — Viewer (no login, read-only, default), User (CRUD own series), Admin (CRUD all series + user management). Route protection via `<ProtectedRoute>` guard; session persisted in localStorage as a simulated token.
- **Theming** uses CSS variables with semantic tokens (`--color-bg`, `--color-primary`, …) selected via `[data-theme="..."][data-mode="..."]`. 4 themes × light/dark = 8 combinations. `ThemeContext` owns `{ theme, mode }`; first render respects `prefers-color-scheme`.
- **Images** are stored as Blobs in IndexedDB through `imageService`; `Series.coverImage` holds the blob id, not the binary.
- **UI copy in Spanish, centralized in `/src/constants`** (e.g. `messages.ts`) to prepare for i18n migration. Variables/functions/components in English.
- **Seed on first run**: if DB is empty, insert admin (`admin@local`/`admin`) and user (`user@local`/`user`).

## Folder layout (target)

```
src/
  components/{ui,features,layout}/   # ui = presentational only; features = with logic
  pages/                              # one per route
  hooks/                              # prefix `use`
  services/                           # stable public API, Dexie impl in Phase 1
  context/                            # AuthContext, ThemeContext
  types/  utils/  constants/
  styles/                             # reset, variables, mixins, themes/
  db/                                 # Dexie schema + seed
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
