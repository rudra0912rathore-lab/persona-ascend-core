import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/ascend/MobileShell";
import { BottomNav } from "@/components/ascend/BottomNav";
import { AiOrb } from "@/components/ascend/AiOrb";
import { getOrCreateMainThread, loadCoachMessages } from "@/lib/coach.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "AI Coach · Ascend AI" }] }),
  component: CoachPage,
});

const SUGGESTIONS = [
  "What is holding me back?",
  "Create tomorrow's plan",
  "How can I improve focus?",
  "Give me a reality check",
];

const MODES = ["Ask AI", "Reality Check", "Challenge", "Strategy", "Skill Growth"];

function CoachPage() {
  const threadFn = useServerFn(getOrCreateMainThread);
  const loadFn = useServerFn(loadCoachMessages);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[] | null>(null);
  const [mode, setMode] = useState("Ask AI");

  useEffect(() => {
    (async () => {
      const t = await threadFn();
      setThreadId(t.id);
      const msgs = await loadFn({ data: { thread_id: t.id } });
      setInitialMessages(msgs);
    })();
  }, [threadFn, loadFn]);

  if (!threadId || initialMessages === null) {
    return (
      <MobileShell>
        <div className="flex flex-1 items-center justify-center">
          <AiOrb size={120} />
        </div>
        <BottomNav />
      </MobileShell>
    );
  }

  return (
    <Chat
      threadId={threadId}
      initialMessages={initialMessages}
      mode={mode}
      setMode={setMode}
    />
  );
}

function Chat({
  threadId,
  initialMessages,
  mode,
  setMode,
}: {
  threadId: string;
  initialMessages: any[];
  mode: string;
  setMode: (m: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          return {
            body: { messages, threadId, mode, ...body },
            headers,
          };
        },
      }),
    [threadId, mode],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const loading = status === "submitted" || status === "streaming";

  async function submit(text?: string) {
    const t = (text ?? input).trim();
    if (!t || loading) return;
    setInput("");
    await sendMessage({ text: t });
  }

  return (
    <MobileShell>
      <header className="px-5 pt-7">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <AiOrb size={48} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Coach</div>
            <h1 className="truncate text-xl font-semibold">Ascend</h1>
          </div>
        </div>

        <div className="no-scrollbar mt-4 -mx-5 flex gap-2 overflow-x-auto px-5">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                mode === m ? "gradient-aurora text-white shadow-elegant" : "glass text-muted-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="px-1 text-sm text-muted-foreground">
              Start with a question, or pick a suggestion.
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl glass px-4 py-3.5 text-left text-sm transition-transform active:scale-[0.98]"
              >
                <span className="truncate">{s}</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => {
          const text = (m.parts ?? []).map((p: any) => (p.type === "text" ? p.text : "")).join("");
          const user = m.role === "user";
          return (
            <div key={m.id} className={`flex ${user ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card ${
                  user
                    ? "gradient-aurora text-white"
                    : "glass text-foreground"
                }`}
              >
                {text || (loading && !user ? <span className="shimmer-text">Thinking…</span> : null)}
              </div>
            </div>
          );
        })}
        {loading && messages.at(-1)?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl glass px-4 py-3 text-sm shimmer-text">Thinking…</div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="px-3 pb-3"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-3xl glass-strong p-2 shadow-card">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask Ascend anything…"
            rows={1}
            className="min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-aurora text-white shadow-elegant disabled:opacity-40 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      <BottomNav />
    </MobileShell>
  );
}
