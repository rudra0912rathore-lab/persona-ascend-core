import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const RealityCheckSchema = z.object({
  what_went_well: z.array(z.string()).min(1).max(4),
  what_held_you_back: z.array(z.string()).min(1).max(4),
  repeating_pattern: z.string(),
  root_cause: z.string(),
  action_plan: z.array(z.string()).min(2).max(5),
  next_week_mission: z.string(),
});

const FutureYouSchema = z.object({
  current_path: z.object({
    habits: z.string(),
    skills: z.string(),
    confidence: z.string(),
    career: z.string(),
    health: z.string(),
    financial: z.string(),
  }),
  improved_path: z.object({
    habits: z.string(),
    skills: z.string(),
    confidence: z.string(),
    career: z.string(),
    health: z.string(),
    financial: z.string(),
  }),
});

async function gatherUserContext(supabase: any, userId: string) {
  const [profile, challenges, journal] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("challenges")
      .select("name, completed_at, difficulty")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("journal_entries")
      .select("mood, body, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7),
  ]);
  return { profile: profile.data, challenges: challenges.data ?? [], journal: journal.data ?? [] };
}

export const generateRealityCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const ctx = await gatherUserContext(context.supabase, context.userId);
    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: RealityCheckSchema }),
      system: "You are Ascend, a brutally honest yet supportive AI coach. No fluff. Be specific to the data given.",
      prompt: `Profile: ${JSON.stringify(ctx.profile)}\nRecent challenges: ${JSON.stringify(ctx.challenges)}\nRecent journal entries: ${JSON.stringify(ctx.journal)}\n\nGenerate this week's reality check.`,
    });
    await context.supabase.from("ai_insights").insert({
      user_id: context.userId,
      kind: "reality_check",
      content: output,
    });
    return output;
  });

export const generateFutureYou = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const ctx = await gatherUserContext(context.supabase, context.userId);
    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: FutureYouSchema }),
      system:
        "You are projecting two realistic 12-month futures based on the user's data. The 'improved_path' assumes consistent daily growth; the 'current_path' assumes no change. Make both specific and grounded.",
      prompt: `Profile: ${JSON.stringify(ctx.profile)}\nRecent activity: ${JSON.stringify(ctx.challenges.slice(0, 10))}\n\nGenerate the comparison.`,
    });
    await context.supabase.from("ai_insights").insert({
      user_id: context.userId,
      kind: "future_you",
      content: output,
    });
    return output;
  });

export const generateDailyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const ctx = await gatherUserContext(context.supabase, context.userId);
    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({ text: z.string().max(220) }),
      }),
      system: "You are Ascend, an AI coach. Give one specific, motivating insight based on the data. Maximum 2 sentences.",
      prompt: `Profile: ${JSON.stringify(ctx.profile)}\nRecent challenges: ${JSON.stringify(ctx.challenges.slice(0, 10))}`,
    });
    await context.supabase.from("ai_insights").insert({
      user_id: context.userId,
      kind: "daily",
      content: output,
    });
    return output;
  });
