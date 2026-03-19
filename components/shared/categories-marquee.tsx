"use client";

import Link from "next/link";

interface Category {
  name: string;
  slug: string;
}

interface CategoriesMarqueeProps {
  categories: Category[];
}

export function CategoriesMarquee({ categories }: CategoriesMarqueeProps) {
  if (categories.length === 0) return null;

  const items = [...categories, ...categories, ...categories, ...categories];

  return (
    <div className="relative overflow-hidden py-4 bg-white border-b border-neutral-100 group/marquee">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent" />

      <div
        className="flex whitespace-nowrap"
        style={{ animation: "marquee 18s linear infinite" }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
      >
        {items.map((cat, i) => (
          <Link
            key={`${cat.slug}-${i}`}
            href={`/catalog/${cat.slug}`}
            className="inline-flex items-center gap-3 px-6 text-sm font-semibold text-neutral-700 hover:text-primary transition-colors whitespace-nowrap"
          >
            {cat.name}
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
