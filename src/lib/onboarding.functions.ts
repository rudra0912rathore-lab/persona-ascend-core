import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
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

type Roadmap = z.infer<typeof RoadmapSchema>;

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const normalizeDifficulty = (value: unknown): "easy" | "medium" | "hard" => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "medium" || normalized === "hard") return normalized;
  return "easy";
};

const normalizeImpact = (value: unknown): "low" | "medium" | "high" => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "low" || normalized === "high") return normalized;
  return "medium";
};

const weeksFromTimeline = (value: unknown, fallback: number) => {
  if (typeof value === "number") return clampNumber(value, fallback, 1, 104);
  const text = String(value ?? "").toLowerCase();
  const numbers = text.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  const last = numbers.at(-1);
  if (!last) return fallback;
  if (text.includes("month")) return clampNumber(last * 4, fallback, 1, 104);
  if (text.includes("year")) return clampNumber(last * 52, fallback, 1, 104);
  return clampNumber(last, fallback, 1, 104);
};

const extractJsonObject = (text: string) => {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) throw new Error("AI response did not include JSON.");
  return JSON.parse(trimmed.slice(first, last + 1)) as Record<string, unknown>;
};

const fallbackRoadmap = (mainGoal: string, futureIdentity: string): Roadmap => ({
  main_goal: mainGoal,
  class: "Strategist",
  milestones: [
    {
      title: "Foundation Protocol",
      description: `Create a daily baseline that supports becoming ${futureIdentity}.`,
      reward_xp: 120,
      weeks_out: 2,
    },
    {
      title: "Consistency Streak",
      description: "Complete your core habit loop long enough that progress becomes visible.",
      reward_xp: 220,
      weeks_out: 6,
    },
    {
      title: "Skill Expansion",
      description: "Add deliberate practice sessions that directly support your main goal.",
      reward_xp: 360,
      weeks_out: 12,
    },
    {
      title: "Performance Checkpoint",
      description: "Measure results, refine your system, and raise the difficulty.",
      reward_xp: 520,
      weeks_out: 24,
    },
    {
      title: "Identity Integration",
      description: "Operate from your future identity with a repeatable weekly rhythm.",
      reward_xp: 750,
      weeks_out: 52,
    },
  ],
  starter_challenges: [
    { name: "Ten-Minute First Move", difficulty: "easy", est_minutes: 10, xp_reward: 30, impact: "medium" },
    { name: "Plan Tomorrow's Win", difficulty: "easy", est_minutes: 8, xp_reward: 25, impact: "medium" },
    { name: "Remove One Friction Point", difficulty: "easy", est_minutes: 15, xp_reward: 35, impact: "high" },
    { name: "Reflect and Score the Day", difficulty: "easy", est_minutes: 5, xp_reward: 20, impact: "medium" },
  ],
  skills: ["Discipline", "Focus", "Planning", "Self-reflection"],
  opening_insight: `Your next level is built through small, repeatable wins. Start with ${mainGoal}, protect the daily rhythm, and let every completed challenge prove that ${futureIdentity} is becoming real.`,
});

const normalizeRoadmap = (raw: Record<string, unknown>, mainGoal: string, futureIdentity: string): Roadmap => {
  const base = fallbackRoadmap(mainGoal, futureIdentity);
  const rawMilestones = Array.isArray(raw.milestones)
    ? raw.milestones
    : Array.isArray(raw.roadmap_milestones)
      ? raw.roadmap_milestones
      : [];
  const rawChallenges = Array.isArray(raw.starter_challenges)
    ? raw.starter_challenges
    : Array.isArray(raw.starter_daily_challenges)
      ? raw.starter_daily_challenges
      : [];
  const rawSkills = Array.isArray(raw.skills)
    ? raw.skills
    : Array.isArray(raw.skill_growth_areas)
      ? raw.skill_growth_areas
      : [];

  const milestones = rawMilestones.slice(0, 6).map((item, index) => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      title: String(entry.title ?? entry.milestone ?? base.milestones[index]?.title ?? `Milestone ${index + 1}`),
      description: String(entry.description ?? entry.focus ?? base.milestones[index]?.description ?? "Keep advancing your roadmap."),
      reward_xp: clampNumber(entry.reward_xp, base.milestones[index]?.reward_xp ?? 150 + index * 100, 50, 1000),
      weeks_out: weeksFromTimeline(entry.weeks_out ?? entry.timeline, base.milestones[index]?.weeks_out ?? (index + 1) * 4),
    };
  });

  const starter_challenges = rawChallenges.slice(0, 5).map((item, index) => {
    const entry = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      name: String(entry.name ?? entry.task ?? base.starter_challenges[index]?.name ?? `Challenge ${index + 1}`),
      difficulty: normalizeDifficulty(entry.difficulty),
      est_minutes: clampNumber(entry.est_minutes, base.starter_challenges[index]?.est_minutes ?? 15, 5, 120),
      xp_reward: clampNumber(entry.xp_reward, base.starter_challenges[index]?.xp_reward ?? 30, 20, 200),
      impact: normalizeImpact(entry.impact),
    };
  });

  const roadmap = {
    main_goal: String(raw.main_goal ?? mainGoal),
    class: String(raw.class ?? raw.archetype ?? base.class),
    milestones: milestones.length ? milestones : base.milestones,
    starter_challenges: starter_challenges.length ? starter_challenges : base.starter_challenges,
    skills: rawSkills.length ? rawSkills.slice(0, 5).map(String) : base.skills,
    opening_insight: String(raw.opening_insight ?? base.opening_insight),
  };

  return RoadmapSchema.parse(roadmap);
};

export const generateRoadmap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { future_identity: string; main_goal: string }) => input)
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    let output: Roadmap;
    try {
      const { text } = await generateText({
        model,
        temperature: 0.4,
        maxOutputTokens: 1600,
        system:
          "You are Ascend, an elite AI life coach. Design a personalized growth roadmap. Be specific, motivating, and practical. Use the user's exact identity and goal. Avoid generic advice. Return only one valid JSON object and no markdown.",
        prompt: `Future identity: ${data.future_identity}\nMain goal: ${data.main_goal}\n\nReturn this exact JSON shape with raw numbers only, no thousands separators: {"main_goal":"string","class":"RPG archetype","milestones":[{"title":"string","description":"string","reward_xp":number,"weeks_out":number}],"starter_challenges":[{"name":"string","difficulty":"easy|medium|hard","est_minutes":number,"xp_reward":number,"impact":"low|medium|high"}],"skills":["string"],"opening_insight":"string"}. Include 4-6 milestones, 3-5 starter challenges, and 2-5 skills.`,
      });
      output = normalizeRoadmap(extractJsonObject(text), data.main_goal, data.future_identity);
    } catch (error) {
      console.error("Roadmap AI generation failed, using fallback roadmap", error);
      output = fallbackRoadmap(data.main_goal, data.future_identity);
    }

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
