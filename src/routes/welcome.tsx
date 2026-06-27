import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { MountainBackdrop } from "./index";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Welcome · Ascend AI" },
      { name: "description", content: "Your future self starts today. Build habits, track progress, and become the best version of you." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <MountainBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pt-14 pb-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
          <Sparkles className="h-4 w-4 text-primary" />
          ASCEND AI
        </div>

        <div className="mt-12 max-w-xs">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight animate-fade-up">
            Your future self<br />starts today.
          </h1>
          <p
            className="mt-4 text-sm text-muted-foreground animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Build habits, track progress, and become the best version of you.
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <button
            onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as never })}
            className="w-full rounded-2xl gradient-aurora px-5 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition active:scale-[0.98]"
          >
            Get Started
          </button>
          <Link
            to="/auth"
            className="block w-full rounded-2xl border border-border bg-card px-5 py-4 text-center text-base font-semibold text-foreground transition active:scale-[0.98]"
          >
            Log In
          </Link>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <SocialBtn
              label="Google"
              icon={<GoogleIcon />}
              onClick={() => navigate({ to: "/auth" })}
            />
            <SocialBtn
              label="Apple"
              icon={<AppleIcon />}
              onClick={() => navigate({ to: "/auth" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition active:scale-[0.98]"
    >
      {icon}
      <span>Continue with {label}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8L6.2 33C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.4 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 384 512" aria-hidden="true" className="fill-current">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM251.8 76.7c19.2-22.8 17.4-43.6 16.8-51.1-16.9 1-36.4 11.5-47.5 24.5-12.2 14-19.4 31.3-17.9 50.7 18.3 1.4 35-8 48.6-24.1z" />
    </svg>
  );
}
