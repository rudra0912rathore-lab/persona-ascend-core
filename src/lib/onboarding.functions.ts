import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const RoadmapSchema = z.object({
  main_goal: z.string(),
  class: z.string(),
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      reward_xp: z.number(),
      weeks_out: z.number(),
    }),
  ),
  starter_challenges: z.array(
    z.object({
      name: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      est_minutes: z.number(),
      xp_reward: z.number(),
      impact: z.enum(["low", "medium", "high"]),
    }),
  ),
  skills: z.array(z.string()),
  opening_insight: z.string(),
});

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { future_identity: string; main_goal: string }) => input)
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { output } = await generateText({
      model,
      output: Output.object({ schema: RoadmapSchema }),
      system:
        "You are Ascend, an elite AI life coach. Design a personalized growth roadmap. Be specific, motivating, and practical. Use the user's exact identity and goal. Avoid generic advice. Class should be an RPG-style archetype (Creator, Strategist, Warrior, Sage, etc.). Milestone reward_xp 50-1000, weeks_out 1-104. Challenge est_minutes 5-120, xp_reward 20-200.",
      prompt: `Future identity: ${data.future_identity}\nMain goal: ${data.main_goal}\n\nReturn JSON with: main_goal, class, 4-6 milestones spaced realistically, 3-5 starter daily challenges I can do TODAY, 2-5 skills to grow, and an opening_insight that motivates me.`,
    });

    // Persist roadmap
    const goal = await context.supabase
      .from("goals")
      .insert({
        user_id: context.userId,
        title: output.main_goal,
        is_main: true,
        status: "active",
      })
      .select("id")
      .single();
    if (goal.error) throw new Error(goal.error.message);

    const milestones = output.milestones.map((m, i) => ({
      user_id: context.userId,
      goal_id: goal.data.id,
      title: m.title,
      description: m.description,
      order_index: i,
      reward_xp: m.reward_xp,
      estimated_date: new Date(Date.now() + m.weeks_out * 7 * 86400000).toISOString().slice(0, 10),
    }));
    await context.supabase.from("milestones").insert(milestones);

    const challenges = output.starter_challenges.map((c) => ({
      user_id: context.userId,
      name: c.name,
      difficulty: c.difficulty,
      est_minutes: c.est_minutes,
      xp_reward: c.xp_reward,
      impact: c.impact,
      source: "ai",
    }));
    await context.supabase.from("challenges").insert(challenges);

    const skills = output.skills.map((s) => ({
      user_id: context.userId,
      name: s,
      level: 1,
      xp: 0,
      rank: "Novice",
    }));
    await context.supabase.from("skills").insert(skills);

    await context.supabase.from("ai_insights").insert({
      user_id: context.userId,
      kind: "opening",
      content: { text: output.opening_insight },
    });

    await context.supabase
      .from("profiles")
      .update({
        main_goal: output.main_goal,
        future_identity: data.future_identity,
        class: output.class,
        onboarded: true,
      })
      .eq("id", context.userId);

    return { ok: true };
  });
