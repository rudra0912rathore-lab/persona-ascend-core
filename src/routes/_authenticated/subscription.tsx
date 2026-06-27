import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/subscription")({
  head: () => ({ meta: [{ title: "Ascend Premium · Ascend AI" }] }),
  component: SubscriptionPage,
});

const perks = [
  "Advanced Coaching",
  "Detailed Reports",
  "Unlimited Journals",
  "Priority Support",
  "Early Access",
];

function SubscriptionPage() {
  return (
    <MobileShell>
      <PageHeader
        title="Subscription"
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
      <div className="space-y-4 px-5 pb-32">
        <GlassCard glow className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">Ascend Premium</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlock your full potential.
            </p>
            <ul className="mt-4 space-y-2.5">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-full gradient-aurora text-primary-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold">
              $9.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Cancel anytime</p>
          </div>
        </GlassCard>

        <button className="w-full rounded-2xl gradient-aurora px-5 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition active:scale-[0.98]">
          Upgrade Now
        </button>
        <button className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base font-semibold transition active:scale-[0.98]">
          Restore Purchase
        </button>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
