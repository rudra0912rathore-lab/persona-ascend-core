import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings as Cog,
  Shield,
  Palette,
  Lock,
  HelpCircle,
  User as UserIcon,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_authenticated/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings · Ascend AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [theme, , toggleTheme] = useTheme();
  const isDark = theme === "dark";

  const groups: {
    label: string;
    items: { icon: typeof Cog; label: string; to?: string; right?: React.ReactNode }[];
  }[] = [
    {
      label: "General",
      items: [
        { icon: Cog, label: "Settings" },
        { icon: UserIcon, label: "Account", to: "/edit-profile" },
        { icon: Bell, label: "Notifications", to: "/notifications" },
        { icon: Palette, label: "Preferences" },
      ],
    },
    {
      label: "Security",
      items: [
        { icon: Lock, label: "Privacy" },
        { icon: Shield, label: "Help & Support" },
      ],
    },
  ];

  return (
    <MobileShell>
      <PageHeader
        title="Settings"
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
      <div className="space-y-5 px-5 pb-32">
        {groups.map((g) => (
          <section key={g.label}>
            <h3 className="mb-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              {g.label}
            </h3>
            <GlassCard className="divide-y divide-border p-0">
              {g.items.map((it) => {
                const Icon = it.icon;
                const inner = (
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-muted text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate text-sm font-medium">{it.label}</span>
                    {it.right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                );
                return it.to ? (
                  <Link key={it.label} to={it.to as never}>
                    {inner}
                  </Link>
                ) : (
                  <div key={it.label}>{inner}</div>
                );
              })}
            </GlassCard>
          </section>
        ))}

        <section>
          <h3 className="mb-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Appearance
          </h3>
          <GlassCard>
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-muted">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">Dark Mode</div>
                <div className="text-xs text-muted-foreground">
                  {isDark ? "Warm dark theme" : "Warm cream theme"}
                </div>
              </div>
              <button
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  isDark ? "gradient-aurora" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 grid h-6 w-6 place-items-center rounded-full bg-card shadow-card transition-all ${
                    isDark ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </GlassCard>
        </section>

        <GlassCard className="text-center">
          <HelpCircle className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-xs text-muted-foreground">Ascend AI · v1.0</p>
        </GlassCard>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
