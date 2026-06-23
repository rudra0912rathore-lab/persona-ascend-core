import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { Send, Sparkles } from "lucide-react";
import { listJournalEntries, createJournalEntry } from "@/lib/journal.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal · Ascend AI" }] }),
  component: JournalPage,
});

const MOODS = [
  { e: "😊", k: "happy" },
  { e: "😐", k: "neutral" },
  { e: "😔", k: "down" },
  { e: "😤", k: "frustrated" },
  { e: "😴", k: "tired" },
];

function JournalPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listJournalEntries);
  const createFn = useServerFn(createJournalEntry);
  const entries = useQuery({ queryKey: ["journal"], queryFn: () => listFn() });

  const [mood, setMood] = useState("neutral");
  const [body, setBody] = useState("");

  const create = useMutation({
    mutationFn: () => createFn({ data: { mood, body } }),
    onSuccess: () => {
      setBody("");
      toast.success("Entry saved");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  return (
    <MobileShell>
      <PageHeader
        title="Journal"
        subtitle="A daily moment of reflection."
        right={<Link to="/home" className="text-xs text-primary">Done</Link>}
      />

      <div className="space-y-4 px-5 pb-32">
        <GlassCard>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mood</div>
          <div className="mt-3 flex justify-between">
            {MOODS.map((m) => (
              <button
                key={m.k}
                onClick={() => setMood(m.k)}
                className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-all ${
                  mood === m.k ? "gradient-aurora shadow-elegant scale-110" : "bg-white/5"
                }`}
                aria-label={m.k}
              >
                {m.e}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind today?"
            rows={8}
            className="min-h-[180px] w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted-foreground/60"
          />
        </GlassCard>

        <button
          onClick={() => create.mutate()}
          disabled={!body.trim() || create.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-aurora px-5 py-3.5 text-base font-semibold text-white shadow-elegant disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {create.isPending ? "Saving & analyzing…" : "Save entry"}
        </button>

        <section className="space-y-3 pt-2">
          <h3 className="px-1 text-sm font-semibold">Recent</h3>
          {(entries.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Your journey begins today.</p>
          ) : (
            (entries.data ?? []).map((e) => {
              const sum = e.ai_summary as { positive_patterns?: string[]; weak_patterns?: string[]; tomorrow_focus?: string } | null;
              return (
                <GlassCard key={e.id}>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <div className="text-2xl">
                      {MOODS.find((m) => m.k === e.mood)?.e ?? "🙂"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed line-clamp-4">{e.body}</p>
                      {sum?.tomorrow_focus ? (
                        <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs leading-relaxed">
                          <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
                          Tomorrow: {sum.tomorrow_focus}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </section>
      </div>

      <BottomNav />
    </MobileShell>
  );
}
