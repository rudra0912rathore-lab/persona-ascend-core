import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { AiOrb } from "@/components/ascend/AiOrb";
import { Sparkles, Loader2 } from "lucide-react";
import { generateFutureYou } from "@/lib/insights.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/future-you")({
  head: () => ({ meta: [{ title: "Future You · Ascend AI" }] }),
  component: FutureYou,
});

type Output = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof generateFutureYou>>>>;

const ROWS: Array<{ key: keyof Output["current_path"]; label: string }> = [
  { key: "habits", label: "Habits" },
  { key: "skills", label: "Skills" },
  { key: "confidence", label: "Confidence" },
  { key: "career", label: "Career" },
  { key: "health", label: "Health" },
  { key: "financial", label: "Financial" },
];

function FutureYou() {
  const fn = useServerFn(generateFutureYou);
  const [data, setData] = useState<Output | null>(null);
  const mut = useMutation({
    mutationFn: () => fn(),
    onSuccess: (d) => setData(d),
    onError: () => toast.error("AI unavailable right now."),
  });

  return (
    <MobileShell>
      <PageHeader title="Future You" subtitle="Two paths · twelve months out." />

      <div className="space-y-4 px-5 pb-32 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12">
        {!data && (
          <GlassCard glow className="text-center">
            <div className="mx-auto"><AiOrb size={120} /></div>
            <h3 className="mt-5 text-base font-semibold">See where you'll be</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              An AI projection of your current path vs your improved path, based on your activity.
            </p>
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl gradient-aurora px-6 py-3 text-sm font-semibold text-white shadow-elegant disabled:opacity-50"
            >
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {mut.isPending ? "Projecting…" : "Generate projection"}
            </button>
          </GlassCard>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl glass p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">If nothing changes</div>
                <div className="mt-1 text-sm font-semibold">Current path</div>
              </div>
              <div className="rounded-2xl gradient-aurora p-3 text-center text-white shadow-elegant">
                <div className="text-[10px] uppercase tracking-wider text-white/80">If you stay consistent</div>
                <div className="mt-1 text-sm font-semibold">Improved path</div>
              </div>
            </div>

            {ROWS.map((row) => (
              <GlassCard key={row.key}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">{data.current_path[row.key]}</div>
                  <div className="text-gradient-aurora font-medium">{data.improved_path[row.key]}</div>
                </div>
              </GlassCard>
            ))}
            <p className="text-center text-[11px] text-muted-foreground">
              AI projection · for motivation, not a guarantee.
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </MobileShell>
  );
}
