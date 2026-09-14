# 🎮 8bitcn Component Evaluation, Implementation Status & Strategic Roadmap
**Target Platform:** Ascend OS (Continuous Progression Platform)  
**Source Library:** [@theorcdev/library/8bitcn](https://21st.dev/@theorcdev/library/8bitcn) on 21st.dev  
**Total Components Evaluated:** 104  
**Audited & Verified:** September 2026  
**Implementation Status:** ✅ **31 Components Implemented** | **5 Actively Integrated in Live UI** | **26 Ready to Wire** | **Typecheck Passing (`tsc --noEmit` 0 errors)**

---

## 🧭 Executive Summary & Codebase Verification

The **8bitcn** library by `@theorcdev` is a retro 8-bit aesthetic component suite built on top of **shadcn/ui**, **Radix UI**, and **Tailwind CSS**. It relies heavily on thick stepped borders, pixel drop-shadows, scanline textures, and chunky retro fonts (`Press Start 2P` / `Silkscreen`).

### Codebase Audit Confirmation
Following a forensic audit of the Ascend OS codebase ([`client/src/components/ui/8bit/`](file:///d:/ascend-core/client/src/components/ui/8bit)):
- **31 Components have ALREADY been added and implemented** in the repository.
- **All 16 Tier 1 (High-Impact S-Tier) components** are fully built, typed, and exported from [`client/src/components/ui/8bit/index.ts`](file:///d:/ascend-core/client/src/components/ui/8bit/index.ts).
- **12 Tier 2 tactical utilities** (+ `alert`) are fully implemented.
- **3 foundational Tier 3 primitives** (`card.tsx`, `progress.tsx`, `alert.tsx`) were created as base styling layers.
- **5 components are actively integrated into production views** (`BattleModal`, `AmbientSoundPlayer`, `Topbar`).
- **26 components are ready in the library** to be wired into corresponding feature modules.
- **0 Tier 4 marketing SaaS components** were imported, keeping the application lean and free of B2B landing page bloat.

```
client/src/components/ui/8bit/
├── alert.tsx                   # Tier 2 - Alert banners
├── badge.tsx                   # Tier 2 - Quest/rank tag badges
├── card.tsx                    # Tier 3 - Retro card primitive wrapper
├── empty.tsx                   # Tier 2 - Empty state display with dungeon art
├── enemy-health-display.tsx    # Tier 1 - Stepped boss health display
├── health-bar.tsx              # Tier 1 - Player HP bar [🟢 ACTIVE IN TOWER]
├── hover-card.tsx              # Tier 2 - Popover inspection card
├── index.ts                    # Consolidated barrel export
├── item.tsx                    # Tier 1 - RPG inventory equipment slot
├── kbd.tsx                     # Tier 2 - Hotkey badge primitive
├── mana-bar.tsx                # Tier 1 - Stamina / Mana bar
├── progress.tsx                # Tier 3 - Stepped progress primitive
├── slider.tsx                  # Tier 2 - Stepped range slider [🟢 ACTIVE IN SCRIBE]
├── switch.tsx                  # Tier 2 - Retro toggle switch
├── tooltip.tsx                 # Tier 2 - Pixel tooltip
├── xp-bar.tsx                  # Tier 1 - Player EXP progress bar [🟢 ACTIVE IN TOPBAR]
├── styles/
│   └── retro.css               # Scanlines, pixel-blink, retro fonts & animations
└── blocks/
    ├── audio-settings.tsx      # Tier 1 - Audio channels & volume manager
    ├── chapter-intro.tsx       # Tier 1 - Tower floor entry title splash
    ├── chart-area-step.tsx     # Tier 1 - Recharts stepped volume/EXP chart
    ├── dialogue.tsx            # Tier 1 - RPG typewriter dialogue box
    ├── difficulty-select.tsx   # Tier 1 - Workout / Dungeon intensity cards
    ├── duel-block.tsx          # Tier 1 - Pre-battle VS confrontation card
    ├── game-over.tsx           # Tier 1 - Defeat screen [🟢 ACTIVE IN TOWER]
    ├── game-roadmap1.tsx       # Tier 1 - Quest chain roadmap
    ├── leaderboard.tsx         # Tier 1 - Tower Spire ladder
    ├── loading-screen.tsx      # Tier 2 - Floor loading overlay
    ├── not-found2.tsx          # Tier 2 - 404 Dwarf dungeon page
    ├── pause-menu.tsx          # Tier 2 - Workout rest interval pause modal
    ├── portal-transition.tsx   # Tier 2 - Portal vortex area transition
    ├── quest-log.tsx           # Tier 1 - Tabbed quest drawer
    ├── save-slots.tsx          # Tier 2 - Saved workout routine splits
    └── victory-screen.tsx      # Tier 1 - Spire floor clear victory [🟢 ACTIVE IN TOWER]
```

---

## ⚡ Active UI Integration Status

The following components are **actively rendered in production user interfaces**:

| Component | File Path | Integrated Location | Live Functionality |
|---|---|---|---|
| **Health Bar** | [`health-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/health-bar.tsx) | [`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx#L193-L203) | Renders real-time stepped HP during Tower combat encounters. |
| **Victory Screen** | [`victory-screen.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/victory-screen.tsx) | [`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx#L296-L309) | Displays spoils collected, floor cleared banner, and claim action on combat win. |
| **Game Over** | [`game-over.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/game-over.tsx) | [`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx#L314-L322) | Defeat state with retry / retreat options when character falls on a Spire floor. |
| **Slider** | [`slider.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/slider.tsx) | [`AmbientSoundPlayer.tsx`](file:///d:/ascend-core/client/src/features/learning/components/AmbientSoundPlayer.tsx#L273-L281) | Stepped retro volume slider for ambient soundscapes (Hearth, Rain, Clock). |
| **Xp Bar** | [`xp-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/xp-bar.tsx) | [`Topbar.tsx`](file:///d:/ascend-core/client/src/components/Topbar.tsx#L177-L183) | Primary player EXP progression bar rendered in the Topbar header & quick-hub dropdown. |

---

## 🏆 Tier 1: High-Impact Direct Fits (16/16 Implemented)

All 16 components in Tier 1 have been implemented in `client/src/components/ui/8bit/`.

| # | Component | Implemented File | Current Status | Recommended Target & Value |
|---|---|---|---|---|
| 1 | **8bit Dialogue** | [`dialogue.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/dialogue.tsx) | 🟡 Ready to wire | **AIRA Companion & Boss Banter** ([`AiraCompanion.tsx`](file:///d:/ascend-core/client/src/features/aira/components/AiraCompanion.tsx)). Classic typewriter text stream, speaker avatar, continue flashing cursor. |
| 2 | **8bit Enemy Health Display** | [`enemy-health-display.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/enemy-health-display.tsx) | 🟡 Ready to wire | **Tower Boss Pre-Battle Banner** ([`FloorBattleBanner.tsx`](file:///d:/ascend-core/client/src/features/tower/components/FloorBattleBanner.tsx)). Segmented HP with skull phase tags and nameplate. |
| 3 | **8bit Health Bar** | [`health-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/health-bar.tsx) | 🟢 **Active in Live UI** | **Battle HUD** ([`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx)). Stepped player and enemy battle health tracker. |
| 4 | **8bit Mana Bar** | [`mana-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/mana-bar.tsx) | 🟡 Ready to wire | **Skill Ult & Energy HUD** ([`SkillsPage`](file:///d:/ascend-core/client/src/app/skills/page.tsx) or Tower Ult). Tracks mana / stamina / focus reserves. |
| 5 | **8bit Xp Bar** | [`xp-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/xp-bar.tsx) | 🟢 **Active in Live UI** | **Header Player HUD** ([`Topbar.tsx`](file:///d:/ascend-core/client/src/components/Topbar.tsx)). Segmented EXP to next adventurer level. |
| 6 | **8bit Game Roadmap 1 — Quest Log** | [`game-roadmap1.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/game-roadmap1.tsx) | 🟡 Ready to wire | **Daily Rituals & Quest Chains** (`/habits`). Displays quest rank, milestone checkpoints, completion stamps, and XP bounty tags. |
| 7 | **8bit Quest Log** | [`quest-log.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/quest-log.tsx) | 🟡 Ready to wire | **Quest Drawer / Active Bounties** ([`HabitsPage`](file:///d:/ascend-core/client/src/app/habits/page.tsx)). Tabbed quest log (Daily, Weekly, Epic Spire Milestones). |
| 8 | **8bit Leaderboard** | [`leaderboard.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/leaderboard.tsx) | 🟡 Ready to wire | **Tower Spire Leaderboard / Guilds** (`/tower`). Pixel ranking ladder with crowns, badges, and clearance times. |
| 9 | **8bit Audio Settings** | [`audio-settings.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/audio-settings.tsx) | 🟡 Ready to wire | **Soundscape & SFX Modal** ([`AmbientSoundPlayer.tsx`](file:///d:/ascend-core/client/src/features/learning/components/AmbientSoundPlayer.tsx) or Global Settings). Centralizes Master, BGM, SFX, and Ambient sliders. |
| 10 | **8bit Item** | [`item.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/item.tsx) | 🟡 Ready to wire | **Armory & Inventory Equipment Slots** (`/inventory`, `/shop`). RPG equipment slot frame with rarity borders and stack badges. |
| 11 | **8bit Chapter Intro** | [`chapter-intro.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/chapter-intro.tsx) | 🟡 Ready to wire | **Tower Floor Transition Screen** (`/tower`). Dramatic splash screen (*"FLOOR 20: THE NECROMANCER'S CRYPT"*). |
| 12 | **8bit Difficulty Select** | [`difficulty-select.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/difficulty-select.tsx) | 🟡 Ready to wire | **Workout Intensity & Dungeon Tier Select** (`/workouts`). Selects session presets (*Deload / Hypertrophy / PR Max Out*). |
| 13 | **8bit Duel Block** | [`duel-block.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/duel-block.tsx) | 🟡 Ready to wire | **Tower Pre-Battle Encounter Card** (`/tower`). Player vs Boss preview with VS banner and comparative stats. |
| 14 | **8bit Victory Screen** | [`victory-screen.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/victory-screen.tsx) | 🟢 **Active in Live UI** | **Tower Floor Clear** ([`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx)). Spoils collected, EXP gained, and victory fanfare. |
| 15 | **8bit Game Over** | [`game-over.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/game-over.tsx) | 🟢 **Active in Live UI** | **Tower Battle Defeat State** ([`BattleModal.tsx`](file:///d:/ascend-core/client/src/features/tower/components/BattleModal.tsx)). Ascension halted state with retry/retreat actions. |
| 16 | **8bit Step Area Chart** | [`chart-area-step.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/chart-area-step.tsx) | 🟡 Ready to wire | **Workout Volume & EXP History** (`/stats`, `/workouts`). Stepped pixel area chart for weekly tonnage and study hours. |

---

## 🎖️ Tier 2: Tactical Enhancements & Utility Primitives

12 of 18 Tier 2 utilities are implemented, plus `alert.tsx`.

| # | Component | Implemented File | Status | Best Use Case in Ascend OS |
|---|---|---|---|---|
| 17 | **8-bit Keyboard Key (kbd)** | [`kbd.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/kbd.tsx) | 🟡 Implemented | Hotkey hints (`[SPACE]` for Pomodoro, `[1-4]` for combat skills, `[ESC]` to close). |
| 18 | **8bit Empty** | [`empty.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/empty.tsx) | 🟡 Implemented | Empty state cards for Field Journal, empty workout feeds, or zero active quests. |
| 19 | **8-bit Slider** | [`slider.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/slider.tsx) | 🟢 **Active in Live UI** | Integrated into [`AmbientSoundPlayer.tsx`](file:///d:/ascend-core/client/src/features/learning/components/AmbientSoundPlayer.tsx) for ambient volume control. Also suitable for RPE 1-10. |
| 20 | **8-bit Switch** | [`switch.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/switch.tsx) | 🟡 Implemented | Toggles for Sakura Petals, CRT Scanlines, SFX, and auto-briefings. |
| 21 | **8-bit Tooltip** | [`tooltip.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/tooltip.tsx) | 🟡 Implemented | High-contrast pixel tooltips for stat multipliers (STR/INT/VIT) and relic traits. |
| 22 | **8bit Hover Card** | [`hover-card.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/hover-card.tsx) | 🟡 Implemented | Boss weakness & elemental resistance preview cards in Beast Journal. |
| 23 | **8-bit Badge** | [`badge.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/badge.tsx) | 🟡 Implemented | Rank tags (`S-RANK`, `DAILY`, `BOSS BOUNTY`, `EPIC`). |
| 24 | **8bit Save Slots** | [`save-slots.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/save-slots.tsx) | 🟡 Implemented | Routine template slots (*"Slot 1: Push Day A"*, *"Slot 2: Pull Day B"*). |
| 25 | **8bit 404 Dwarf / Undead** | [`not-found2.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/not-found2.tsx) | 🟡 Implemented | Thematic 404 page for broken routes ([`app/not-found.tsx`](file:///d:/ascend-core/client/src/app/not-found.tsx)). |
| 26 | **8bit Loading Screen** | [`loading-screen.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/loading-screen.tsx) | 🟡 Implemented | Floor transition and initial state hydration loading screen. |
| 27 | **8bit Skill Tree Features** | — | ⚪ Not Added | Ascend OS uses custom SVG nodes in `/skills`. |
| 28 | **8bit Pause Menu** | [`pause-menu.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/pause-menu.tsx) | 🟡 Implemented | Rest interval overlay during workouts or paused deep work sessions. |
| 29 | **8bit Party Grid** | — | ⚪ Deferred | For future multiplayer adventurer party / guild roster. |
| 30 | **8bit Friend List** | — | ⚪ Deferred | For future social / guild system. |
| 31 | **8-bit Skeleton** | — | ⚪ Redundant | Standard Tailwind pulse skeletons match dark fantasy cards. |
| 32 | **8-bit Spinner** | — | ⚪ Redundant | Existing custom spinner in use. |
| 33 | **8bit Portal Transition** | [`portal-transition.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/portal-transition.tsx) | 🟡 Implemented | Swirling retro animation when entering Tower or Boss Rituals. |
| 34 | **8bit Stats Dashboard** | — | ⚪ Redundant | Existing character stats matrix and radar charts are more complete. |
| 35 | **8-bit Alert** | [`alert.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/alert.tsx) | 🟡 Implemented | Warning callouts for low HP, missed habit warnings, or debuff alerts. |

---

## 🛑 Tier 3: Redundant with Existing Custom System (Do NOT Replace)

Ascend OS has tailored, bespoke components styled with the Kyoto Dusk, parchment, and bronze-tinted fantasy palette. **Replacing these with generic 8bitcn versions would cause visual and UX regression.**

*(Note: `card.tsx` and `progress.tsx` were implemented in `client/src/components/ui/8bit/` solely as foundation primitives for the 8bit blocks, but should NOT overwrite Ascend OS's primary card system).*

| Component | 21st.dev Slug | Why Ascend OS's Current Version Is Superior |
|---|---|---|
| **8-bit Button** | `8bit-button` | **Keep `PixelButton`**. Has custom bronze/crimson/gold bevels, active press physics, sound triggers, and icon integration. Generic 8bitcn buttons look flatter. |
| **8bit Card** | `8bit-card` | **Keep `PixelScrollCard`, `PixelCard`, and `AdventurerStatusCardRibbon`**. Rich textured parchment and stone monolith aesthetics. |
| **8-bit Dialog** | `8bit-dialog` | Existing game dialogs (`WorkoutLoggerModal`, `TomeModal`, `BattleArenaModal`) have specialized header plaques and custom responsive sizing. |
| **8-bit Drawer** | `8bit-drawer` | Powered by custom Radix/Vaul drawers configured for mobile sheet gestures. |
| **8-bit Accordion** | `8bit-accordion` | Existing accordions in `/learning` and `/lore` match ancient spellbooks and codexes. |
| **8-bit Checkbox** | `8bit-checkbox` | Ascend OS checkbox triggers `CoolMode` sakura petal particle bursts and custom spring checkmarks. |
| **8-bit Input / Textarea**| `8bit-input` / `textarea` | Current inputs have custom focus rings, integer-only steppers for weight/reps, and parchment backgrounds. |
| **8-bit Select / Dropdown**| `8bit-select` / `dropdown` | Custom dropdowns use gilded borders and dark slate backgrounds matching the UI theme. |
| **8-bit Tabs** | `8bit-tabs` | Ascend OS tabs in `/tower`, `/workouts`, and `/learning` use custom pixel pill switches with sound feedback. |
| **8-bit Toast** | `8bit-toast` | Custom `sonner` toasts combined with AIRA fairy avatars and custom speech bubbles. |
| **8-bit Progress** | `8bit-progress` | Handled by `PixelProgress` and `AnimatedCircularProgressBar`. |
| **8-bit Table** | `8bit-table` | Workout logging requires specialized tabular UX (previous PRs, weight steppers, set completion tags) which generic tables cannot provide. |
| **8-bit Popover** | `8bit-popover` | Already standardized with Radix UI popovers. |
| **8-bit Scroll Area** | `8bit-scroll-area` | Ascend OS uses custom gold-pip scrollbars defined in global CSS. |
| **8-bit Separator** | `8bit-separator` | Ascend OS uses ornate pixel filigree dividers and gold hairline borders. |

---

## 🚫 Tier 4: Excluded Marketing & Generic SaaS Components (45 Components)

These 8bitcn components are strictly designed for **marketing landing pages, pricing conversion funnels, and corporate SaaS marketing sites**. They are intentionally excluded from the authenticated application shell:

- **Marketing Landing Heroes:** `8bit Hero1 Centered`, `8bit Hero2 Split`, `8bit Hero3 Game Title`, `8bit Health Bar Hero`, `8bit XP Milestone Hero`
- **SaaS Pricing Tables:** `8bit Pricing 1 — Tier Cards`, `8bit Pricing 2 — Monthly Toggle`
- **Social Proof & Testimonials:** `8bit Case Studies`, `8bit Review Carousel`, `8bit Social Proof Stats Bar`, `8bit Social Proof Testimonials`
- **SaaS Feature Grids & CTAs:** `8bit Feature 1 Grid`, `8bit Feature 2 List`, `8bit Feature — Carousel`, `8bit CTA 1 — Comparison`, `8bit CTA2 Use Cases`, `8bit Boss Fight CTA`
- **Marketing FAQs & Footers:** `8bit FAQ 1`, `8bit FAQ 2 — Card Grid`, `8bit FAQ 3 Searchable`, `8bit Checkpoint FAQ`, `8bit Footer`, `8bit Changelog`, `8bit Newsletter Signup`
- **Generic Auth Forms:** `8-bit Login Form`, `8-bit Login Form with Icons`, `8-bit Login Form with Image`
- **Demo Shells / Menus:** `8-bit Demo Shell`, `8bit Main Menu`, `8-bit Navigation Menu`, `8-bit Menubar`

---

## 📋 Complete Master Audit: All 104 Components

Below is the exhaustive audit of every single component in `@theorcdev/8bitcn` cross-referenced with the Ascend OS codebase:

| # | Component Name | Slug | Tier | Codebase Status | Implemented File / Note |
|:---|:---|:---|:---|:---|:---|
| 1 | 8bit 404 Dwarf | `8bit-not-found2` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/not-found2.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/not-found2.tsx) |
| 2 | 8bit 404 Page | `8bit-not-found1` | Tier 2 | ⚪ Alternative | Variant of 404; Dwarf theme preferred |
| 3 | 8bit 404 Undead | `8bit-not-found3` | Tier 2 | ⚪ Alternative | Variant of 404; Dwarf theme preferred |
| 4 | 8-bit Accordion | `8bit-accordion` | Tier 3 | ⚪ Redundant | Existing codex accordion preferred |
| 5 | 8-bit Alert | `8bit-alert` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/alert.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/alert.tsx) |
| 6 | 8-bit Alert Dialog | `8bit-alert-dialog` | Tier 3 | ⚪ Redundant | Existing custom modal frames preferred |
| 7 | 8bit Audio Settings | `8bit-audio-settings` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/audio-settings.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/audio-settings.tsx) |
| 8 | 8-bit Badge | `8bit-badge` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/badge.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/badge.tsx) |
| 9 | 8bit Boss Fight CTA | `8bit-game-cta1` | Tier 4 | 🔴 Excluded | Marketing CTA disguised as a boss encounter |
| 10 | 8-bit Breadcrumb | `8bit-breadcrumb` | Tier 3 | ⚪ Redundant | Flat tabs used across app |
| 11 | 8-bit Button | `8bit-button` | Tier 3 | ⚪ Redundant | Keep custom `PixelButton` with sound & physics |
| 12 | 8bit Calendar | `8bit-calendar` | Tier 3 | ⚪ Redundant | Keep custom habit heatmap & `react-day-picker` |
| 13 | 8bit Card | `8bit-card` | Tier 3 | 🟡 Implemented | [`client/src/components/ui/8bit/card.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/card.tsx) (used internally by blocks) |
| 14 | 8bit Carousel | `8bit-carousel` | Tier 4 | 🔴 Excluded | Generic marketing carousel |
| 15 | 8bit Case Studies | `8bit-team3` | Tier 4 | 🔴 Excluded | Marketing B2B case studies |
| 16 | 8bit Changelog | `8bit-team2` | Tier 4 | 🔴 Excluded | Marketing changelog |
| 17 | 8bit Chapter Intro | `8bit-chapter-intro` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/chapter-intro.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/chapter-intro.tsx) |
| 18 | 8-bit Checkbox | `8bit-checkbox` | Tier 3 | ⚪ Redundant | Keep sakura particle checkbox |
| 19 | 8bit Checkpoint FAQ | `8bit-game-faq1` | Tier 4 | 🔴 Excluded | Marketing FAQ block |
| 20 | 8-bit Collapsible | `8bit-collapsible` | Tier 3 | ⚪ Redundant | Covered by Radix primitives |
| 21 | 8-bit Command | `8bit-command` | Tier 2 | ⚪ Deferred | Future Cmd+K quick-search palette |
| 22 | 8-bit Context Menu | `8bit-context-menu` | Tier 2 | ⚪ Deferred | Right-click item action menu |
| 23 | 8bit CTA 1 — Comparison | `8bit-cta1` | Tier 4 | 🔴 Excluded | Marketing competitor comparison block |
| 24 | 8bit CTA2 Use Cases | `8bit-cta2` | Tier 4 | 🔴 Excluded | Marketing product use-case block |
| 25 | 8-bit Demo Shell | `8bit-advanced1` | Tier 4 | 🔴 Excluded | Marketing demo browser window |
| 26 | 8-bit Dialog | `8bit-dialog` | Tier 3 | ⚪ Redundant | Existing modal frames preferred |
| 27 | 8bit Dialogue | `8bit-dialogue` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/dialogue.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/dialogue.tsx) |
| 28 | 8bit Difficulty Select | `8bit-difficulty-select` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/difficulty-select.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/difficulty-select.tsx) |
| 29 | 8-bit Drawer | `8bit-drawer` | Tier 3 | ⚪ Redundant | Existing mobile Vaul/Radix drawers preferred |
| 30 | 8-bit Dropdown Menu | `8bit-dropdown-menu` | Tier 3 | ⚪ Redundant | Existing styled dropdowns preferred |
| 31 | 8bit Duel Block | `8bit-duel-block` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/duel-block.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/duel-block.tsx) |
| 32 | 8bit Empty | `8bit-empty` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/empty.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/empty.tsx) |
| 33 | 8bit Enemy Health Display | `8bit-enemy-health-display` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/enemy-health-display.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/enemy-health-display.tsx) |
| 34 | 8bit FAQ 1 | `8bit-faq1` | Tier 4 | 🔴 Excluded | Marketing landing page FAQ |
| 35 | 8bit FAQ 2 — Card Grid | `8bit-faq2` | Tier 4 | 🔴 Excluded | Marketing landing page FAQ grid |
| 36 | 8bit FAQ 3 Searchable | `8bit-faq3` | Tier 4 | 🔴 Excluded | Marketing searchable helpdesk |
| 37 | 8bit Feature 1 Grid | `8bit-feature1` | Tier 4 | 🔴 Excluded | Marketing feature grid |
| 38 | 8bit Feature 2 List | `8bit-feature2` | Tier 4 | 🔴 Excluded | Marketing feature list |
| 39 | 8bit Feature — Carousel | `8bit-feature3` | Tier 4 | 🔴 Excluded | Marketing feature slider |
| 40 | 8bit Footer | `8bit-footer1` | Tier 4 | 🔴 Excluded | Marketing footer |
| 41 | 8bit Friend List | `8bit-friend-list` | Tier 2 | ⚪ Deferred | Social / guild party roster |
| 42 | 8bit Game Over | `8bit-game-over` | Tier 1 | 🟢 **Active in Live UI** | [`client/src/components/ui/8bit/blocks/game-over.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/game-over.tsx) |
| 43 | 8bit Game Progress | `8bit-game-progress` | Tier 2 | ⚪ Alternative | Covered by `progress.tsx` |
| 44 | 8bit Game Roadmap 1 — Quest Log | `8bit-game-roadmap1` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/game-roadmap1.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/game-roadmap1.tsx) |
| 45 | 8bit Health Bar | `8bit-health-bar` | Tier 1 | 🟢 **Active in Live UI** | [`client/src/components/ui/8bit/health-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/health-bar.tsx) |
| 46 | 8bit Health Bar Hero | `8bit-game-hero1` | Tier 4 | 🔴 Excluded | Marketing landing hero |
| 47 | 8bit Hero1 Centered | `8bit-hero1` | Tier 4 | 🔴 Excluded | Marketing landing hero |
| 48 | 8bit Hero2 Split | `8bit-hero2` | Tier 4 | 🔴 Excluded | Marketing landing hero |
| 49 | 8bit Hero3 Game Title | `8bit-hero3` | Tier 4 | 🔴 Excluded | Marketing landing banner |
| 50 | 8bit Hover Card | `8bit-hover-card` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/hover-card.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/hover-card.tsx) |
| 51 | 8-bit Input | `8bit-input` | Tier 3 | ⚪ Redundant | Existing inputs have custom theme tokens |
| 52 | 8-bit Input OTP | `8bit-input-otp` | Tier 4 | 🔴 Excluded | 2FA code input; not needed in core app |
| 53 | 8bit Item | `8bit-item` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/item.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/item.tsx) |
| 54 | 8-bit Keyboard Key | `8bit-kbd` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/kbd.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/kbd.tsx) |
| 55 | 8-bit Label | `8bit-label` | Tier 3 | ⚪ Redundant | Standard label primitive |
| 56 | 8bit Leaderboard | `8bit-leaderboard` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/leaderboard.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/leaderboard.tsx) |
| 57 | 8bit Loading Screen | `8bit-loading-screen` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/loading-screen.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/loading-screen.tsx) |
| 58 | 8-bit Login Form | `8bit-login-form` | Tier 4 | 🔴 Excluded | Generic auth form; app has custom login flow |
| 59 | 8-bit Login Form with Icons | `8bit-login-form-2` | Tier 4 | 🔴 Excluded | Generic auth form with social login icons |
| 60 | 8bit Login Form with Image | `8bit-login-form-with-image` | Tier 4 | 🔴 Excluded | Split-screen marketing auth form |
| 61 | 8bit Main Menu | `8bit-main-menu` | Tier 4 | 🔴 Excluded | Title screen menu; app uses navigation sidebar |
| 62 | 8bit Mana Bar | `8bit-mana-bar` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/mana-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/mana-bar.tsx) |
| 63 | 8-bit Menubar | `8bit-menubar` | Tier 4 | 🔴 Excluded | Desktop OS menu bar |
| 64 | 8bit Navigation Menu | `8bit-navigation-menu` | Tier 4 | 🔴 Excluded | Website top navigation dropdown header |
| 65 | 8-bit Newsletter Signup | `8bit-advanced3` | Tier 4 | 🔴 Excluded | Marketing lead generation email capture |
| 66 | 8-bit Pagination | `8bit-pagination` | Tier 2 | ⚪ Deferred | For multi-page Beast Journal or History |
| 67 | 8bit Party Grid | `8bit-game-team1` | Tier 2 | ⚪ Deferred | Co-op adventurer party overview |
| 68 | 8bit Pause Menu | `8bit-pause-menu` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/pause-menu.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/pause-menu.tsx) |
| 69 | 8-bit Popover | `8bit-popover` | Tier 3 | ⚪ Redundant | Covered by Radix popovers |
| 70 | 8bit Portal Transition | `8bit-portal-transition` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/portal-transition.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/portal-transition.tsx) |
| 71 | 8bit Pricing 1 — Tier Cards | `8bit-pricing1` | Tier 4 | 🔴 Excluded | SaaS pricing cards |
| 72 | 8bit Pricing 2 — Monthly Toggle | `8bit-pricing2` | Tier 4 | 🔴 Excluded | SaaS monthly/annual toggle |
| 73 | 8-bit Progress | `8bit-progress` | Tier 3 | 🟡 Implemented | [`client/src/components/ui/8bit/progress.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/progress.tsx) (used internally by bars) |
| 74 | 8bit Quest Log | `8bit-quest-log` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/quest-log.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/quest-log.tsx) |
| 75 | 8-bit Radio Group | `8bit-radio-group` | Tier 2 | ⚪ Deferred | Retro radio group selector |
| 76 | 8bit Resizable | `8bit-resizable` | Tier 4 | 🔴 Excluded | Split-pane resizer |
| 77 | 8bit Review Carousel | `8bit-social-proof3` | Tier 4 | 🔴 Excluded | Customer review carousel |
| 78 | 8bit Save Slots | `8bit-save-slots` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/save-slots.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/save-slots.tsx) |
| 79 | 8-bit Scroll Area | `8bit-scroll-area` | Tier 3 | ⚪ Redundant | Global CSS custom scrollbar active |
| 80 | 8-bit Select | `8bit-select` | Tier 3 | ⚪ Redundant | Custom theme selects preferred |
| 81 | 8-bit Separator | `8bit-separator` | Tier 3 | ⚪ Redundant | Custom dividers preferred |
| 82 | 8-bit Skeleton | `8bit-skeleton` | Tier 2 | ⚪ Redundant | Tailwind pulse skeletons in use |
| 83 | 8bit Skill Tree Features | `8bit-game-features1` | Tier 1 | ⚪ Deferred | Ability tree matrix (`/skills`) |
| 84 | 8-bit Slider | `8bit-slider` | Tier 2 | 🟢 **Active in Live UI** | [`client/src/components/ui/8bit/slider.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/slider.tsx) |
| 85 | 8bit Social Proof Stats Bar | `8bit-social-proof1` | Tier 4 | 🔴 Excluded | Marketing vanity numbers |
| 86 | 8bit Social Proof Testimonials | `8bit-social-proof2` | Tier 4 | 🔴 Excluded | Marketing testimonials |
| 87 | 8-bit Spinner | `8bit-spinner` | Tier 2 | ⚪ Redundant | Existing spinners active |
| 88 | 8-bit Stats Dashboard | `8bit-advanced2` | Tier 2 | ⚪ Redundant | Character sheet overview already implemented |
| 89 | 8-bit Step Area Chart | `8bit-chart-area-step` | Tier 1 | 🟡 Implemented | [`client/src/components/ui/8bit/blocks/chart-area-step.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/chart-area-step.tsx) |
| 90 | 8-bit Switch | `8bit-switch` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/switch.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/switch.tsx) |
| 91 | 8-bit Table | `8bit-table` | Tier 3 | ⚪ Redundant | Specialized workout logging table preferred |
| 92 | 8-bit Tabs | `8bit-tabs` | Tier 3 | ⚪ Redundant | Custom pixel pill tabs preferred |
| 93 | 8bit Team Grid | `8bit-team1` | Tier 4 | 🔴 Excluded | Company "About Us" employee grid |
| 94 | 8-bit Textarea | `8bit-textarea` | Tier 3 | ⚪ Redundant | Custom textareas preferred |
| 95 | 8bit Timeline Horizontal | `8bit-timeline2` | Tier 2 | ⚪ Deferred | Habit streak timeline |
| 96 | 8bit Timeline Vertical | `8bit-timeline1` | Tier 2 | ⚪ Deferred | Floor history timeline |
| 97 | 8-bit Toast | `8bit-toast` | Tier 3 | ⚪ Redundant | Custom AIRA fairy toasts active |
| 98 | 8-bit Toggle | `8bit-toggle` | Tier 2 | ⚪ Deferred | Single state toggle buttons |
| 99 | 8-bit Toggle Group | `8bit-toggle-group` | Tier 2 | ⚪ Deferred | Workout set type selector (Warmup/Working/Drop) |
| 100 | 8-bit Tooltip | `8bit-tooltip` | Tier 2 | 🟡 Implemented | [`client/src/components/ui/8bit/tooltip.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/tooltip.tsx) |
| 101 | 8bit Victory Screen | `8bit-victory-screen` | Tier 1 | 🟢 **Active in Live UI** | [`client/src/components/ui/8bit/blocks/victory-screen.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/blocks/victory-screen.tsx) |
| 102 | 8-bit Xp Bar | `8bit-xp-bar` | Tier 1 | 🟢 **Active in Live UI** | [`client/src/components/ui/8bit/xp-bar.tsx`](file:///d:/ascend-core/client/src/components/ui/8bit/xp-bar.tsx) |
| 103 | 8bit XP Milestone Hero | `8bit-game-hero2` | Tier 4 | 🔴 Excluded | Marketing banner |
| 104 | 8bit Zigzag Roadmap | `8bit-timeline3` | Tier 2 | ⚪ Deferred | World map floor pathing |

---

## 🚀 Phase 2: Next Implementation Wiring Targets for CB

Now that all 31 components are implemented and verified in [`client/src/components/ui/8bit/`](file:///d:/ascend-core/client/src/components/ui/8bit), here is the high-value sequence to wire the remaining ready components into Ascend OS views:

1. **AIRA RPG Dialog (`dialogue.tsx`):**
   - **Target:** [`client/src/features/aira/components/AiraPeriodicToast.tsx`](file:///d:/ascend-core/client/src/features/aira/components/AiraPeriodicToast.tsx) and [`client/src/features/aira/components/AiraCompanion.tsx`](file:///d:/ascend-core/client/src/features/aira/components/AiraCompanion.tsx)
   - **Action:** Replace plain text callouts with retro typewriter dialogue with fairy portrait and blinking cursor.

2. **Boss Presentation Banner (`enemy-health-display.tsx`):**
   - **Target:** [`client/src/features/tower/components/FloorBattleBanner.tsx`](file:///d:/ascend-core/client/src/features/tower/components/FloorBattleBanner.tsx)
   - **Action:** Upgrade floor pre-encounter boss display to use `EnemyHealthDisplay` with retro skull badge and segmented HP.

3. **Habit Quest Drawer (`quest-log.tsx` & `game-roadmap1.tsx`):**
   - **Target:** [`client/src/app/habits/page.tsx`](file:///d:/ascend-core/client/src/app/habits/page.tsx)
   - **Action:** Embed `QuestLog` for Daily Bounties and Weekly S-Rank Quests with completion stamps.

4. **Workout Volume Stepped Analytics (`chart-area-step.tsx`):**
   - **Target:** [`client/src/features/learning/components/FocusStatistics.tsx`](file:///d:/ascend-core/client/src/features/learning/components/FocusStatistics.tsx) or Workout Analytics
   - **Action:** Swap smooth Bézier curves for retro stepped area charts (`color="gold"` / `color="crimson"`).

5. **Workout Intensity Preset Picker (`difficulty-select.tsx`):**
   - **Target:** [`client/src/features/workouts/components/CreateCustomWorkoutModal.tsx`](file:///d:/ascend-core/client/src/features/workouts/components/CreateCustomWorkoutModal.tsx)
   - **Action:** Allow users to choose routine difficulty tiers (*Deload / Hypertrophy / PR Max Out*) using retro pixel selection cards.

6. **Routine Presets Manager (`save-slots.tsx`):**
   - **Target:** Workout routine manager
   - **Action:** Display saved routine splits (*Push A, Pull B, Leg Hypertrophy*) in RPG save memory slots.
