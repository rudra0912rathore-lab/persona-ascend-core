import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { MobileShell, PageHeader } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { GlassCard } from "@/components/ascend/GlassCard";
import { ChevronLeft } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/profile.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/edit-profile")({
  head: () => ({ meta: [{ title: "Edit Profile · Ascend AI" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const profileFn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });

  const [username, setUsername] = useState("");
  const [motto, setMotto] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    if (profile.data) {
      setUsername(profile.data.username ?? "");
      setMotto(profile.data.motto ?? "");
      setIdentity(profile.data.future_identity ?? "");
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({ data: { username, motto, future_identity: identity } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
      navigate({ to: "/profile" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const p = profile.data;

  return (
    <MobileShell>
      <PageHeader
        title="Edit Profile"
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
        <GlassCard className="flex flex-col items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full gradient-aurora text-2xl font-bold text-primary-foreground shadow-elegant">
            {(username || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="mt-3 text-sm font-semibold">{username || "Seeker"}</div>
          <div className="text-xs text-muted-foreground">
            Level {p?.level ?? 1} · {p?.class ?? "Seeker"}
          </div>
        </GlassCard>

        <Field label="Full Name">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Alex Johnson"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>
        <Field label="Email">
          <input
            disabled
            value="alex@email.com"
            className="w-full bg-transparent text-base text-muted-foreground outline-none"
          />
        </Field>
        <Field label="Motto">
          <input
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="Build the life you want."
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>
        <Field label="Future Identity">
          <textarea
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            rows={3}
            placeholder="Who do you want to become?"
            className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="w-full rounded-2xl gradient-aurora px-5 py-3.5 text-base font-semibold text-primary-foreground shadow-elegant transition active:scale-[0.98] disabled:opacity-60"
        >
          {save.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <BottomNav />
    </MobileShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl border border-border bg-card px-4 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  );
}
