# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instructions
Always read PROFILE.md, CONTEXT.md, and PRD-Phase-1.md before proposing any changes. In case of conflict: CONTEXT.md > PROFILE.md > PRD.

## Project Documentation
- Specification: docs/PRD-Phase-1.md
- Phase 1 implementation plan: docs/IMPLEMENTATION-PLAN.md
- Phase 2 (Supabase migration) plan: docs/IMPLEMENTATION-PLAN-Phase-2-Supabase.md
- **Visual redesign plan: docs/IMPLEMENTATION-PLAN-Design.md** (`@docs/IMPLEMENTATION-PLAN-Design.md`) — design-only, milestones D0–D6, tokens-first.
- **Visual contract (D1 snapshot): docs/design/mockup-D1.html** (`@docs/design/mockup-D1.html`) — frozen design decision. The **source of truth for tokens is `src/styles/themes/_tokens.scss`**, not the mockup.
- Read the relevant ones before proposing any change.

## Communication

- Reply **in Spanish** always.
- No preambles, no closing summaries.
- Give a direct opinion + alternative, never the neutral list.
- The user is a senior frontend engineer (~15 years). Skip explaining basics (closures, event loop, box model, etc.) unless asked.
- Ask before assuming on tech, stack, software design or conventions.

## Project status

Personal SPA to manage favorite TV shows. The app is scaffolded and functional. **Phase 2 (Supabase migration) is essentially complete**: Dexie/IndexedDB has been removed and all persistence now goes through Supabase (Postgres + Auth + Storage + RLS). The optional F7 heartbeat is implemented, deployed and verified (GitHub Action + `heartbeat` table); only periodic backups and deploy remain, deferred to a later phase. See `docs/IMPLEMENTATION-PLAN-Phase-2-Supabase.md`.

A **visual redesign is now in progress** (design/visual only, no business logic changes): tokens-first overhaul of elevation, typography and themes, plus 4 new themes and form/view restyling. See `docs/IMPLEMENTATION-PLAN-Design.md` and the redesign status below.

## Visual redesign (in progress)

Design-only effort, tokens-first. Plan: `@docs/IMPLEMENTATION-PLAN-Design.md`. Visual contract: `@docs/design/mockup-D1.html`.

Status:
- **D0 — Skill `design-system`:** ✅ installed in `.claude/skills/design-system/`.
- **D1 — Validation mockup:** ✅ approved (8 themes × 2 modes = 16 combos). Locked decisions: new tokens `--color-accent` and `--color-tertiary`; categorical palette **derived** from theme tokens, used **only in data/decorative areas** (genre chips, charts, poster gradients); elevation layer `--color-surface-elevated`; `--focus-ring`; `--shadow-lg`; medium tint on light mode for the 4 new themes; the 4 original themes stay neutral in light.
- **D2 — Tokens + themes foundation:** ✅ done. `_tokens.scss` restructured with 16 blocks (8 themes × 2 modes); new tokens `--color-surface-elevated`, `--color-accent`, `--color-tertiary`, contrasts, `--focus-ring`, `--shadow-lg`; 4 new multi-hue themes registered across `VALID_THEMES`, `ThemeContext`, `messages.ts`, `Header`. `/showcase` shows 16 combos.
- **D3 Primitives → D4 Views → D5 Series form (fieldsets) → D6 a11y/responsive:** pending. **D3 is next.**

## Skills

- **`design-system`** (in `.claude/skills/design-system/`): **use it whenever working on UI, styles, components, views, forms, themes or color palettes** — even if "design system" isn't mentioned explicitly. It encodes the real tokens, the `[data-theme][data-mode]` pattern, the CSS-modules conventions and the a11y rules. Before styling, consult its `references/` (`tokens`, `theming`, `scss-conventions`, `accessibility`). It enforces tokens-first (no hardcoded color/spacing/shadow in components), no new libraries without asking, SVG inline icons, UI copy in `constants`, scoped CSS-modules, and not testing CSS-modules class names.

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
- **Theming** uses CSS variables with semantic tokens (`--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-primary`, `--color-accent`, `--color-tertiary`, `--color-border`, `--focus-ring`, …) selected via `[data-theme="..."][data-mode="..."]`. **8 themes × light/dark = 16 combinations** — the 4 original (`default`, `ocean`, `sunset`, `forest`) plus 4 new multi-hue themes (`amatista`, `carmesi`, `cian`, `crepusculo`) introduced in the redesign (D2). In the 4 original themes `--color-accent`/`--color-tertiary` fall back to `primary` (they stay mono-hue). `ThemeContext` owns `{ theme, mode }`; first render respects `prefers-color-scheme`. UI preferences are the only thing persisted in localStorage. The categorical palette for chips/charts is derived from theme tokens; controls (buttons/inputs/focus) stay on `primary`.
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
.claude/skills/                       # project skills (design-system)
```

## Code conventions

- Functional components only, one per file, PascalCase.
- Props with `interface` (use `type` only when `interface` doesn't fit).
- No `any`. No `@ts-ignore` without a justifying comment.
- Comments only when logic is non-obvious, 2–3 lines max.
- SASS scoped per component; global SASS limited to reset, variables, mixins, theme tokens and utilities (`.sr-only`).
- Absolute imports from `@/` or relative — follow standard practice.
- Every component ships with its `Component.test.tsx`. Test behavior, not implementation. Do **not** test CSS-modules class names (hashed).

## Don'ts (from `CONTEXT.md` / `PROFILE.md`)

- Don't suggest or install external libraries without asking first.
- Don't touch code outside the requested scope.
- Don't use `useEffect` for logic that belongs in render — ask first.
- Don't assume browser APIs exist without checking SSR compatibility.
- Don't give the safe/opinion-less answer — ask if unsure.
- Don't hardcode color/spacing/shadow/typography in components — use tokens (see the `design-system` skill).

## Git rules

- Conventional commits: `type(scope): description`.
- Stage files individually, never `git add -A`.
- Run lint and Vitest **before every commit**.
- Never push to `main`; use feature branches.
- PR titles under 70 characters. Include `Fixes #N` when closing issues.
- Commit only `pnpm-lock.yaml`; never `package-lock.json` / `yarn.lock`.
