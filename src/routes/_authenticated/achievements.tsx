import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { Trophy, Lock, Flame, Sunrise, Target, BookOpen, ChevronLeft } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({ meta: [{ title: "Achievements · Ascend AI" }] }),
  component: AchievementsPage,
});

type Tab = "all" | "locked" | "unlocked";

const items = [
  { id: "1", title: "First Step", desc: "Start your journey", icon: Trophy, unlocked: true },
  { id: "2", title: "7-Day Streak", desc: "Consistency wins", icon: Flame, unlocked: true },
  { id: "3", title: "Early Riser", desc: "Wake up early 7 days", icon: Sunrise, unlocked: true },
  { id: "4", title: "Focus Maker", desc: "10 focus sessions", icon: Target, unlocked: false },
  { id: "5", title: "Bookworm", desc: "Read 20 pages 5 days", icon: BookOpen, unlocked: false },
  { id: "6", title: "30-Day Warrior", desc: "Hold a 30-day streak", icon: Flame, unlocked: false },
];

function AchievementsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const filtered = items.filter((i) =>
    tab === "all" ? true : tab === "unlocked" ? i.unlocked : !i.unlocked,
  );

  return (
    <MobileShell>
      <PageHeader
        title="Achievements"
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
      <div className="px-5 pb-32 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12">
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1">
          {(["all", "locked", "unlocked"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? "gradient-aurora text-primary-foreground shadow-elegant"
                  : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((a) => {
            const Icon = a.icon;
            return (
              <GlassCard key={a.id}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-2xl ${
                      a.unlocked
                        ? "gradient-aurora text-primary-foreground shadow-elegant"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                  {a.unlocked ? (
                    <span className="rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Unlocked
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Locked
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
