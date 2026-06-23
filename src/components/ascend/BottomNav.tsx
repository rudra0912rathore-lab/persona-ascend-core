import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, BarChart3, User, Sparkles } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journey", label: "Journey", icon: Map },
  { to: "/coach", label: "Coach", icon: Sparkles, primary: true },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-0 z-30 mt-auto safe-bottom">
      <div className="relative mx-3 mb-3 rounded-3xl glass-strong shadow-card">
        <div className="grid grid-cols-5 px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            if (item.primary) {
              return (
                <div key={item.to} className="relative flex items-center justify-center">
                  <Link
                    to={item.to}
                    aria-label={item.label}
                    className="-mt-7 grid h-14 w-14 place-items-center rounded-full gradient-aurora text-white shadow-elegant animate-glow-pulse"
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.2} />
                  </Link>
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors"
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={2}
                />
                <span className={active ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
