import { useState, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, getEffectivePlan } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Trash2, Sparkles, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSunSign, getApproxMoonSign, getApproxRisingSign } from "@/lib/zodiac";
import PaywallModal from "@/components/PaywallModal";
import { stripMarkdown } from "@/lib/stripMarkdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/astro-chat`;

const ChatPage = () => {
  const { t, language } = useLanguage();
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [violations, setViolations] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const plan = getEffectivePlan(profile);
  const isPremium = plan === "premium";
  const isFree = plan === "free";

  // Check if user is in active trial
  const isInTrial = isFree === false || (profile?.trial_end_date && new Date(profile.trial_end_date) > new Date());
  const trialExpired = profile?.trial_end_date && new Date(profile.trial_end_date) <= new Date() && isFree;

  // Daily message tracking
  const today = new Date().toISOString().slice(0, 10);
  const isToday = profile?.last_chat_date === today;
  const dailyCount = isToday ? (profile?.daily_chat_count ?? 0) : 0;
  const DAILY_LIMIT = 10;
  const remaining = isPremium ? Infinity : Math.max(0, DAILY_LIMIT - dailyCount);
  const chatDisabled = trialExpired || (!isPremium && remaining <= 0);
  const isCoolingDown = cooldownUntil !== null && Date.now() < cooldownUntil;

  // Moderation messages to detect
  const MODERATION_MARKERS = [
    "ეს შეტყობინება ვერ დამუშავდა",
    "This message could not be processed",
  ];

  // Cooldown timer
  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(left);
      if (left <= 0) setCooldownUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  // Load chat history
  useEffect(() => {
    setMessages([]);
    setLoadingHistory(true);
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    let query = supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    // Non-premium: load all history (no 7-day restriction anymore)

    query.then(({ data }) => {
      if (data) setMessages(data as Msg[]);
      setLoadingHistory(false);

      // Check for hook context from notification banner
      const hookContextStr = sessionStorage.getItem("chat_hook_context");
      if (hookContextStr) {
        sessionStorage.removeItem("chat_hook_context");
        try {
          const hookCtx = JSON.parse(hookContextStr);
          if (hookCtx.hook) {
            triggerHookChat(hookCtx, data as Msg[] || []);
          }
        } catch { /* ignore */ }
      }
    });
  }, [user?.id, plan]);

  const triggerHookChat = async (hookCtx: { hook: string; subject: string; subjectDob?: string }, existingMsgs: Msg[]) => {
    if (chatDisabled) return;
    setIsLoading(true);
    const lang = language === "ka" ? "Georgian" : "English";
    const hookPrompt = `The user just tapped a cosmic notification that said: "${hookCtx.hook}". The notification was about ${hookCtx.subject === "self" ? "the user themselves" : `their family member named ${hookCtx.subject}`}. Now elaborate on what's happening astrologically and offer to help. Be warm, specific, and mystical. Respond in ${lang}.`;

    const systemUserMsg: Msg = { role: "user", content: hookPrompt };
    let assistantSoFar = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...existingMsgs.slice(-10), systemUserMsg],
          birthData: getBirthData(),
          language,
        }),
      });

      if (!resp.ok) {
        setIsLoading(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const cleaned = stripMarkdown(assistantSoFar);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: cleaned } : m));
          }
          return [...prev, { role: "assistant", content: cleaned }];
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

      if (assistantSoFar) {
        await persistMessage({ role: "assistant", content: assistantSoFar });
      }
    } catch (e) {
      console.error("Hook chat error:", e);
    }
    setIsLoading(false);
  };

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const getBirthData = () => {
    if (!profile?.date_of_birth) return null;
    const birthLat = (profile as any).birth_lat ?? null;
    const birthLon = (profile as any).birth_lon ?? null;
    // Use cached Big 3 if available
    const sun = (profile as any).cached_sun_sign || getSunSign(profile.date_of_birth)?.name;
    const moon = (profile as any).cached_moon_sign || getApproxMoonSign(profile.date_of_birth, profile.time_of_birth, birthLat, birthLon)?.name;
    const rising = (profile as any).cached_rising_sign || getApproxRisingSign(profile.date_of_birth, profile.time_of_birth, birthLat, birthLon)?.name;
    return {
      name: profile.name,
      dateOfBirth: profile.date_of_birth,
      timeOfBirth: profile.time_of_birth,
      placeOfBirth: profile.place_of_birth,
      sunSign: sun,
      moonSign: moon,
      risingSign: rising,
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

  const incrementDailyCount = async () => {
    if (!user) return;
    const newCount = (isToday ? dailyCount : 0) + 1;
    await supabase
      .from("profiles")
      .update({ daily_chat_count: newCount, last_chat_date: today })
      .eq("user_id", user.id);
    // Refresh profile to update local state
    await refreshProfile();
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading || isCoolingDown) return;

    // Check limits
    if (chatDisabled) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    await persistMessage(userMsg);
    if (!isPremium) await incrementDailyCount();

    let assistantSoFar = "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].slice(-20),
          birthData: getBirthData(),
          language,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        toast({ title: t("chat.error"), description: err.error, variant: "destructive" });
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

      if (assistantSoFar) {
        await persistMessage({ role: "assistant", content: assistantSoFar });
        // Check for moderation response
        if (MODERATION_MARKERS.some((m) => assistantSoFar.includes(m))) {
          const newCount = violations + 1;
          setViolations(newCount);
          if (newCount >= 3) {
            setCooldownUntil(Date.now() + 60_000);
            toast({
              title: t("chat.cooldown"),
              variant: "destructive",
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: t("chat.error"), description: t("chat.errorDesc"), variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <AppHeader />

      {/* Trial banner */}
      {!isPremium && profile?.trial_end_date && new Date(profile.trial_end_date) > new Date() && (
        <div className="px-4 pt-2">
          <div className="glass rounded-xl px-3 py-2 text-center text-xs text-primary">
            <Sparkles className="w-3 h-3 inline mr-1" />
            {language === "ka"
              ? `საცდელი პერიოდი — ${DAILY_LIMIT} შეტყობინება/დღეში`
              : `Free trial — ${DAILY_LIMIT} messages/day`}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center space-y-3 pt-12">
            <div className="text-5xl">✨</div>
            <h2 className="font-serif text-xl text-gradient-gold">{t("chat.askTitle")}</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {t("chat.askDesc")}
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

      {/* Cooldown banner */}
      {isCoolingDown && (
        <div className="px-4 pb-2">
          <div className="glass rounded-xl p-3 text-center border border-destructive/30">
            <p className="text-sm text-destructive">
              {t("chat.cooldown")} ({cooldownSeconds}s)
            </p>
          </div>
        </div>
      )}

      {/* Limit reached banner */}
      {chatDisabled && !isCoolingDown && (
         <div className="px-4 pb-2">
          <div className="glass rounded-xl p-3 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {trialExpired
                ? (language === "ka"
                  ? "შენი საცდელი პერიოდი დასრულდა. გააქტიურე პრემიუმი — $1.99/თვეში"
                  : "Your trial has ended. Activate Premium — $1.99/month")
                : (language === "ka"
                  ? "დღის ლიმიტი ამოიწურა. გააქტიურე პრემიუმი შეუზღუდავი ჩატისთვის!"
                  : "Daily limit reached. Upgrade to Premium for unlimited chat!")}
            </p>
            <button
              onClick={() => setPaywallOpen(true)}
              className="px-4 py-2 rounded-xl gradient-gold text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {language === "ka" ? "პრემიუმის გააქტიურება" : "Activate Premium"}
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 space-y-2">
        {/* Daily counter for trial users */}
        {!isPremium && !chatDisabled && !trialExpired && (
          <div className="text-center">
            <span className="text-[11px] text-muted-foreground glass px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3" />
              {language === "ka"
                ? `${remaining}/${DAILY_LIMIT} შეტყობინება დარჩა დღეს`
                : `${remaining}/${DAILY_LIMIT} messages remaining today`}
            </span>
          </div>
        )}

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
            className="flex-1 glass rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            placeholder={isCoolingDown
              ? t("chat.cooldown")
              : chatDisabled
                ? (language === "ka" ? "დღის ლიმიტი ამოწურულია" : "Daily limit reached")
                : t("chat.placeholder")}
            disabled={isLoading || chatDisabled || isCoolingDown}
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim() || chatDisabled || isCoolingDown}
            className="w-11 h-11 rounded-full gradient-gold flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">{t("chat.disclaimer")}</p>
      </div>

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default ChatPage;
