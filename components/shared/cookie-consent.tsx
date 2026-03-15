"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const COOKIE_KEY = "cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Show after a short delay so it doesn't flash on load
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="relative overflow-hidden rounded-2xl bg-zinc-800 p-5 shadow-2xl shadow-black/20 ring-1 ring-white/10">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Мы используем cookie
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
                    Для улучшения работы сайта и анализа трафика.{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Подробнее
                    </Link>
                  </p>
                </div>
                <button
                  onClick={decline}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={accept}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/80 transition-colors"
                >
                  Принять
                </button>
                <button
                  onClick={decline}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Отклонить
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
