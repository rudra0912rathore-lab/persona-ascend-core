import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft, Bell, Flame, Sparkles, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Ascend AI" }] }),
  component: NotificationsPage,
});

const groups = [
  {
    label: "Today",
    items: [
      { id: "a", icon: Bell, title: "Challenge Reminder", desc: "Walk 7,000 steps", time: "2h", dot: true },
      { id: "b", icon: Sparkles, title: "New Insight", desc: "Check your dashboard", time: "5h" },
      { id: "c", icon: Flame, title: "Daily Streak", desc: "Keep it up!", time: "1d" },
      { id: "d", icon: Trophy, title: "Goal Completed", desc: "Great work!", time: "2d" },
    ],
  },
  {
    label: "Earlier",
    items: [
      { id: "e", icon: Sparkles, title: "New Comment", desc: "Someone liked your post", time: "3d" },
    ],
  },
];

function NotificationsPage() {
  return (
    <MobileShell>
      <PageHeader
        title="Notifications"
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
      <div className="space-y-5 px-5 pb-32">
        {groups.map((g) => (
          <section key={g.label}>
            <h3 className="mb-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              {g.label}
            </h3>
            <div className="space-y-2.5">
              {g.items.map((n) => {
                const Icon = n.icon;
                return (
                  <GlassCard key={n.id}>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="h-4 w-4" />
                        {n.dot && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{n.title}</div>
                        <div className="truncate text-xs text-muted-foreground">{n.desc}</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{n.time}</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
