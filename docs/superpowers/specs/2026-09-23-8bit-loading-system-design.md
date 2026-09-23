# Ascend Core 8bit Loading System Design

## Goal

Give every Ascend Core navigation and pending-data state an intentional retro
presentation without making ordinary fast navigation feel slower. The system
will use the requested 8bitcn blocks while preserving existing route behavior.

## Decisions

- The global `not-found.tsx` will use `@8bitcn/not-found-brick-breaker`.
  It will expose a history-aware Back action plus a safe Return to Landing
  action; it must not assume a visitor has dashboard access.
- The global `loading.tsx` will use `@8bitcn/loading-screen`. It is a fallback
  for actual App Router suspense, not a forced overlay for every link click.
- Dashboard content uses skeletons rather than a full-screen loader once the
  dashboard shell is visible. Skeletons preserve the shape of the destination
  so layout does not jump when client data resolves.
- `@8bitcn/spinner` will provide the diamond spinner for discrete pending work:
  submit, save, refresh, purchase, forge, claim, battle, and AI generation.
  It is not used as a substitute for a route skeleton.
- A reusable route-skeleton renderer will consume a typed route preset map.
  This avoids copy-pasting loaders while making each route visually distinct
  through its own label, panel arrangement, counts, and accent color.
- Existing local loading/error behavior stays intact unless it duplicates an
  equivalent spinner or skeleton. No fetch, auth, or mutation semantics change.

## Architecture

### Block installation and adapters

Install the requested registry blocks with shadcn:

```text
@8bitcn/not-found-brick-breaker
@8bitcn/loading-screen
@8bitcn/skeleton
@8bitcn/spinner
```

Wrap their public APIs in small Ascend Core adapters. Adapters provide labels,
palette, accessibility text, and navigation callbacks without modifying
registry component source. The route skeleton renderer and diamond-spinner
adapter live in a dedicated loading UI module, leaving page components focused
on data and actions.

### Route transition behavior

1. A navigation that suspends before a route shell renders shows the global
   loading screen.
2. A dashboard navigation keeps the shell visible and renders the matching
   skeleton in the main content area.
3. Client-side `useEffect` fetches replace only their content region with the
   matching skeleton. They do not trigger a full-page overlay.
4. An action initiated by the user disables only its own control and shows the
   diamond spinner with an accessible pending label.
5. Failed routes continue to use existing `error.tsx`; a missing route uses the
   brick-breaker 404.

## Route Presets

| Route | Preset | Loading treatment |
| --- | --- | --- |
| `/` | gateway | Global loading screen only |
| `/landing` | landing | Global loading screen only |
| `/privacy`, `/terms`, `/refund` | document | Global loading screen only |
| `/login`, `/register`, `/guest`, `/unauthorized` | auth | Global route loading; diamond spinner for auth and guest actions |
| `/dashboard` | command-hud | Telemetry cards, mission queue, boss panel skeleton |
| `/missions` | quest-list | Quest list skeleton; diamond spinner for status changes |
| `/missions/create` | quest-editor | Form and directive-panel skeleton; diamond spinner on create |
| `/habits` | habit-grid | Habit card grid skeleton |
| `/habits/[id]` | habit-detail | Detail header, streak rail, history blocks |
| `/habits/create` | habit-wizard | Stepper and form blocks; diamond spinner on save |
| `/calendar` | calendar-grid | Month matrix and schedule rail; diamond spinner for edits |
| `/profile` | hunter-sheet | Identity sheet and equipment summary |
| `/profile/stats` | stat-bars | Attribute bars and comparison cards |
| `/profile/history` | history-timeline | Timeline rows and event cards |
| `/profile/skills` | profile-skills | Skill graph nodes and stat rail |
| `/profile/customize` | appearance | Avatar preview and customization panels |
| `/workouts` | training-session | Exercise cards and volume rows |
| `/workouts/boss-pr` | benchmark-table | Personal-record benchmarks and rank bars |
| `/sleep` | recovery | Recovery timeline and sleep-summary cards |
| `/learning` | focus-library | Library shelf and focus-session cards |
| `/skills` | skill-tree | Tree nodes and talent details |
| `/tower` | tower-floors | Floor list, gate card, and reward slots |
| `/bosses` | raid-board | Boss cards, health bars, and raid panel |
| `/inventory` | equipment-grid | Equipment slots and inventory grid |
| `/crafting` | forge | Recipe slots, ingredient grid, forge output |
| `/shop` | merchant | Merchant shelf and item cards |
| `/beasts`, `/beasts-and-pets` | stable | Beast cards and incubator bays |
| `/aira` | command-console | Message rows, prompt area, command history |
| `/achievements` | medal-cabinet | Medal grid and completion bands |
| `/automations` | automation-rules | Rule table and connection-status cards |
| `/analytics` | telemetry | Chart frames, KPI cards, and activity feed |
| `/season-pass` | reward-track | Level rail and reward claims |
| `/character` | character-sheet | Hunter sheet, attributes, and equipment blocks |
| `/editor` | studio | Canvas, layers rail, and inspector blocks |
| `/settings` | preferences | Settings rows, toggles, and security panels |

## File Scope

- Update `client/src/app/not-found.tsx` and `client/src/app/loading.tsx`.
- Update `client/src/app/(dashboard)/loading.tsx`.
- Add route-level loading entries only where the App Router can use them without
  replacing a more accurate client-data skeleton.
- Add shared loading adapters and typed route presets under `client/src/components`.
- Update only page/component locations that already own an asynchronous state to
  replace an existing generic spinner or skeleton with the matching adapter.
- Do not touch the landing hero, landing/login font scopes, global typography,
  API contracts, auth rules, or data-store semantics.

## Accessibility and Motion

- Every full-screen and route-level loader announces a concise `role="status"`
  message and uses `aria-live="polite"`.
- The diamond spinner is decorative when paired with visible pending text; it is
  otherwise labelled.
- Skeletons use `aria-hidden="true"` while their container provides loading
  status.
- Respect `prefers-reduced-motion` by stopping nonessential looping animation.

## Verification

- Browser checks: global 404, root loader, dashboard loader, and representative
  skeletons from every route family at desktop and mobile widths.
- Interaction checks: each representative action disables only itself and shows
  the diamond spinner; route content remains accessible after resolution.
- Regression checks: no horizontal overflow, no hidden focusable controls, no
  global font or palette leakage into landing/login.
- Run TypeScript, ESLint, unit tests, and production build.
