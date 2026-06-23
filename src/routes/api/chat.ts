import { createFileRoute } from "@tanstack/react-router";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string; mode?: string };
        const messages = body.messages ?? [];
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

        // Authenticated user → persist messages with service role + token check
        const auth = request.headers.get("authorization");
        const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
        let userId: string | null = null;
        let supabaseAdmin: any = null;
        if (token && body.threadId) {
          const mod = await import("@/integrations/supabase/client.server");
          supabaseAdmin = mod.supabaseAdmin;
          const { data } = await supabaseAdmin.auth.getUser(token);
          userId = data.user?.id ?? null;
        }

        // Persist the latest user message before streaming
        if (userId && supabaseAdmin && body.threadId && messages.length > 0) {
          const last = messages[messages.length - 1];
          if (last.role === "user") {
            await supabaseAdmin.from("coach_messages").insert({
              thread_id: body.threadId,
              user_id: userId,
              role: "user",
              parts: last.parts as never,
            });
            await supabaseAdmin
              .from("coach_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", body.threadId);
          }
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const systemByMode: Record<string, string> = {
          "Ask AI": "You are Ascend, an elite AI life coach for an RPG-style personal growth app. Be concise, specific, motivating. Use markdown when helpful.",
          "Reality Check": "You are Ascend in Reality Check mode. Be brutally honest but supportive. Identify patterns, weaknesses, and one concrete next step.",
          "Challenge": "You are Ascend in Challenge Generator mode. Propose 3 short, specific challenges tailored to the user's request. Format as a numbered list.",
          "Strategy": "You are Ascend in Life Strategy mode. Think long-term. Tie advice back to the user's identity and goals.",
          "Skill Growth": "You are Ascend in Skill Growth mode. Focus on deliberate practice, mastery loops, and weekly micro-progressions.",
        };
        const system = systemByMode[body.mode ?? "Ask AI"] ?? systemByMode["Ask AI"];

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            if (!userId || !supabaseAdmin || !body.threadId) return;
            const assistant = finalMessages[finalMessages.length - 1];
            if (assistant && assistant.role === "assistant") {
              await supabaseAdmin.from("coach_messages").insert({
                thread_id: body.threadId,
                user_id: userId,
                role: "assistant",
                parts: assistant.parts as never,
              });
            }
          },
        });
      },
    },
  },
});
