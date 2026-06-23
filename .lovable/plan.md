
# Ascend AI — Build Plan

A premium mobile-first PWA-style web app (390×844 viewport). Dark luxury aesthetic, glassmorphism, electric purple accent, RPG progression layered over real personal growth.

## 1. Design system

Set up in `src/styles.css` (Tailwind v4 `@theme inline`) and shadcn tokens:
- Background `#0D0D0D`, surface `#151515`, card `#1C1C1C`, divider `#262626`
- Primary `#7B61FF` (electric purple), secondary `#5A8DFF`, success `#4ADE80`, warn `#F59E0B`, danger `#EF4444`
- Text `#FFFFFF` / `#A3A3A3`
- Gradient tokens: `--gradient-aurora` (purple → blue-violet), `--gradient-glow`
- Shadow tokens: `--shadow-elegant`, `--shadow-glow`
- Radius: 20px default
- Font: Inter via `@fontsource-variable/inter`
- Keyframes/utilities: `xp-fly`, `glow-pulse`, `orb-spin`, `level-up-flash`, `streak-flame`, `card-complete`, spring-feel transitions (200–400ms)

Reusable primitives in `src/components/ui-ascend/`:
- `GlassCard`, `ProgressRing`, `XpBar`, `LevelBadge`, `RankPill`, `OrbAvatar`, `StatTile`, `ChallengeCard`, `MilestoneNode`, `AiOrb`, `EmptyState`, `BottomNav`, `MobileShell` (caps width at 430px, centers on desktop).

## 2. Backend (Lovable Cloud)

Enable Cloud, then a single migration creates:
- `profiles` (id → auth.users, username, avatar_url, class, rank, level, xp, streak, longest_streak, motto, future_identity, main_goal, created_at) + auto-create trigger on signup
- `goals` (id, user_id, title, target_date, status, progress)
- `milestones` (id, goal_id, title, order, completed_at, reward_xp)
- `challenges` (id, user_id, name, difficulty, xp_reward, impact, est_minutes, due_date, completed_at, source)
- `journal_entries` (id, user_id, mood, body, ai_summary jsonb, created_at)
- `skills` (id, user_id, name, level, xp, rank)
- `achievements` (id, user_id, key, unlocked_at)
- `ai_insights` (id, user_id, kind, content, created_at)
- `coach_threads` + `coach_messages` (UIMessage parts JSON) — threaded chat

Every table: `GRANT` to authenticated + service_role, RLS on, policies scoped to `auth.uid()`. Roles handled via separate `user_roles` table + `has_role` (unused initially but scaffolded).

## 3. Auth

Email/password + Google (via Lovable broker). Routes:
- `/auth` — public sign in / sign up (split-screen luxury panel)
- Everything else under `_authenticated/` using the integration-managed gate.

## 4. AI integration (Lovable AI Gateway, `google/gemini-3-flash-preview`)

Server functions in `src/lib/`:
- `coach.functions.ts` — streaming chat server route `src/routes/api/chat.ts` (AI SDK `streamText`, persists to `coach_messages` in `onFinish`)
- `onboarding.functions.ts` — `analyzeGoals(future_identity, goals)` → returns structured roadmap (milestones, starter challenges, suggested skills) via `Output.object`
- `insights.functions.ts` — `generateDailyInsight(userId)` from recent activity
- `journal.functions.ts` — `summarizeJournal(entryId)` → positive patterns / weak patterns / tomorrow focus
- `realityCheck.functions.ts` — weekly analysis (what worked, root cause, next-week mission)
- `futureYou.functions.ts` — compares Current Path vs Improved Path projections
- `challengeGen.functions.ts` — generates new daily challenges on demand

Gateway helper at `src/lib/ai-gateway.server.ts` per the Lovable AI Gateway pattern. `LOVABLE_API_KEY` ensured via tool.

## 5. Screens

Onboarding (`/onboarding/*`, only if profile incomplete):
1. Hero — "Become the Person You Want To Be"
2. Goal selection (cards + custom)
3. Future Identity input
4. AI Analysis loading (animated orb + step list while `analyzeGoals` runs)

App (bottom nav: Home · Journey · AI Coach (center floating) · Reports · Profile):
- **Home** — greeting, level/XP/rank/class header, main-goal hero card with progress ring, daily challenges (swipe to complete with XP fly-up + card-complete animation), AI insight card, 4 quick stat tiles.
- **Journey** — vertical RPG roadmap with glowing connectors, milestone nodes (progress, ETA, reward).
- **AI Coach** — center glowing orb, threaded chat using AI Elements (`Conversation`, `Message`, `MessageResponse`, `PromptInput`, `Shimmer`), suggested prompts, mode chips (Ask AI / Reality Check / Challenge Generator / Life Strategy / Skill Growth).
- **Reports** — Apple-Health-style charts (Recharts) for growth rate, XP earned, challenges, skill growth, journal consistency; monthly evolution card.
- **Profile** — identity card, shareable Growth Card, achievements grid, settings, sign out.

Secondary screens reachable from Home/Coach:
- **Daily Challenge detail** — completion animation (explosion + XP fly-up)
- **Journal** — mood selector, large composer, voice input (Web Speech API), AI summary card
- **Reality Check** — weekly dashboard cards
- **Skill Hub** — RPG skill cards grid
- **Future You Simulator** — split comparison cards with "AI projection" badge
- **Achievement unlock** — full-screen celebration overlay

Empty states everywhere — motivational copy + subtle illustration (SVG/CSS, no generated images).

## 6. State & data

- TanStack Query throughout; loaders use `ensureQueryData` + `useSuspenseQuery`.
- Mutations for challenge completion update XP/streak optimistically and award achievements via a `complete_challenge` Postgres RPC (atomic XP + level recompute + streak update).
- Achievement check runs server-side after XP changes.

## 7. Visuals

CSS/SVG only — no generated images. AI orb = layered radial gradients + blurred conic spin. Hero illustrations = animated gradient blobs + lucide-react icons. Skill cards, achievement badges, growth card all CSS-rendered.

## 8. SEO / meta

Set Inter font link + viewport in `__root.tsx`. Each public route (`/`, `/auth`) gets distinct title/description/OG.

## 9. Scope discipline / phased delivery

Built in one pass, but in this order so the app is usable early if interrupted:
1. Tokens, shell, bottom nav, auth, profile bootstrap
2. Cloud schema + RLS + RPC
3. Onboarding + AI roadmap
4. Home + challenge complete loop + animations
5. AI Coach (threaded streaming chat)
6. Journey, Journal, Reality Check, Skills, Future You, Reports
7. Achievements + Growth Card share

## Technical notes (for review)

- Stack: TanStack Start, React 19, Tailwind v4, shadcn, AI Elements, AI SDK, Lovable Cloud (Supabase under the hood), Lovable AI Gateway.
- Threaded chat = routes `/_authenticated/coach` (list/new) + `/_authenticated/coach/$threadId`; messages persisted DB-side per `chat-agent-ui-contract`.
- All server-only imports kept inside `.handler()` bodies to respect the client/server import graph.
- Mobile-first; desktop shows the 390-wide app centered on a subtle aurora backdrop.

Confirm and I'll start building.
