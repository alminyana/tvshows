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

The **visual redesign is complete** (design/visual only, no business logic changes): tokens-first overhaul of elevation, typography and themes, 4 new themes, primitives/views/form restyling, and an a11y + responsive closing pass. See `docs/IMPLEMENTATION-PLAN-Design.md` and the redesign status below.

Two follow-up passes build on that foundation: **D7** reworked the `/series` view (poster-first cards, a new **mosaic** density, filters out of the accordion, and a single categorical palette `--cat-1..5` shared by genre chips and KPI accents), and **D8** reworked the series form (five icon-led sections plus contextual help on the four fields that do something non-obvious). See their entries below.

## Visual redesign (complete — D0–D6)

Design-only effort, tokens-first. Plan: `@docs/IMPLEMENTATION-PLAN-Design.md`. Visual contract: `@docs/design/mockup-D1.html`.

Status:
- **D0 — Skill `design-system`:** ✅ installed in `.claude/skills/design-system/`.
- **D1 — Validation mockup:** ✅ approved (8 themes × 2 modes = 16 combos). Locked decisions: new tokens `--color-accent` and `--color-tertiary`; categorical palette **derived** from theme tokens, used **only in data/decorative areas** (genre chips, charts, poster gradients); elevation layer `--color-surface-elevated`; `--focus-ring`; `--shadow-lg`; medium tint on light mode for the 4 new themes; the 4 original themes stay neutral in light. **Superseded in D7:** `sunset` and `forest` became multi-hue, and the categorical palette is no longer read off `accent`/`tertiary` — see D7.
- **D2 — Tokens + themes foundation:** ✅ done. `_tokens.scss` restructured with 16 blocks (8 themes × 2 modes); new tokens `--color-surface-elevated`, `--color-accent`, `--color-tertiary`, contrasts, `--focus-ring`, `--shadow-lg`; 4 new multi-hue themes registered across `VALID_THEMES`, `ThemeContext`, `messages.ts`, `Header`. `/showcase` shows 16 combos.
- **D3 — Primitives (restyle):** ✅ done. `Button`/`Input`/`Textarea`/`Select`/`Card`/`Rating`/`Tag`/`IconButton` consuming `--color-surface-elevated`, `--focus-ring`, `--shadow-lg`; new `components/ui/FileInput/` (hidden native input + styled `Button` trigger) wired into `SeriesForm`. `FormField`/`Spinner`/`Avatar` already tokens-first.
- **D4 — Views:** ✅ done. `SeriesCard`/`SeriesRow` elevated (real shadows, tinted-border hover on row, `--focus-ring`), primary→accent→tertiary gradient on cover placeholders, genre chips deduplicated and recolored via the `Tag` primitive with a rotating categorical color (new `src/utils/categoricalPalette.ts`; **the palette's slots were redefined in D7**). `SeriesDetailPage` groups year/seasons/rating/genres in a bordered `.metaCard`; reinforced title→meta→synopsis hierarchy. `DashboardPage`/`ShowcasePage` KPI accents moved from hardcoded hex to theme tokens. `Header` focus unified to `--focus-ring`. Also fixed a D3 regression: `Card` base background was wrongly `--color-surface-elevated`, reverted to `--color-surface` per the frozen `mockup-D1.html` contract.
- **D5 — Series form (fieldsets):** ✅ done. `SeriesForm` grouped into 5 `fieldset`/`legend` sections (Cover, Basics, Classification, Rating, Opinion; cast grouped under Classification per user decision), styled per the `.fset`/`.fset > legend` pattern in `mockup-D1.html`. No RHF/Zod or `name` changes; legends centralized in `MESSAGES.series.sections`. **Regrouped in D8** — «Classification» is gone.
- **D6 — a11y + responsive + cierre:** ✅ done. **The visual redesign (D0–D6) is complete.** Remaining hardcoded `outline` focus rules migrated to `--focus-ring`; a programmatic AA contrast audit over all 16 `_tokens.scss` blocks found and fixed 9 failing text/UI pairs (white→black `*-contrast` on several light-mode brand colors, 3 recalibrated `--color-text-muted`) without touching brand hues — `--color-border` vs `--color-surface` (~1.2–2:1) kept as-is, decorative border, explicit user decision. `SeriesForm`'s ad-hoc `max-width: 600px` media queries normalized to the shared mobile-first `@include tablet` mixin. Lint/`tsc -b`/`build`/tests all green.

### D7 — `/series` redesign (poster-first + mosaic)

Follow-up to D0–D6, same tokens-first rules. Visual proposal approved on a design canvas before implementing.

- **Three view modes.** `ViewMode` is now `'cards' | 'mosaic' | 'list'`, persisted by `useSeriesViewMode` (additive — existing `cards`/`list` values in localStorage still resolve).
- **`SeriesCard` has a `variant` prop** (`'card'` default, `'mosaic'`). Cover went from `3/4` to **`2/3`**; the data block stays **below** the cover on `--color-surface` (an overlay version was built and explicitly rejected). `mosaic` is the only place data sits *on* the image, over a bottom gradient, and it renders title + numeric rating only.
- **Filters left the accordion.** `Collapsible` was **deleted** (no other consumer); search and the two selects live in an always-visible bar, with a result count and one dismissable chip per active filter. State still lives in query params (`?q=`, `?genre=`, `?rating=`), so a chip just clears its key.
- **`SeriesRow` hover** is now a left accent stripe via `::before` (the `KPICard` pattern) instead of a tinted border.
- **Themes.** `sunset` and `forest` got real `--color-accent`/`--color-tertiary` (they were clones of `primary`); the 4 multi-hue themes got a slightly deeper light `--color-bg` and darker light-mode accents. `default` and `ocean` are untouched by explicit user decision.
- **One categorical palette: `--cat-1..5`.** Five slots derived from the theme's `--color-primary` by rotating hue in 72° steps with `oklch(from …)`, so a single `:root` rule covers all 16 combos and guarantees 72° of separation everywhere. It replaced both the old name-based palette and the `--kpi-accent-*` ramp (folded in — they were two rotations doing the same job). Consumed via `categoricalColor(i)` → slot number → `Tag`, and directly as `var(--cat-N)` for KPI accents and the cover-placeholder gradient (`--cat-1 → --cat-3 → --cat-5`).
- **Layout.** `.root` uses `min-height: 100dvh` instead of `100%` (the percentage chain depends on `html/body/#root` and ignores mobile browser chrome).
- **Known open issue:** the `Tag` chip pair (text in `--tag-c` over a 15% tint of itself) does **not** reach AA 4.5:1 in light mode in *any* of the 8 themes, `default` and `ocean` included. It is pre-existing — the D6 audit did not cover that pair — and fixing it means raising the chip tint or giving chip text its own darker token. Not done; needs a decision.

### D8 — Series form (help + regrouping)

Follow-up to D5, same tokens-first rules. Visual proposal approved on a design canvas before implementing. Covers both `/series/new` and `/series/:id/edit`.

- **Five icon-led sections**, replacing D5's grouping: **Cover · Basics · Genres · Cast · Rating and opinion**. «Classification» is gone — it lumped Seasons, Genres and Cast under a generic label and buried the two fields that most need explaining. Seasons moved into Basics and Rating merged with Opinion, so five sections map onto the five `--cat-1..5` slots with no repeated hue. Each `legend` carries an inline SVG icon in a 14%-tinted square (the `KPICard` icon treatment); icons live in `SeriesForm/icons.tsx`, following the `dashboard/icons.tsx` pattern.
- **New primitive `ui/HelpPopover`.** Opens **on click**, never hover — a hover tooltip is unreachable on touch, which is exactly where these fields confuse most. Closes on Escape, on its × and on outside click (listeners subscribed only while open, as in `Modal`/`Header`), returning focus to the trigger. `FormField` gained a `help?: ReactNode` slot and a `.labelRow` anchor; the control points at the panel with `aria-describedby`. On mobile the panel anchors to `.labelRow` to span the field; from tablet it anchors to the button itself.
- **Four fields carry help**: cover (accepts a direct paste), seasons, genres and cast. The **seasons** copy is written from `classifySeasons.ts` and explains its regex — it looks for the word «miniserie» or a number *adjacent* to «temporada»/«season», which is why «1 temporada - 8 episodios» classifies on the 1, not the 8.
- **The trap the help exists for:** a genre chip's **×** does *not* remove it from the series — it opens a `ConfirmDialog` that deletes the genre from the whole catalogue and from every other series. Nothing announced that before the dialog was already open; now the genres help says so up front.
- **Spacing.** `FormField`'s label→control gap went from `--space-1` to `--space-2` — a **global** change, so `LoginForm` breathes too. `SeriesForm`'s fieldset padding and gaps went to `--space-6`. Touch targets: help button 32px and chip/submit buttons 44px on mobile.
- **`ThemeToggle`** swapped the on/off lightbulb pair for **sun / crescent moon**, and both now take `--color-text-muted` from the active theme — the last hardcoded hex (`#b45309`) in the component is gone. The icon alone signals the state; the colour no longer needs to.
- **`default` light mode** deepened: `--color-bg` `#f3f4f6` → `#eaecf0`, with `--color-text-muted` `#69707d` → `#646b78` (the old value sat at 4.53:1, so the deeper background alone would have dropped it below AA) and `--color-border` `#e5e7eb` → `#dfe2e8` to keep card edges legible. Contrast audit re-run against `HEAD`: 47 pairs below AA before and after, **zero regressions**.
- **`GenrePieChart`** legend: now that the card owns a full dashboard row, the donut anchors left and the legend takes the remaining width with `repeat(auto-fit, minmax(190px, 1fr))` instead of fixed 7-row columns. Reading order changed from column-major to row-major.

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

- **Services layer is the only path to persistence.** Components/hooks never touch Supabase directly. They go through `seriesService`, `authService`, `imageService`, `genresService`. All methods return `Promise<T>`. A **mappers** layer (`services/mappers/`) translates snake_case (DB) ↔ camelCase (app) so column names never leak to consumers.
- **Two states, one role** — a **visitor** (no login, read-only, default; resolved with public-read RLS on `series`) and an **admin** (the only role that can log in: read + CRUD on all series). The `'user'` role was removed; `Role` is the literal `'admin'` and `canCreateSeries`/`canEditSeries`/`canDeleteSeries` (`src/utils/permissions.ts`) all mean "there is a session". `/series/new` and `/series/:id/edit` sit behind `<ProtectedRoute>`, which redirects to the public `/series` when there is no session. **Login lives in the header** (button → `LoginModal`); there is no `/login` route and no user-management screen — accounts are created with `scripts/create-user.ts`. Session and role handled by **Supabase Auth** + a `profiles` table, whose `role` column is pinned to `'admin'` by migration `20260801120000_single_admin_role.sql`.
- **Theming** uses CSS variables with semantic tokens (`--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-primary`, `--color-accent`, `--color-tertiary`, `--color-border`, `--focus-ring`, …) selected via `[data-theme="..."][data-mode="..."]`. **8 themes × light/dark = 16 combinations** — the 4 original (`default`, `ocean`, `sunset`, `forest`) plus 4 new multi-hue themes (`amatista`, `carmesi`, `cian`, `crepusculo`) introduced in the redesign (D2). Since D7 only `default` and `ocean` stay mono-hue (their `--color-accent`/`--color-tertiary` are clones of `primary`); `sunset` and `forest` are multi-hue like the 4 new ones. `ThemeContext` owns `{ theme, mode }`; first render respects `prefers-color-scheme`. UI preferences are the only thing persisted in localStorage. **The categorical palette is `--cat-1..5`**, five slots derived from each theme's `--color-primary` by 72° hue rotation (`oklch(from …)`) — one `:root` rule for all 16 combos; use it for chips, charts, KPI accents and decorative gradients via `categoricalColor(i)`/`var(--cat-N)`, never `accent`/`tertiary` directly. Controls (buttons/inputs/focus) stay on `primary`.
- **Cover images** live in the `covers` Storage bucket; the DB stores the path (`cover_image_path`), not the binary. `imageService` resolves `path → URL` for the `<img>`.
- **Genres** are a single catalog in the `genres` table, with an N:M relation to `series` via the `series_genres` join table.
- **Cast** is free text per series, stored as a `text[]` column `series.cast_members` (not a join table). The name avoids `cast`, a Postgres reserved word; the mapper exposes it as `cast: string[]`.
- **UI copy in Spanish, centralized in `/src/constants`** (e.g. `messages.ts`) to prepare for i18n migration. Variables/functions/components in English. Contextual help lives in `MESSAGES.series.help.*`, one key per paragraph.
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
