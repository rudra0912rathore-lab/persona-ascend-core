import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Sparkles, Flame, Trophy, TrendingUp, Zap, Target, BookOpen } from "lucide-react";
import { MobileShell } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { LevelHeader } from "@/components/ascend/LevelHeader";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ProgressRing } from "@/components/ascend/ProgressRing";
import { ChallengeCard } from "@/components/ascend/ChallengeCard";
import { StatTile } from "@/components/ascend/StatTile";
import { EmptyState } from "@/components/ascend/EmptyState";
import { getProfile } from "@/lib/profile.functions";
import { listTodaysChallenges, completeChallenge, seedStarterChallenges } from "@/lib/challenges.functions";
import { getLatestInsight, getMainGoal } from "@/lib/data.functions";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home · Ascend AI" }] }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function HomePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const profileFn = useServerFn(getProfile);
  const challengesFn = useServerFn(listTodaysChallenges);
  const insightFn = useServerFn(getLatestInsight);
  const goalFn = useServerFn(getMainGoal);
  const completeFn = useServerFn(completeChallenge);
  const seedFn = useServerFn(seedStarterChallenges);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const challenges = useQuery({ queryKey: ["challenges"], queryFn: () => challengesFn() });
  const insight = useQuery({ queryKey: ["insight"], queryFn: () => insightFn() });
  const goal = useQuery({ queryKey: ["goal"], queryFn: () => goalFn() });

  useEffect(() => {
    if (profile.data && profile.data.onboarded === false) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profile.data, navigate]);

  useEffect(() => {
    if (challenges.data && challenges.data.length === 0) {
      seedFn().then(() => qc.invalidateQueries({ queryKey: ["challenges"] }));
    }
  }, [challenges.data, seedFn, qc]);

  const complete = useMutation({
    mutationFn: (id: string) => completeFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const p = profile.data;
  const todays = challenges.data ?? [];
  const completed = todays.filter((c) => c.completed_at).length;
  const total = todays.length || 1;
  const ringPct = Math.round((completed / total) * 100);
  const insightText =
    (insight.data?.content as { text?: string } | null)?.text ??
    "Welcome to Ascend. Complete your first challenge to start your journey.";

  return (
    <MobileShell>
      <LevelHeader
        greeting={greeting()}
        username={p?.username ?? "Seeker"}
        level={p?.level ?? 1}
        xp={p?.xp ?? 0}
        rank={p?.rank ?? "Novice"}
        cls={p?.class ?? "Seeker"}
      />

      <div className="space-y-4 px-5 pb-32 pt-5 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12 lg:pt-8">
        {/* Hero — Main goal */}
        <GlassCard glow className="overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Main Quest
              </div>
              <h2 className="mt-1 truncate text-lg font-semibold">
                {goal.data?.title ?? p?.main_goal ?? "Set your future identity"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {p?.future_identity ?? "Tell Ascend who you want to become."}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                <Target className="h-3.5 w-3.5" /> {completed}/{todays.length} today
              </div>
            </div>
            <ProgressRing value={ringPct} size={92}>
              <div>
                <div className="text-xl font-bold leading-none">{ringPct}%</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">today</div>
              </div>
            </ProgressRing>
          </div>
        </GlassCard>

        {/* Daily Challenges */}
        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-base font-semibold">Today's challenges</h3>
            <Link to="/journal" className="text-xs text-primary">Journal →</Link>
          </div>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {todays.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Crafting your first challenges"
                message="Ascend is generating today's plan."
              />
            ) : (
              todays.map((c) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  busy={complete.isPending}
                  onComplete={() => complete.mutate(c.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* AI Insight */}
        <GlassCard className="relative overflow-hidden">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-aurora text-white shadow-elegant">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AI insight</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{insightText}</p>
            </div>
          </div>
        </GlassCard>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Flame} label="Streak" value={p?.streak ?? 0} accent="days" />
          <StatTile icon={Zap} label="Total XP" value={p?.xp ?? 0} />
          <StatTile icon={Trophy} label="Completed" value={completed} accent="today" />
          <StatTile icon={TrendingUp} label="Growth" value={p?.longest_streak ?? 0} accent="best" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <QuickTile to="/journal" icon={BookOpen} label="Journal" />
          <QuickTile to="/skills" icon={Trophy} label="Skills" />
          <QuickTile to="/reality-check" icon={Target} label="Reality" />
        </div>
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function QuickTile({
  to,
  icon: Icon,
  label,
}: {
  to: "/journal" | "/skills" | "/reality-check" | "/future-you";
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl glass p-3 text-center transition-transform active:scale-[0.97]"
    >
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <div className="mt-1.5 text-xs font-medium">{label}</div>
    </Link>
  );
}
