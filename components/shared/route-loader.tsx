"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show loader on click of any internal link
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
      if (href === pathname) return;

      setLoading(true);
      setVisible(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Hide loader when route changes
  useEffect(() => {
    if (loading) {
      setLoading(false);
      // Fade out
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-400 ${
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div className="relative h-20 w-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-neutral-200" />
          {/* Spinning arc 1 */}
          <div
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary"
            style={{ animationDuration: "0.7s" }}
          />
          {/* Spinning arc 2 (reverse) */}
          <div
            className="absolute inset-2 animate-spin rounded-full border-[2px] border-transparent border-b-primary/50"
            style={{ animationDuration: "1s", animationDirection: "reverse" }}
          />
          {/* Inner glow */}
          <div className="absolute inset-4 rounded-full bg-primary/10 animate-pulse" />
          {/* Center logo mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-primary font-(family-name:--font-unbounded)">М</span>
          </div>
        </div>

        {/* Brand */}
        <div className="text-base font-black tracking-tight text-neutral-900 font-(family-name:--font-unbounded)">
          МЕТАЛЛ<span className="text-primary">ЛИДЕР</span>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.6s" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.6s" }} />
          <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.6s" }} />
        </div>
      </div>
    </div>
  );
}
