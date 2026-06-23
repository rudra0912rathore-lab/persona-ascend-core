import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
      id: r.id as string,
      role: r.role as string,
      parts: r.parts as unknown,
    }));
  });
