import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { XpBar } from "@/components/ascend/XpBar";
import {
  Trophy,
  Sparkles,
  LogOut,
  Share2,
  Target,
  BookOpen,
  Map,
  Users,
  Crown,
  Bell,
  Settings as Cog,
  Clock,
  Pencil,
  Sun,
  Moon,
} from "lucide-react";
import { getProfile } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shareGrowthCard } from "@/lib/growth-card";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile · Ascend AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const profileFn = useServerFn(getProfile);
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const p = profile.data;
  const [sharing, setSharing] = useState(false);
  const [theme, , toggleTheme] = useTheme();
  const isDark = theme === "dark";

  async function shareCard() {
    if (!p || sharing) return;
    setSharing(true);
    try {
      const result = await shareGrowthCard({
        username: p.username ?? "Seeker",
        level: p.level ?? 1,
        rank: p.rank ?? "Novice",
        cls: p.class ?? "Seeker",
        xp: p.xp ?? 0,
        streak: p.streak ?? 0,
        longestStreak: p.longest_streak ?? 0,
        goal: p.main_goal ?? "",
        futureIdentity: p.future_identity ?? "",
      });
      toast.success(result === "shared" ? "Growth card shared" : "Growth card saved");
    } catch (e) {
      toast.error("Couldn't share growth card");
      console.error(e);
    } finally {
      setSharing(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/welcome", replace: true });
  }

  return (
    <MobileShell>
      <PageHeader
        title="Profile"
        right={
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        }
      />

      <div className="space-y-4 px-5 pb-32">
        {/* Identity */}
        <GlassCard glow className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-aurora text-xl font-bold text-primary-foreground shadow-elegant">
              {(p?.username ?? "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold">{p?.username ?? "Seeker"}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Level {p?.level ?? 1} · {p?.rank ?? "Novice"} · {p?.class ?? "Seeker"}
              </div>
            </div>
            <Link
              to="/edit-profile"
              aria-label="Edit profile"
              className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4">
            <XpBar xp={p?.xp ?? 0} />
          </div>
        </GlassCard>

        {/* Growth card share */}
        <GlassCard>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Growth card
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {p?.future_identity ?? "Define your future identity in the Coach."}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                <Mini label="Streak" value={`${p?.streak ?? 0}d`} />
                <Mini label="Best" value={`${p?.longest_streak ?? 0}d`} />
                <Mini label="XP" value={p?.xp ?? 0} />
              </div>
            </div>
            <button
              onClick={shareCard}
              disabled={sharing}
              aria-label="Share growth card"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-aurora text-primary-foreground shadow-elegant transition-transform active:scale-95 disabled:opacity-60"
            >
              <Share2 className={`h-4 w-4 ${sharing ? "animate-pulse" : ""}`} />
            </button>
          </div>
        </GlassCard>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <SubLink to="/achievements" icon={Trophy} label="Achievements" />
          <SubLink to="/leaderboard" icon={Crown} label="Leaderboard" />
          <SubLink to="/friends" icon={Users} label="Friends" />
          <SubLink to="/timeline" icon={Clock} label="Timeline" />
          <SubLink to="/notifications" icon={Bell} label="Notifs" />
          <SubLink to="/subscription" icon={Sparkles} label="Premium" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SubLink to="/journey" icon={Map} label="Journey" />
          <SubLink to="/journal" icon={BookOpen} label="Journal" />
          <SubLink to="/reality-check" icon={Target} label="Reality" />
        </div>

        <Link
          to="/settings"
          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium"
        >
          <Cog className="h-4 w-4" />
          <span className="text-left">Settings</span>
          <span className="text-xs text-muted-foreground">›</span>
        </Link>

        <button
          onClick={signOut}
          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-destructive"
        >
          <LogOut className="h-4 w-4" /> <span className="text-left">Sign out</span>
        </button>
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function SubLink({
  to,
  icon: Icon,
  label,
}: {
  to:
    | "/journey"
    | "/skills"
    | "/journal"
    | "/reality-check"
    | "/future-you"
    | "/achievements"
    | "/leaderboard"
    | "/friends"
    | "/timeline"
    | "/notifications"
    | "/subscription";
  icon: typeof Trophy;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-border bg-card p-3 text-center transition-transform active:scale-[0.97]"
    >
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <div className="mt-1.5 text-xs font-medium">{label}</div>
    </Link>
  );
}
