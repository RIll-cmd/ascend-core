# Ascend Core 8bit Loading System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved 8bitcn global 404, true suspense loader, unique dashboard skeletons, and diamond pending spinners without global typography or behavior changes.

**Architecture:** Install the four requested registry entries beneath the existing 8bit namespace. Put all app-specific behavior in adapters. Route-local loading boundaries choose an explicit type-safe skeleton preset, while existing client owners retain their fetch and mutation logic and exchange only visual loading UI.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn CLI, 8bitcn/ui, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-23-8bit-loading-system-design.md`

## Global Constraints

- Install exactly `@8bitcn/not-found-brick-breaker`, `@8bitcn/loading-screen`, `@8bitcn/skeleton`, and `@8bitcn/spinner` from `client/`.
- Use `Spinner variant="diamond"` only for user-initiated pending controls.
- The root loading screen is only an App Router suspense fallback: no artificial delay or transition overlay.
- No changes to API contracts, authentication, data stores, error boundaries, `globals.css`, root fonts, landing, or login styles.
- Announce loading state with `role="status"` and `aria-live="polite"`; hide skeleton geometry from assistive tech; use `motion-reduce:animate-none`.
- Preserve all existing uncommitted user work.

## Interfaces

Create `client/src/components/loading/AscendRouteSkeleton.tsx`:

```ts
export type LoadingPreset =
  | "command-hud" | "quest-list" | "quest-editor" | "habit-grid" | "habit-detail"
  | "habit-wizard" | "calendar-grid" | "hunter-sheet" | "stat-bars"
  | "history-timeline" | "profile-skills" | "appearance" | "training-session"
  | "benchmark-table" | "recovery" | "focus-library" | "skill-tree"
  | "tower-floors" | "raid-board" | "equipment-grid" | "forge" | "merchant"
  | "stable" | "command-console" | "medal-cabinet" | "automation-rules"
  | "telemetry" | "reward-track" | "character-sheet" | "studio" | "preferences";

export interface AscendRouteSkeletonProps {
  preset: LoadingPreset;
  label?: string;
  className?: string;
}
export const routeLoadingPresets: Record<string, LoadingPreset>;
export function AscendRouteSkeleton(props: AscendRouteSkeletonProps): React.JSX.Element;
```

Create `client/src/components/loading/AscendPendingSpinner.tsx`:

```ts
export interface AscendPendingSpinnerProps { label: string; className?: string; }
export function AscendPendingSpinner(props: AscendPendingSpinnerProps): React.JSX.Element;
```

Also create `AscendFullScreenLoading.tsx`, `AscendNotFound.tsx`, and `loadingPresets.test.ts` in the same folder. Registry components are in `client/src/components/ui/8bit/blocks/not-found-brick-breaker.tsx` and `client/src/components/ui/8bit/spinner.tsx`.

## Route Boundary Matrix

Create one `loading.tsx` in every destination directory below `client/src/app/(dashboard)/`. Each returns `<AscendRouteSkeleton preset="…" label="…" />`, has no store/API import, and does not add a font.

| Directory | Preset | Label |
| --- | --- | --- |
| dashboard | command-hud | Loading command HUD |
| missions | quest-list | Loading mission directives |
| missions/create | quest-editor | Preparing mission editor |
| habits | habit-grid | Loading habit matrix |
| habits/[id] | habit-detail | Loading habit record |
| habits/create | habit-wizard | Preparing habit forge |
| calendar | calendar-grid | Loading calendar matrix |
| profile | hunter-sheet | Loading hunter profile |
| profile/stats | stat-bars | Loading attribute telemetry |
| profile/history | history-timeline | Loading hunter history |
| profile/skills | profile-skills | Loading profile skills |
| profile/customize | appearance | Loading appearance forge |
| workouts | training-session | Loading training session |
| workouts/boss-pr | benchmark-table | Loading boss benchmarks |
| sleep | recovery | Loading recovery telemetry |
| learning | focus-library | Loading focus library |
| skills | skill-tree | Loading skill tree |
| tower | tower-floors | Loading tower floors |
| bosses | raid-board | Loading raid board |
| inventory | equipment-grid | Loading equipment inventory |
| crafting | forge | Preparing forge |
| shop | merchant | Loading merchant stock |
| beasts | stable | Loading beast stable |
| beasts-and-pets | stable | Loading companion stable |
| aira | command-console | Connecting AIRA console |
| achievements | medal-cabinet | Loading medal cabinet |
| automations | automation-rules | Loading automation rules |
| analytics | telemetry | Loading analytics telemetry |
| season-pass | reward-track | Loading reward track |
| character | character-sheet | Loading character sheet |
| editor | studio | Opening studio |
| settings | preferences | Loading preferences |

The existing `client/src/app/(dashboard)/loading.tsx` is the fallback and uses `command-hud`; root/public/auth/onboarding/v2 routes use the fullscreen root fallback.

## Tasks

### Task 1: Registry integration

**Files:**
- Create: `client/src/components/ui/8bit/blocks/not-found-brick-breaker.tsx`, `client/src/components/ui/8bit/spinner.tsx`
- Modify: `client/src/components/ui/8bit/blocks/loading-screen.tsx`, `client/src/components/ui/8bit/skeleton.tsx`, `client/src/components/ui/8bit/index.ts`

**Produces:** 8bitcn imports for the adapter layer.

- [ ] **Step 1: Confirm the pre-install state**

Run: `rg --files src/components/ui/8bit | rg "(not-found-brick-breaker|loading-screen|skeleton|spinner)"`

Expected: only loading-screen and skeleton currently exist.

- [ ] **Step 2: Install requested components**

Run: `pnpm dlx shadcn@latest add @8bitcn/not-found-brick-breaker @8bitcn/loading-screen @8bitcn/skeleton @8bitcn/spinner`

Expected: CLI adds/reconciles the four components.

- [ ] **Step 3: Export them locally**

```ts
export * from "./spinner";
export { default as Spinner } from "./spinner";
export * from "./blocks/not-found-brick-breaker";
export { default as NotFoundBrickBreaker } from "./blocks/not-found-brick-breaker";
```

Do not import a registry stylesheet from the app root.

- [ ] **Step 4: Type-check then commit**

Run: `pnpm exec tsc --noEmit`

Expected: PASS. If registry exports are named, change only those two barrel exports to its real symbols.

```bash
git add client/src/components/ui/8bit
git commit -m "feat: add 8bit loading registry blocks"
```

### Task 2: Test-first loading adapters and presets

**Files:**
- Create: `client/src/components/loading/AscendRouteSkeleton.tsx`
- Create: `client/src/components/loading/AscendPendingSpinner.tsx`
- Create: `client/src/components/loading/AscendFullScreenLoading.tsx`
- Create: `client/src/components/loading/AscendNotFound.tsx`
- Create: `client/src/components/loading/loadingPresets.test.ts`

**Consumes:** Task 1 exports. **Produces:** the interfaces above.

- [ ] **Step 1: Write a failing catalog test**

```ts
import { describe, expect, it } from "vitest";
import { routeLoadingPresets } from "./AscendRouteSkeleton";

describe("routeLoadingPresets", () => {
  it("assigns every dashboard boundary an intentional preset", () => {
    expect(Object.keys(routeLoadingPresets)).toHaveLength(32);
    expect(routeLoadingPresets).toMatchObject({
      "/dashboard": "command-hud", "/missions": "quest-list",
      "/habits": "habit-grid", "/tower": "tower-floors",
      "/bosses": "raid-board", "/shop": "merchant",
      "/aira": "command-console", "/settings": "preferences",
    });
  });
});
```

- [ ] **Step 2: Verify failure**

Run: `pnpm exec vitest run src/components/loading/loadingPresets.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement renderer**

Implement all 32 matrix URLs as `routeLoadingPresets`. Make each recipe data-driven with a header width, panel count, panel aspect sequence, and scoped accent class. The renderer has one `role="status"`/`aria-live="polite"`/`aria-busy="true"` container. Its 8bitcn Skeleton geometry is `aria-hidden="true"` with reduced-motion-safe animation.

- [ ] **Step 4: Implement fullscreen, spinner, and recovery adapters**

```tsx
export function AscendPendingSpinner({ label, className }: AscendPendingSpinnerProps) {
  return (
    <span className={className} role="status" aria-live="polite" aria-label={label}>
      <Spinner variant="diamond" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
```

`AscendFullScreenLoading` passes `variant="fullscreen"`, `autoProgress={false}`, `progress={35}`, `title="ASCEND CORE LOADING"`, and two Ascend tips. `AscendNotFound` is client-side: Back calls `router.back()` only when history exists, otherwise `router.push("/landing")`; it passes `href="/landing"` and `cta="RETURN TO LANDING"` to the brick-breaker.

- [ ] **Step 5: Verify then commit**

Run: `pnpm exec vitest run src/components/loading/loadingPresets.test.ts && pnpm exec tsc --noEmit`

Expected: PASS.

```bash
git add client/src/components/loading client/src/components/ui/8bit/index.ts
git commit -m "feat: add scoped 8bit loading adapters"
```

### Task 3: Global and per-route suspense boundaries

**Files:**
- Modify: `client/src/app/loading.tsx`, `client/src/app/not-found.tsx`, `client/src/app/(dashboard)/loading.tsx`
- Create: all 32 matrix `loading.tsx` files

**Consumes:** Task 2. **Produces:** unique skeleton boundaries while dashboard shell remains visible.

- [ ] **Step 1: Replace root fallback and 404**

```tsx
import { AscendFullScreenLoading } from "@/components/loading/AscendFullScreenLoading";
export default function GlobalLoading() { return <AscendFullScreenLoading />; }

// not-found.tsx
import { AscendNotFound } from "@/components/loading/AscendNotFound";
export default function NotFound() { return <AscendNotFound />; }
```

- [ ] **Step 2: Replace dashboard fallback**

```tsx
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";
export default function DashboardLoading() {
  return <AscendRouteSkeleton preset="command-hud" label="Loading dashboard" />;
}
```

- [ ] **Step 3: Add all matrix loaders**

```tsx
import { AscendRouteSkeleton } from "@/components/loading/AscendRouteSkeleton";
export default function TowerLoading() {
  return <AscendRouteSkeleton preset="tower-floors" label="Loading tower floors" />;
}
```

Use the row-specific preset and label for each matrix path; do not add loaders to landing/login/legal/v2.

- [ ] **Step 4: Verify then commit**

Run: `pnpm exec tsc --noEmit && pnpm exec vitest run src/components/loading/loadingPresets.test.ts`

Expected: PASS.

```bash
git add client/src/app/loading.tsx client/src/app/not-found.tsx "client/src/app/(dashboard)"
git commit -m "feat: add route-specific 8bit skeletons"
```

### Task 4: Existing client data-loading states

**Files:**
- Modify dashboard pages: achievements, automations, beasts, calendar, crafting, habits, habits/[id], inventory, season-pass, shop, workouts/boss-pr.

**Consumes:** `AscendRouteSkeleton`. **Produces:** identical guards with matched skeleton JSX.

- [ ] **Step 1: Keep each fetch guard and exchange only its visual branch**

```tsx
if (isLoading && !collection) {
  return <AscendRouteSkeleton preset="stable" label="Loading beast stable" />;
}
```

Apply the route matrix preset/label to every full-region first-load branch.

- [ ] **Step 2: Keep partial shells partial**

For automations, calendar, and analytics, retain their existing shell and condition. Replace generic skeleton only inside the existing loading panel with 8bitcn Skeleton. That panel has `aria-busy={isLoading}` and an sr-only status label.

- [ ] **Step 3: Verify then commit**

Run: `pnpm exec tsc --noEmit`

Expected: PASS with no modifications to data effects, handler logic, services, or stores.

```bash
git add "client/src/app/(dashboard)"
git commit -m "feat: match client data loaders to route skeletons"
```

### Task 5: Existing action-owned spinners

**Files:**
- Modify auth pages: login, register, guest
- Modify dashboard pages: aira, automations, crafting, profile/customize, profile/skills, shop, workouts
- Modify: `client/src/components/beasts/EggIncubatorWidget.tsx`

**Consumes:** `AscendPendingSpinner`. **Produces:** unchanged disabled controls with accessible diamond feedback.

- [ ] **Step 1: Replace only existing pending-control indicators**

```tsx
{isSubmitting
  ? <AscendPendingSpinner label="Authenticating operative" />
  : "AUTHENTICATE OPERATIVE"}
```

Retain original `disabled` expressions. Use labels: Authenticating operative, Creating account, Opening guest session, AIRA is responding, Saving automation, Forging item, Saving appearance, Unlocking skill, Purchasing item, Refreshing ranks, Simulating egg progress, Hatching beast.

- [ ] **Step 2: Preserve unrelated indicators**

Do not edit Sonner loaders, chart-internal activity, or v2 components.

- [ ] **Step 3: Verify then commit**

Run: `pnpm exec tsc --noEmit && pnpm lint`

Expected: PASS; no unused `Loader2` or `PixelSpinnerIcon` import in edited files.

```bash
git add "client/src/app/(auth)" "client/src/app/(dashboard)" client/src/components/beasts/EggIncubatorWidget.tsx
git commit -m "feat: use diamond spinner for pending actions"
```

### Task 6: Browser verification and final regression suite

**Files:**
- Create: `client/scripts/verify_loading_ui.ts`
- Modify: `client/package.json`

**Produces:** `pnpm verify:loading-ui`.

- [ ] **Step 1: Write concrete browser checks**

```ts
await page.goto(`${BASE_URL}/does-not-exist`, { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: /error 404/i }).waitFor();
await page.getByRole("link", { name: /return to landing/i }).waitFor();

const metrics = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1);
```

Use desktop 1440×1000 and mobile 390×844 contexts. Visit tower, missions, inventory, aira, settings; where a loader is visible assert `aria-busy="true"` and skeleton `aria-hidden="true"`. Emulate reduced motion. No synthetic delays or API mocks.

- [ ] **Step 2: Add command**

```json
"verify:loading-ui": "tsx scripts/verify_loading_ui.ts"
```

- [ ] **Step 3: Run final verification**

Run: `pnpm exec vitest run && pnpm lint && pnpm exec tsc --noEmit && pnpm build && pnpm verify:loading-ui && pnpm exec tsx scripts/verify_landing_login.ts`

Expected: all PASS.

- [ ] **Step 4: Inspect and commit**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and no accidental global, landing, or login change.

```bash
git add client/scripts/verify_loading_ui.ts client/package.json
git commit -m "test: verify 8bit loading states"
```

## Plan Self-Review

### Spec coverage

Tasks 1–3 deliver the four registry blocks, global 404, root suspense loader, and all 32 unique dashboard route skeletons. Tasks 4–5 preserve data and mutation behavior while replacing only visual fallbacks. Task 6 verifies accessibility, reduced motion, responsive behavior, and landing/login protection.

### Placeholder scan

No TODO, TBD, FIXME, “implement later”, “fill in details”, or unbounded test step remains. The sole installation inspection is the authoritative shadcn CLI export form.

### Type consistency

All tasks use the declared `LoadingPreset`, `AscendRouteSkeleton`, `routeLoadingPresets`, and `AscendPendingSpinner` names. The matrix and catalog test require the same 32 entries.
