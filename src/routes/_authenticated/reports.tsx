import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar,
} from "recharts";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { StatTile } from "@/components/ascend/StatTile";
import { Flame, Trophy, Zap, Calendar } from "lucide-react";
import { getProfile } from "@/lib/profile.functions";
import { listTodaysChallenges } from "@/lib/challenges.functions";
import { listJournalEntries } from "@/lib/journal.functions";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports · Ascend AI" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const profileFn = useServerFn(getProfile);
  const challengesFn = useServerFn(listTodaysChallenges);
  const journalFn = useServerFn(listJournalEntries);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const challenges = useQuery({ queryKey: ["challenges"], queryFn: () => challengesFn() });
  const journal = useQuery({ queryKey: ["journal"], queryFn: () => journalFn() });

  // Build a synthetic last-7-day chart from challenge completed_at
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const daily = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const xp = (challenges.data ?? [])
      .filter((c) => c.completed_at && c.completed_at.slice(0, 10) === key)
      .reduce((sum, c) => sum + (c.xp_reward ?? 0), 0);
    const done = (challenges.data ?? []).filter(
      (c) => c.completed_at && c.completed_at.slice(0, 10) === key,
    ).length;
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      xp,
      done,
    };
  });

  const totalCompleted = (challenges.data ?? []).filter((c) => c.completed_at).length;

  return (
    <MobileShell>
      <PageHeader title="Reports" subtitle="Monthly evolution at a glance." />

      <div className="space-y-4 px-5 pb-32 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Zap} label="Total XP" value={profile.data?.xp ?? 0} />
          <StatTile icon={Flame} label="Streak" value={profile.data?.streak ?? 0} accent="days" />
          <StatTile icon={Trophy} label="Completed" value={totalCompleted} accent="all time" />
          <StatTile icon={Calendar} label="Journal" value={journal.data?.length ?? 0} accent="entries" />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
        <GlassCard>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold">XP earned · last 7 days</h3>
            <span className="text-xs text-muted-foreground">{daily.reduce((s, d) => s + d.xp, 0)} XP</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "#A3A3A3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A3A3A3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #262626", borderRadius: 12 }}
                  labelStyle={{ color: "#A3A3A3" }}
                />
                <Area type="monotone" dataKey="xp" stroke="#7B61FF" strokeWidth={2.4} fill="url(#xpFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Challenges completed</h3>
            <span className="text-xs text-muted-foreground">{daily.reduce((s, d) => s + d.done, 0)} this week</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#A3A3A3", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A3A3A3", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1C1C1C", border: "1px solid #262626", borderRadius: 12 }}
                  labelStyle={{ color: "#A3A3A3" }}
                />
                <Bar dataKey="done" fill="#5A8DFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        </div>

        <GlassCard>
          <h3 className="mb-3 text-sm font-semibold">This month's evolution</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You've earned <span className="font-semibold text-foreground">{profile.data?.xp ?? 0} XP</span>, hit a{" "}
            <span className="font-semibold text-foreground">{profile.data?.longest_streak ?? 0} day</span> best streak, and
            reached <span className="font-semibold text-foreground">Level {profile.data?.level ?? 1}</span> as a{" "}
            <span className="font-semibold text-foreground">{profile.data?.class ?? "Seeker"}</span>.
          </p>
        </GlassCard>
      </div>

      <BottomNav />
    </MobileShell>
  );
}
