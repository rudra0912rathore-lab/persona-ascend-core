import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const SummarySchema = z.object({
  positive_patterns: z.array(z.string()).min(1).max(4),
  weak_patterns: z.array(z.string()).min(1).max(4),
  tomorrow_focus: z.string(),
});

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { mood: string; body: string }) => input)
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    let summary: unknown = null;
    if (key && data.body.length > 30) {
      try {
        const gateway = createLovableAiGatewayProvider(key);
        const { output } = await generateText({
          model: gateway("google/gemini-3-flash-preview"),
          output: Output.object({ schema: SummarySchema }),
          system:
            "You are a thoughtful coach analyzing a journal entry. Be specific to what the user actually wrote.",
          prompt: `Mood: ${data.mood}\n\nEntry:\n${data.body}\n\nIdentify what's going well, what's holding them back, and recommend a single concrete focus for tomorrow.`,
        });
        summary = output;
      } catch (err) {
        console.error("journal ai summary failed", err);
      }
    }

    const { data: row, error } = await context.supabase
      .from("journal_entries")
      .insert({
        user_id: context.userId,
        mood: data.mood,
        body: data.body,
        ai_summary: summary,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
