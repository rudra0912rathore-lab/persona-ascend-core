import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [{ title: "Friends · Ascend AI" }] }),
  component: FriendsPage,
});

const friends = [
  { id: "1", name: "Mike Johnson", level: 12, online: true },
  { id: "2", name: "Sarah Lee", level: 10, online: true },
  { id: "3", name: "Alex Brown", level: 9, online: false },
  { id: "4", name: "James Doe", level: 8, online: false },
];

function FriendsPage() {
  const [tab, setTab] = useState<"all" | "online">("all");
  const list = friends.filter((f) => (tab === "online" ? f.online : true));
  return (
    <MobileShell>
      <PageHeader
        title="Friends"
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
      <div className="px-5 pb-32 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-10 lg:pb-12">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
            {(["all", "online"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all ${
                  tab === t
                    ? "gradient-aurora text-primary-foreground shadow-elegant"
                    : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-2xl gradient-aurora px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-elegant">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

        <label className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="space-y-3">
          {list.map((f) => (
            <GlassCard key={f.id}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-muted text-sm font-semibold">
                    {f.name.slice(0, 1)}
                  </div>
                  {f.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground">Level {f.level}</div>
                </div>
                <button className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
                  View
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
