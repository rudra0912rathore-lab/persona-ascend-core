import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listTodaysChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("challenges")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const completeChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: profile, error } = await context.supabase.rpc("complete_challenge", {
      _challenge_id: data.id,
    });
    if (error) throw new Error(error.message);
    return profile;
  });

export const seedStarterChallenges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing } = await context.supabase
      .from("challenges")
      .select("id")
      .eq("user_id", context.userId)
      .limit(1);
    if (existing && existing.length > 0) return { seeded: false };

    const starter = [
      { name: "10 minute focused meditation", difficulty: "easy", xp_reward: 30, est_minutes: 10, impact: "medium" },
      { name: "Plan tomorrow's top 3 priorities", difficulty: "easy", xp_reward: 40, est_minutes: 10, impact: "high" },
      { name: "Deep work block: 45 minutes", difficulty: "medium", xp_reward: 80, est_minutes: 45, impact: "high" },
      { name: "Move your body for 20 minutes", difficulty: "medium", xp_reward: 60, est_minutes: 20, impact: "medium" },
    ];
    const rows = starter.map((c) => ({ ...c, user_id: context.userId, source: "seed" }));
    const { error } = await context.supabase.from("challenges").insert(rows);
    if (error) throw new Error(error.message);
    return { seeded: true };
  });

export const addCustomChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; difficulty?: string; est_minutes?: number; xp_reward?: number }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("challenges").insert({
      user_id: context.userId,
      name: data.name,
      difficulty: data.difficulty ?? "medium",
      est_minutes: data.est_minutes ?? 15,
      xp_reward: data.xp_reward ?? 50,
      impact: "medium",
      source: "user",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
