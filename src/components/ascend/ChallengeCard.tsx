import { Check, Clock, Flame, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Challenge = {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard" | string;
  xp_reward: number;
  impact: string;
  est_minutes: number;
  completed_at: string | null;
};

const diffColor: Record<string, string> = {
  easy: "text-success",
  medium: "text-primary",
  hard: "text-warning",
};

export function ChallengeCard({
  challenge,
  onComplete,
  busy,
}: {
  challenge: Challenge;
  onComplete: () => void;
  busy?: boolean;
}) {
  const [exploding, setExploding] = useState(false);
  const completed = !!challenge.completed_at;

  function handleClick() {
    if (completed || busy) return;
    setExploding(true);
    onComplete();
    setTimeout(() => setExploding(false), 1400);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl glass p-4 shadow-card transition-all",
        completed && "opacity-60",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{challenge.name}</div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {challenge.est_minutes}m
            </span>
            <span className={cn("inline-flex items-center gap-1 font-medium", diffColor[challenge.difficulty] ?? "text-muted-foreground")}>
              <Flame className="h-3.5 w-3.5" /> {challenge.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-primary">
              <Zap className="h-3.5 w-3.5" /> +{challenge.xp_reward}
            </span>
          </div>
        </div>
        <button
          onClick={handleClick}
          disabled={completed || busy}
          aria-label="Complete challenge"
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all",
            completed
              ? "bg-success/15 text-success"
              : "gradient-aurora text-white shadow-elegant active:scale-95",
          )}
        >
          <Check className="h-5 w-5" strokeWidth={2.6} />
        </button>
      </div>

      {exploding && (
        <>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary animate-xp-fly">
            +{challenge.xp_reward} XP
          </span>
          <span className="pointer-events-none absolute inset-0 rounded-3xl bg-primary/10 animate-fade-up" />
        </>
      )}
    </div>
  );
}
