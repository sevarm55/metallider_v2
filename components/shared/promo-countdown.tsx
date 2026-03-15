"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface PromoCountdownProps {
  endDate: string;
  gradient: string;
}

function calcTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function PromoCountdown({ endDate, gradient }: PromoCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-neutral-500">
        <Clock className="h-4 w-4" />
        Акция завершена
      </div>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: "дн" },
    { value: timeLeft.hours, label: "ч" },
    { value: timeLeft.minutes, label: "мин" },
    { value: timeLeft.seconds, label: "сек" },
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="h-3 w-3 text-neutral-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          До конца акции
        </p>
      </div>
      <div className="inline-flex items-center gap-1.5">
        {blocks.map((b, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${gradient} text-base font-bold text-white shadow-lg`}>
              {String(b.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[9px] font-medium text-neutral-500">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
