import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft, Crown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard · Ascend AI" }] }),
  component: LeaderboardPage,
});

const users = [
  { id: "1", name: "Mike Johnson", xp: 82400, level: 24 },
  { id: "2", name: "Sarah Lee", xp: 57760, level: 19 },
  { id: "3", name: "Alex Brown", xp: 28120, level: 12 },
  { id: "4", name: "Olivia Martin", xp: 24010, level: 11 },
  { id: "5", name: "Brian Turner", xp: 19850, level: 9 },
];

function LeaderboardPage() {
  const [scope, setScope] = useState<"global" | "friends">("global");
  return (
    <MobileShell>
      <PageHeader
        title="Leaderboard"
        right={
          <Link
            to="/profile"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        }
      />
      <div className="px-5 pb-32">
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
          {(["global", "friends"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all ${
                scope === s
                  ? "gradient-aurora text-primary-foreground shadow-elegant"
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {users.map((u, i) => (
            <GlassCard key={u.id}>
              <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "gradient-aurora text-primary-foreground shadow-elegant"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                </span>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-semibold">
                  {u.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.xp.toLocaleString()} XP</div>
                </div>
                <div className="text-xs font-semibold text-primary">Lvl {u.level}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">Top 1% this month</p>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
