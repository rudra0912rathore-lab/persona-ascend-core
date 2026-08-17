import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AiOrb } from "@/components/ascend/AiOrb";
import { Sparkles, Code, Dumbbell, Brain, Target, Heart, ArrowRight, Loader2 } from "lucide-react";
import { generateRoadmap } from "@/lib/onboarding.functions";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Begin · Ascend AI" }] }),
  component: Onboarding,
});

const presets = [
  { title: "Become a Game Developer", icon: Code },
  { title: "Get Fit & Strong", icon: Dumbbell },
  { title: "Learn to Code", icon: Brain },
  { title: "Build Unshakable Focus", icon: Target },
  { title: "Build Confidence", icon: Heart },
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [identity, setIdentity] = useState("");
  const profileFn = useServerFn(getProfile);
  const roadmapFn = useServerFn(generateRoadmap);
  const updateFn = useServerFn(updateProfile);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });

  const roadmap = useMutation({
    mutationFn: () => roadmapFn({ data: { future_identity: identity, main_goal: goal } }),
    onSuccess: () => {
      toast.success("Your journey is ready.");
      navigate({ to: "/home", replace: true });
    },
    onError: async (err) => {
      console.error(err);
      // Fallback: still mark onboarded so user can use the app
      await updateFn({
        data: { future_identity: identity, main_goal: goal, onboarded: true },
      });
      toast.error("AI roadmap unavailable — saved your goals.");
      navigate({ to: "/home", replace: true });
    },
  });

  if (profile.data?.onboarded) {
    navigate({ to: "/home", replace: true });
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary-glow/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] lg:max-w-3xl flex-col px-6 py-10">
        {/* Step dots */}
        <div className="mb-6 flex items-center justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 gradient-aurora" : i < step ? "w-1.5 bg-primary/60" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
            <AiOrb size={160} />
            <h1 className="mt-8 text-3xl font-semibold leading-tight">
              Become the person<br />
              <span className="text-gradient-aurora">you want to be</span>
            </h1>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Level up your real life through AI guidance and daily progress.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-10 inline-flex items-center gap-2 rounded-2xl gradient-aurora px-6 py-3.5 text-base font-semibold text-white shadow-elegant active:scale-[0.98]"
            >
              Start your journey <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <h2 className="text-2xl font-semibold">What do you want to ascend toward?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Pick a starting goal. You can grow more later.</p>
            <div className="mt-6 space-y-2.5">
              {presets.map((p) => {
                const Icon = p.icon;
                const selected = goal === p.title;
                return (
                  <button
                    key={p.title}
                    onClick={() => setGoal(p.title)}
                    className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all ${
                      selected
                        ? "gradient-aurora text-white shadow-elegant"
                        : "glass text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate text-sm font-medium">{p.title}</span>
                    {selected ? <Sparkles className="h-4 w-4" /> : null}
                  </button>
                );
              })}
              <input
                value={goal && !presets.find((p) => p.title === goal) ? goal : ""}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Or write your own goal…"
                className="w-full rounded-2xl glass px-4 py-3.5 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
            <button
              disabled={!goal}
              onClick={() => setStep(2)}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-aurora px-6 py-3.5 text-base font-semibold text-white shadow-elegant disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h2 className="text-2xl font-semibold">Who do you want to become?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Write your future identity in one sentence.
            </p>
            <textarea
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              rows={5}
              placeholder="A disciplined indie game developer with a published title and a focused daily routine."
              className="mt-6 w-full rounded-2xl glass p-4 text-base leading-relaxed placeholder:text-muted-foreground/60"
            />
            <button
              disabled={identity.trim().length < 8}
              onClick={() => {
                setStep(3);
                roadmap.mutate();
              }}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-aurora px-6 py-3.5 text-base font-semibold text-white shadow-elegant disabled:opacity-50"
            >
              Build my roadmap <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-up">
            <AiOrb size={180} />
            <h2 className="mt-8 text-2xl font-semibold shimmer-text">
              {roadmap.isPending ? "Designing your path…" : "Almost ready"}
            </h2>
            <div className="mt-6 space-y-2 text-sm">
              <Step done label="Analyzing your goals" />
              <Step done={!roadmap.isPending} active={roadmap.isPending} label="Building roadmap" />
              <Step done={!roadmap.isPending} active={roadmap.isPending} label="Crafting challenges" />
              <Step done={!roadmap.isPending} active={roadmap.isPending} label="Preparing growth profile" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl bg-muted px-4 py-2.5">
      {done ? (
        <Sparkles className="h-4 w-4 text-success" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-white/20" />
      )}
      <span className="truncate text-left">{label}</span>
    </div>
  );
}
