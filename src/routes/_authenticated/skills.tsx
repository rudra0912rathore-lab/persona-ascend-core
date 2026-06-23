import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { EmptyState } from "@/components/ascend/EmptyState";
import { Trophy } from "lucide-react";
import { listSkills } from "@/lib/data.functions";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skills · Ascend AI" }] }),
  component: SkillsPage,
});

function SkillsPage() {
  const fn = useServerFn(listSkills);
  const skills = useQuery({ queryKey: ["skills"], queryFn: () => fn() });
  const list = skills.data ?? [];

  return (
    <MobileShell>
      <PageHeader title="Skill Hub" subtitle="Your evolving abilities." />

      <div className="px-5 pb-32">
        {list.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No skills yet"
            message="Complete onboarding to unlock your starting skills."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {list.map((s, i) => {
              const pct = Math.min(100, (s.xp % 200) / 2);
              return (
                <GlassCard
                  key={s.id}
                  className="relative overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                  <div className="relative">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.rank}</div>
                    <h3 className="mt-1 truncate text-base font-semibold">{s.name}</h3>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Lv {s.level}</span>
                      <span className="text-primary font-semibold">{s.xp} XP</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full gradient-aurora rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </MobileShell>
  );
}
