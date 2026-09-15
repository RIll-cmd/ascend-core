# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Users**: High performers, athletes, gamers, software engineers, and discipline-driven individuals seeking an immersive executive operating system.
- **User Situation**: Managing demanding daily execution (habits, gym workouts, walking steps, deep study/cognitive sprints) where typical checklist tools feel dry, sterile, and unrewarding.
- **Core Job to be Done**: Transform daily real-world discipline and habits into tangible, visceral RPG character progression, combat power indices (PWR), and measurable self-actualization.

## Product Purpose

Ascend OS is an ultra-modern, gamified executive operating system and self-actualization dashboard. It turns daily discipline—habit execution, structured gym workouts, physical walking steps, and study sprints—into a high-stakes, cybernetic RPG progression experience inspired by *Solo Leveling* and futuristic command deck telemetry. Success means consistent habit adherence, tangible somatic recovery, and a rewarding progression loop.

## Positioning

Unlike conventional habit trackers or fitness apps that treat activities as mundane checkmarks, Ascend OS binds physical biometric exertion and cognitive discipline directly to combat power (PWR), dungeon boss encounters, familiar pet incubations, and autonomous AI system administrator briefings (AIRA).

## Operating Context

- **Daily Command Deck (`/v2`, `/dashboard`)**: High-frequency morning reviews, real-time focus/pomodoro sprints, and evening habit check-ins.
- **Missions & Directives Kanban Hub (`/missions`)**: Interactive battle lane Kanban board (To Do, In Progress, Review, Completed) with threat ranks (S to F), tag filters, subtask checklists, and a floating slide-over Daily/Weekly Bonuses & Mystery Egg drawer.
- **Kinetic Workout Terminal (`/workouts`)**: Set-by-set logging with real-time 1RM calculations, PR tracking, and dynamic 16-group anatomical muscle recovery curves (48-72h freshness tracking).
- **Mythic Bestiary & Pedometer (`/beasts`)**: Active step sync integration converting daily walking strides into incubation energy, beast ascensions, and passive character buffs.
- **Gate Dungeon & Boss Raids (`/bosses`, `/tower`)**: Workout exertion deals live damage to calamity-tier raid bosses and ascends the Tower of Ascension.
- **Cognitive & Somatic Drawers (`/learning`, `/sleep`)**: Integrated Pomodoro focus engine and 8-hour golden standard sleep debt tracker.

## Capabilities and Constraints

- **Neural Habit Deck (`/habits`)**: Customizable habit templates with flexible scheduling (daily, specific days, weekly targets), multi-tier completion goals (Mini, Normal, Elite), real-time consistency metrics, decay mechanics, streak freeze shields, and calendar heatmaps.
- **Missions & Directives (`/missions`)**: 4-column Kanban quest matrix, subtask progress tracking, filterable threat tiers, habit routine creation wizards, and daily boost charges / free weekly reward systems.
- **Kinetic Workout Engine (`/workouts`)**: Session logger, volume/PR calculation, gate dungeon boss damage scaling, and 16-muscle recovery heatmaps.
- **Mythic Bestiary & Pedometer (`/beasts`)**: 20-species bestiary catalog (Void Drakes, Astral Serpents, Elemental Goliaths), step sync incubation, and passive stat multipliers.
- **Armory, Shop & Economy (`/shop`, `/inventory`, `/crafting`)**: Tri-currency economy (Gold, Gems, Tower Tokens), socketable equipment with IRL attribute percentage multipliers, consumable buffs (Double-EXP, Double-Gold), and title scrolls.
- **Neural Link AI Companion ("AIRA") (`/aira`)**: Autonomous AI companion with real-time access to the user's live database, habits, workouts, and progression state for strategic motivation and mission assignments.

## Brand Commitments

- **Brand Name**: Ascend OS
- **Brand Voice**: Authoritative, sharp, encouraging, cybernetic, and high-agency. Never patronizing, timid, or generic.
- **Visual Identity**: Arcane cybernetic runes, dark obsidian glassmorphism (`#030712`), neon plasma energy glows (Cyan, Violet, Amber, Crimson, Emerald), and pixelated companion sprites.

## Evidence on Hand

- Complete Next.js 16 / React 19 client application with full TypeScript types and Zustand stores.
- Established lore database in `client/src/features/lore/loreData.ts` (currencies, attributes, enemies, equipment).
- Verified audio telemetry system in `client/src/utils/audio.ts` (AIRA voice lines, battle SFX, buff SFX).
- Tested sprite directories in `client/public/sprites/` and `client/public/eggs/`.

## Product Principles

1. **Discipline Over Friction**: Habit check-ins and session logs must be instantaneous, optimistic, and low-latency.
2. **Every Action Yields Tangible Impact**: Completing a habit or workout directly raises real stats (STR, END, DIS, KNO, REC, FOC, CNS) and deals combat damage.
3. **Visceral Cybernetic Aesthetics**: Interface elements feel alive with responsive telemetry, ambient glow layers, and tactile feedback.
4. **Honest Bio-Telemetry**: Recovery statuses and sleep debts reflect physiological reality, not arbitrary streaks.

## Accessibility & Inclusion

- Minimum 44px touch targets on mobile viewports.
- Distinct focus rings (`:focus-visible:ring-2 focus-visible:ring-cyan-500`) for complete keyboard navigation.
- High contrast typography against deep obsidian backgrounds.
- Respects `prefers-reduced-motion` for ambient particles and animations.
