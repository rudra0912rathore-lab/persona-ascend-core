import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { XpBar } from "@/components/ascend/XpBar";
import { Trophy, Sparkles, LogOut, Share2, Target, BookOpen, Map } from "lucide-react";
import { getProfile } from "@/lib/profile.functions";
import { listAchievements } from "@/lib/data.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · Ascend AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const profileFn = useServerFn(getProfile);
  const achFn = useServerFn(listAchievements);
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const ach = useQuery({ queryKey: ["achievements"], queryFn: () => achFn() });
  const p = profile.data;

  async function shareCard() {
    if (!p) return;
    const text = `I'm Level ${p.level} ${p.class} on Ascend AI — ${p.streak}-day streak, ${p.xp} XP. Building toward: ${p.future_identity ?? p.main_goal ?? "my best self"}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ascend AI", text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Growth card copied");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <MobileShell>
      <PageHeader title="Profile" />

      <div className="space-y-4 px-5 pb-32">
        {/* Identity card */}
        <GlassCard glow className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-aurora text-xl font-bold text-white shadow-elegant">
              {(p?.username ?? "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold">{p?.username ?? "Seeker"}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Level {p?.level ?? 1} · {p?.rank ?? "Novice"} · {p?.class ?? "Seeker"}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <XpBar xp={p?.xp ?? 0} />
          </div>
        </GlassCard>

        {/* Growth card */}
        <GlassCard>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Growth card</div>
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
              aria-label="Share growth card"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-aurora text-white shadow-elegant"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <SubLink to="/journey" icon={Map} label="Journey" />
          <SubLink to="/skills" icon={Trophy} label="Skills" />
          <SubLink to="/journal" icon={BookOpen} label="Journal" />
          <SubLink to="/reality-check" icon={Target} label="Reality" />
          <SubLink to="/future-you" icon={Sparkles} label="Future You" />
        </div>

        {/* Achievements */}
        <section>
          <h3 className="mb-3 px-1 text-sm font-semibold">Achievements</h3>
          {(ach.data ?? []).length === 0 ? (
            <GlassCard className="text-center">
              <Trophy className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No achievements yet. Keep going.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {(ach.data ?? []).map((a) => (
                <GlassCard key={a.id} className="text-center">
                  <Trophy className="mx-auto h-6 w-6 text-primary" />
                  <div className="mt-2 text-sm font-semibold">{a.title}</div>
                  {a.description ? (
                    <div className="mt-1 text-xs text-muted-foreground">{a.description}</div>
                  ) : null}
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={signOut}
          className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl glass px-4 py-3.5 text-sm font-medium text-destructive"
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
    <div className="rounded-xl bg-white/5 px-2 py-2 text-center">
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
  to: "/journey" | "/skills" | "/journal" | "/reality-check" | "/future-you";
  icon: typeof Trophy;
  label: string;
}) {
  return (
    <Link to={to} className="rounded-2xl glass p-3 text-center transition-transform active:scale-[0.97]">
      <Icon className="mx-auto h-5 w-5 text-primary" />
      <div className="mt-1.5 text-xs font-medium">{label}</div>
    </Link>
  );
}
