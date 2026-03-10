"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, User, Sparkles, RotateCcw, ArrowDown, Wrench, HardHat, Truck, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

declare global {
  interface WindowEventMap {
    "open-ai-chat": Event;
  }
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  { icon: HardHat, text: "Какой профиль для забора?", color: "text-amber-500" },
  { icon: Calculator, text: "Рассчитать вес трубы", color: "text-blue-500" },
  { icon: Wrench, text: "Арматура для фундамента", color: "text-emerald-500" },
  { icon: Truck, text: "Условия доставки", color: "text-violet-500" },
];

let msgCounter = 0;
function genId() {
  return `msg-${++msgCounter}-${Date.now()}`;
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Listen for open event from header buttons
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ai-chat", handler);
    return () => window.removeEventListener("open-ai-chat", handler);
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: genId(), role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = "44px";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: genId(),
        role: "assistant",
        content: data.content || "Извините, не удалось получить ответ.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: genId(),
        role: "assistant",
        content: "Ошибка соединения. Попробуйте ещё раз или позвоните: +7 (495) 760-55-39",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 flex flex-col w-full sm:w-[400px] h-dvh sm:h-[min(640px,calc(100vh-3rem))] sm:rounded-3xl bg-white shadow-2xl shadow-black/20 ring-1 ring-black/5 overflow-hidden"
            >
              {/* ── Header with gradient ── */}
              <div className="relative shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--color-primary),0.2),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(var(--color-primary),0.1),transparent_40%)]" />

                <div className="relative px-5 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                          <Bot className="h-6 w-6 text-white" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-neutral-900 bg-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-white flex items-center gap-1.5">
                          Алексей
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </span>
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Консультант · 10 лет в строительстве</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 -mt-1 -mr-1">
                      {messages.length > 0 && (
                        <button
                          onClick={() => { setMessages([]); setInput(""); }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Новый чат"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Messages ── */}
              <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
                <div className="px-4 py-5 space-y-5">
                  {/* Welcome screen */}
                  {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center pt-4">
                      {/* Hero */}
                      <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-4">
                        <Bot className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="text-base font-bold text-neutral-900 text-center">
                        Чем могу помочь?
                      </h4>
                      <p className="text-xs text-neutral-400 text-center mt-1 max-w-[260px]">
                        Подберу металлопрокат, рассчитаю вес, расскажу об условиях доставки
                      </p>

                      {/* Quick question cards */}
                      <div className="grid grid-cols-2 gap-2 w-full mt-6">
                        {QUICK_QUESTIONS.map((q) => (
                          <button
                            key={q.text}
                            onClick={() => sendMessage(q.text)}
                            className="group flex flex-col items-start gap-2 rounded-2xl bg-neutral-50 hover:bg-white p-3.5 text-left ring-1 ring-neutral-100 hover:ring-primary/20 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform", q.color)}>
                              <q.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[12px] font-medium text-neutral-600 leading-snug group-hover:text-neutral-900 transition-colors">
                              {q.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn("flex gap-2.5", msg.role === "user" && "flex-row-reverse")}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-primary/5 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[82%] text-[13px] leading-relaxed",
                          msg.role === "user"
                            ? "rounded-2xl rounded-br-lg bg-neutral-900 text-white px-4 py-3"
                            : "rounded-2xl rounded-bl-lg bg-neutral-100 text-neutral-700 px-4 py-3",
                        )}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      {msg.role === "user" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 mt-0.5">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-primary/5">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-lg bg-neutral-100 px-5 py-4">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-neutral-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Scroll to bottom */}
                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={scrollToBottom}
                      className="sticky bottom-3 left-1/2 -translate-x-1/2 mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer z-10"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Input ── */}
              <div className="shrink-0 bg-white px-4 py-3 border-t border-neutral-100">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Спросите что-нибудь..."
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 pl-4 pr-12 py-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary/40 focus:bg-white focus:shadow-sm transition-all max-h-28"
                    style={{ minHeight: "44px" }}
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "44px";
                      t.style.height = Math.min(t.scrollHeight, 112) + "px";
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className={cn(
                      "absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer",
                      input.trim() && !isLoading
                        ? "bg-primary text-white shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 hover:scale-105"
                        : "bg-transparent text-neutral-300 cursor-not-allowed",
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Sparkles className="h-2.5 w-2.5 text-neutral-300" />
                  <p className="text-[10px] text-neutral-300">
                    Powered by AI · Уточняйте детали у менеджера
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
