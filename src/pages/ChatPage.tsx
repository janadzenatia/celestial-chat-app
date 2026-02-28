import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/astro-chat`;

const ChatPage = () => {
  const { t, language } = useLanguage();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    // Clear previous user's messages immediately
    setMessages([]);
    setLoadingHistory(true);
    if (!user) {
      setLoadingHistory(false);
      return;
    }
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Msg[]);
        setLoadingHistory(false);
      });
  }, [user?.id]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const getBirthData = () => {
    if (!profile?.date_of_birth) return null;
    const sun = getSunSign(profile.date_of_birth);
    const moon = getApproxMoonSign(profile.date_of_birth);
    const rising = getApproxRisingSign(profile.date_of_birth, profile.time_of_birth);
    return {
      name: profile.name,
      dateOfBirth: profile.date_of_birth,
      timeOfBirth: profile.time_of_birth,
      placeOfBirth: profile.place_of_birth,
      sunSign: sun?.name,
      moonSign: moon?.name,
      risingSign: rising?.name,
    };
  };

  const persistMessage = async (msg: Msg) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    await persistMessage(userMsg);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-20), // last 20 for context window
          birthData: getBirthData(),
          language,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Persist assistant response
      if (assistantSoFar) {
        await persistMessage({ role: "assistant", content: assistantSoFar });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to reach the stars. Try again.", variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <AppHeader />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center space-y-3 pt-12">
            <div className="text-5xl">✨</div>
            <h2 className="font-serif text-xl text-gradient-gold">Ask the Stars</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {language === "ka"
                ? "ჰკითხე ვარსკვლავებს ყველაფერი რაც გაინტერესებს..."
                : "Ask me anything about your horoscope, love life, career, or cosmic destiny..."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-gold text-primary-foreground rounded-br-md"
                      : "glass text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && isLoading && i === messages.length - 1 && (
                    <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-full" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 space-y-2">
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="w-11 h-11 rounded-full glass flex items-center justify-center shrink-0 hover:bg-destructive/20 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            className="flex-1 glass rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t("chat.placeholder")}
            disabled={isLoading}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 rounded-full gradient-gold flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{t("chat.disclaimer")}</p>
      </div>
    </div>
  );
};

export default ChatPage;
