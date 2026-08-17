import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/timeline")({
  head: () => ({ meta: [{ title: "My Timeline · Ascend AI" }] }),
  component: TimelinePage,
});

const events = [
  { year: "2024", title: "Started Journey", desc: "Created your Ascend account" },
  { year: "2024", title: "Goal Achieved", desc: "Read 10 books · Mar 10" },
  { year: "2024", title: "New Habit", desc: "Daily meditation · Apr 5" },
  { year: "2024", title: "100 Days Streak", desc: "Consistency unlocked · May 1" },
];

function TimelinePage() {
  return (
    <MobileShell>
      <PageHeader
        title="My Timeline"
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
        <div className="relative pl-7">
          <span className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
          <div className="space-y-4">
            {events.map((e, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[18px] top-3 grid h-3.5 w-3.5 place-items-center rounded-full gradient-aurora ring-4 ring-background" />
                <GlassCard>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.year}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{e.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{e.desc}</div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
