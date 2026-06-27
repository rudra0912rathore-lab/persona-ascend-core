import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { themeInitScript, getInitialTheme, type Theme } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-aurora">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Path not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route doesn't exist on your journey yet.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl gradient-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something interrupted you</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Take a breath. Try again, and you'll be right back on track.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl gradient-aurora px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1F1B1A" },
      { title: "Ascend AI — Become the person you want to be" },
      {
        name: "description",
        content:
          "Ascend AI is a personal growth RPG. Turn your goals into a daily journey with AI coaching, challenges, and progression that actually changes your life.",
      },
      { property: "og:title", content: "Ascend AI — Become the person you want to be" },
      {
        property: "og:description",
        content: "AI-powered personal growth RPG. Become the person you want to be.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [{ children: themeInitScript }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    setTheme(getInitialTheme());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ascend-theme" && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    // Re-read after each render cycle (cheap; ensures toaster theme matches)
    const id = setInterval(() => {
      const cur = document.documentElement.classList.contains("light") ? "light" : "dark";
      setTheme((t) => (t === cur ? t : (cur as Theme)));
    }, 800);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster theme={theme} position="top-center" />
    </QueryClientProvider>
  );
}
