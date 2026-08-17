import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Map, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { EmptyState } from "@/components/ascend/EmptyState";
import { listMilestones, getMainGoal } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/journey")({
  head: () => ({ meta: [{ title: "Journey · Ascend AI" }] }),
  component: JourneyPage,
});

function JourneyPage() {
  const milestonesFn = useServerFn(listMilestones);
  const goalFn = useServerFn(getMainGoal);
  const goal = useQuery({ queryKey: ["goal"], queryFn: () => goalFn() });
  const milestones = useQuery({ queryKey: ["milestones"], queryFn: () => milestonesFn() });

  const list = milestones.data ?? [];

  return (
    <MobileShell>
      <PageHeader title="Your Journey" subtitle={goal.data?.title ?? "Your roadmap to the future you."} />

      <div className="flex-1 px-5 pb-32 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12">
        {list.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No milestones yet"
            message="Complete onboarding to generate your path."
            action={
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center rounded-2xl gradient-aurora px-5 py-2.5 text-sm font-semibold text-white shadow-elegant"
              >
                Build my roadmap
              </Link>
            }
          />
        ) : (
          <div className="relative pl-7">
            {/* Spine */}
            <div className="pointer-events-none absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/80 via-primary/30 to-transparent" />
            <ol className="space-y-4">
              {list.map((m, i) => {
                const done = !!m.completed_at;
                return (
                  <li key={m.id} className="relative animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <span
                      className={`absolute -left-[18px] top-4 grid h-6 w-6 place-items-center rounded-full ${
                        done ? "bg-success text-background" : "gradient-aurora text-white shadow-glow"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3 w-3" />}
                    </span>
                    <GlassCard>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Milestone {i + 1}
                          </div>
                          <h3 className="mt-1 text-base font-semibold">{m.title}</h3>
                          {m.description ? (
                            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{m.description}</p>
                          ) : null}
                          {m.estimated_date ? (
                            <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(m.estimated_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          +{m.reward_xp} XP
                        </div>
                      </div>
                    </GlassCard>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileShell>
  );
}
