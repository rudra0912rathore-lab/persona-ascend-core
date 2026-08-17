import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Crown, Home, Map, BarChart3, User, Sparkles, Settings } from "lucide-react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <DesktopSidebar />
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col lg:max-w-none lg:pl-64">
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 px-5 pt-8 pb-4 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pt-10">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

type NavItem = {
  to: "/home" | "/journey" | "/coach" | "/reports" | "/profile";
  label: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journey", label: "Journey", icon: Map },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
];

function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-aurora text-white shadow-elegant">
          <Crown className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold leading-tight">Ascend AI</div>
          <div className="text-[11px] text-muted-foreground">Level up your real life</div>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
