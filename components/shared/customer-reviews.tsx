"use client";

import { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  name: string;
  company: string;
  text: string;
  rating: number;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Алексей Петров",
    company: "СтройМонтаж",
    text: "Работаем с МеталлЛидер уже третий год. Отличное качество металлопроката, всегда в наличии нужные размеры. Доставка точно в срок — ни разу не подвели.",
    rating: 5,
    date: "Февраль 2026",
  },
  {
    id: 2,
    name: "Марина Козлова",
    company: "ИП Козлова",
    text: "Заказывали профильные трубы для ограждения. Менеджер помог подобрать оптимальный размер, сэкономили на материале. Цены одни из лучших в регионе.",
    rating: 5,
    date: "Январь 2026",
  },
  {
    id: 3,
    name: "Дмитрий Волков",
    company: "АльфаСтрой",
    text: "Закупаем арматуру и листовой прокат оптом. Удобно что есть рассрочка для постоянных клиентов. Качество всегда на высоте, все сертификаты предоставляют.",
    rating: 5,
    date: "Декабрь 2025",
  },
  {
    id: 4,
    name: "Сергей Иванов",
    company: "МеталлКонструкция",
    text: "Брали швеллер и уголок для каркаса здания. Резка в размер — очень удобная услуга. Рекомендую как надёжного поставщика с адекватными ценами.",
    rating: 4,
    date: "Ноябрь 2025",
  },
  {
    id: 5,
    name: "Елена Смирнова",
    company: "ДомСтрой",
    text: "Первый раз заказывали — приятно удивлены сервисом. Быстрая консультация, оперативная доставка. Профнастил для крыши пришёл в идеальном состоянии.",
    rating: 5,
    date: "Октябрь 2025",
  },
];

export function CustomerReviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>(null);

  const visibleCount = 3; // on desktop
  const maxIndex = reviews.length - 1;

  const goTo = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const next = () => goTo(activeIndex >= maxIndex ? 0 : activeIndex + 1);
  const prev = () => goTo(activeIndex <= 0 ? maxIndex : activeIndex - 1);

  // Auto-play
  useEffect(() => {
    autoPlayRef.current = setInterval(next, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeIndex]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(next, 5000);
  };

  return (
    <div>
      {/* Cards */}
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{
            transform: `translateX(-${activeIndex * (100 / visibleCount)}%)`,
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="w-full shrink-0 md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]"
            >
              <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 flex flex-col">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-3" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-200 text-neutral-200",
                      )}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed text-neutral-600 flex-1">
                  {review.text}
                </p>

                {/* Author */}
                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {review.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {review.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {review.company} &middot; {review.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => { prev(); resetAutoPlay(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 text-neutral-600 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetAutoPlay(); }}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400",
              )}
            />
          ))}
        </div>
        <button
          onClick={() => { next(); resetAutoPlay(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 text-neutral-600 hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
