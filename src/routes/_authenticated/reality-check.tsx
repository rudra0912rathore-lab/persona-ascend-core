import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { AiOrb } from "@/components/ascend/AiOrb";
import { Sparkles, Target, AlertTriangle, Zap, Loader2 } from "lucide-react";
import { generateRealityCheck } from "@/lib/insights.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reality-check")({
  head: () => ({ meta: [{ title: "Reality Check · Ascend AI" }] }),
  component: RealityCheck,
});

type Output = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof generateRealityCheck>>>>;

function RealityCheck() {
  const fn = useServerFn(generateRealityCheck);
  const [data, setData] = useState<Output | null>(null);
  const mut = useMutation({
    mutationFn: () => fn(),
    onSuccess: (d) => setData(d),
    onError: () => toast.error("AI unavailable right now."),
  });

  return (
    <MobileShell>
      <PageHeader title="Reality Check" subtitle="An honest weekly look at your patterns." />

      <div className="space-y-4 px-5 pb-32">
        {!data && (
          <GlassCard glow className="text-center">
            <div className="mx-auto"><AiOrb size={120} /></div>
            <h3 className="mt-5 text-base font-semibold">Run this week's check-in</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ascend analyzes your challenges, journal, and growth to surface what really matters.
            </p>
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl gradient-aurora px-6 py-3 text-sm font-semibold text-white shadow-elegant disabled:opacity-50"
            >
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {mut.isPending ? "Analyzing…" : "Generate"}
            </button>
          </GlassCard>
        )}

        {data && (
          <>
            <Section title="What went well" icon={Zap}>
              <ul className="space-y-2 text-sm">
                {data.what_went_well.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </Section>
            <Section title="What held you back" icon={AlertTriangle}>
              <ul className="space-y-2 text-sm">
                {data.what_held_you_back.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </Section>
            <Section title="Repeating pattern" icon={Target}>
              <p className="text-sm">{data.repeating_pattern}</p>
            </Section>
            <Section title="Root cause" icon={AlertTriangle}>
              <p className="text-sm">{data.root_cause}</p>
            </Section>
            <Section title="Action plan" icon={Sparkles}>
              <ol className="space-y-2 text-sm">
                {data.action_plan.map((s, i) => <li key={i}>{i + 1}. {s}</li>)}
              </ol>
            </Section>
            <GlassCard glow>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next week's mission</div>
              <p className="mt-2 text-base font-semibold text-gradient-aurora">{data.next_week_mission}</p>
            </GlassCard>
          </>
        )}
      </div>

      <BottomNav />
    </MobileShell>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <GlassCard>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <div className="text-foreground/90">{children}</div>
    </GlassCard>
  );
}
