import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { UIMessage } from "ai";

export const getOrCreateMainThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const existing = await context.supabase
      .from("coach_threads")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (existing.data) return existing.data;
    const { data, error } = await context.supabase
      .from("coach_threads")
      .insert({ user_id: context.userId, title: "AI Coach" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const loadCoachMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { thread_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("coach_messages")
      .select("*")
      .eq("thread_id", data.thread_id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as UIMessage["role"],
      parts: r.parts as UIMessage["parts"],
    })) as UIMessage[];
  });
