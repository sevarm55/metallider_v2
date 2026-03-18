"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Star, Send, ChevronRight } from "lucide-react";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  createdAt: string;
}

export function ReviewsWidget() {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"list" | "form">("list");

  // Form
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open && reviews.length === 0) {
      loadReviews();
    }
  }, [open]);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/reviews");
      if (res.data.success) setReviews(res.data.data);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    try {
      const res = await axiosInstance.post("/reviews", { name, text, rating });
      if (res.data.success) {
        setSent(true);
        setName("");
        setText("");
        setRating(5);
        // Reload reviews
        loadReviews();
        setTimeout(() => { setSent(false); setTab("list"); }, 2000);
      }
    } catch {}
    finally { setSending(false); }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 rounded-l-xl px-3 py-3 shadow-lg transition-all duration-300 cursor-pointer",
          "bg-primary text-white hover:pr-5",
          open && "opacity-0 pointer-events-none"
        )}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <MessageSquare className="h-4 w-4 rotate-90" />
        <span className="text-xs font-bold tracking-wide">Отзывы</span>
      </button>

      {/* Slide-in panel */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Отзывы</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-3 w-3", s <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">{avgRating} ({reviews.length})</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors">
                <X className="h-4 w-4 text-neutral-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-100">
              <button
                onClick={() => setTab("list")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  tab === "list" ? "text-primary border-b-2 border-primary" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                Все отзывы
              </button>
              <button
                onClick={() => setTab("form")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  tab === "form" ? "text-primary border-b-2 border-primary" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                Написать
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {tab === "list" ? (
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full mx-auto" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageSquare className="h-10 w-10 mx-auto text-neutral-200 mb-3" />
                      <p className="text-neutral-400 text-sm">Пока нет отзывов</p>
                      <button onClick={() => setTab("form")} className="mt-2 text-sm text-primary font-medium hover:underline cursor-pointer">
                        Оставить первый отзыв
                      </button>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="rounded-xl bg-neutral-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-neutral-800">{review.name}</p>
                              <p className="text-[10px] text-neutral-400">
                                {new Date(review.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed">{review.text}</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-5">
                  {sent ? (
                    <div className="py-12 text-center">
                      <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                        <Star className="h-7 w-7 fill-emerald-500 text-emerald-500" />
                      </div>
                      <p className="text-lg font-bold text-neutral-900">Спасибо!</p>
                      <p className="text-sm text-neutral-400 mt-1">Ваш отзыв опубликован</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Ваше имя</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Иван"
                          maxLength={100}
                          className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Оценка</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="cursor-pointer p-0.5"
                            >
                              <Star className={cn(
                                "h-7 w-7 transition-colors",
                                s <= (hoverRating || rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-neutral-200 hover:text-amber-200"
                              )} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Отзыв или пожелание</label>
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Расскажите о вашем опыте..."
                          maxLength={1000}
                          rows={4}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                        />
                        <p className="text-[10px] text-neutral-400 mt-1 text-right">{text.length}/1000</p>
                      </div>

                      <button
                        type="submit"
                        disabled={sending || !name.trim() || !text.trim()}
                        className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {sending ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Отправить отзыв
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
