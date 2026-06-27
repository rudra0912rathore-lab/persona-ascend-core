import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AiOrb } from "@/components/ascend/AiOrb";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Ascend AI" },
      { name: "description", content: "Sign in to begin your personal growth journey with Ascend AI." },
      { property: "og:title", content: "Sign in · Ascend AI" },
      { property: "og:description", content: "Become the person you want to be." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Ascend.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/home", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary-glow/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 py-10">
        <div className="mt-6 flex flex-col items-center text-center">
          <AiOrb size={120} />
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            <span className="text-gradient-aurora">Ascend</span> AI
          </h1>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Become the person you want to be. AI guidance, daily progress, real change.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-4 rounded-3xl glass p-5 shadow-card">
          <div className="flex rounded-2xl bg-white/5 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl px-3 py-2 transition-all ${
                mode === "signup" ? "gradient-aurora text-white shadow-elegant" : "text-muted-foreground"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-xl px-3 py-2 transition-all ${
                mode === "signin" ? "gradient-aurora text-white shadow-elegant" : "text-muted-foreground"
              }`}
            >
              Sign in
            </button>
          </div>

          {mode === "signup" && (
            <Field label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Alex"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ascend.ai"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-aurora px-5 py-3.5 text-base font-semibold text-white shadow-elegant transition active:scale-[0.98] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {mode === "signup" ? "Start your journey" : "Continue"}
          </button>

          <div className="relative my-1 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground/70">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) throw result.error;
                if (result.redirected) return;
                navigate({ to: "/home", replace: true });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Google sign-in failed");
                setBusy(false);
              }
            }}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-base font-semibold text-neutral-900 shadow-elegant transition active:scale-[0.98] disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>


        <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          By continuing you accept the path of growth.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl bg-white/5 px-4 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </label>
  );
}


function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8L6.2 33C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

