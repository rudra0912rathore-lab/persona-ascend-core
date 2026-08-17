import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SplashPage,
});

function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/home", replace: true });
      } else {
        navigate({ to: "/welcome", replace: true });
      }
    }, 1400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <MountainBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] lg:max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center gap-2 animate-fade-up">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-3xl font-bold tracking-tight">
            <span className="text-gradient-aurora">ASCEND</span> AI
          </span>
        </div>
        <p
          className="mt-3 text-sm text-muted-foreground animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          Become the person you want to be.
        </p>
        <div
          className="mt-12 h-1 w-24 overflow-hidden rounded-full bg-muted animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <div className="h-full w-1/2 gradient-aurora shimmer-bar" />
        </div>
      </div>
      <style>{`
        @keyframes splash-bar { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        .shimmer-bar { animation: splash-bar 1.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export function MountainBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-90">
      <svg viewBox="0 0 430 400" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="m1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="m2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.30" />
          </linearGradient>
        </defs>
        <g className="text-muted-foreground">
          <path d="M0 280 L80 200 L140 240 L220 160 L300 220 L380 180 L430 200 L430 400 L0 400 Z" fill="url(#m1)" />
        </g>
        <g className="text-foreground">
          <path d="M0 340 L60 290 L120 320 L180 260 L240 310 L300 280 L360 320 L430 290 L430 400 L0 400 Z" fill="url(#m2)" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
