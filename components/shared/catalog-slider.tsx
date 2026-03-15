"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ArrowLeft, Package, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  color: string;
  totalProducts: number;
  children: { id: string; name: string; slug: string }[];
  index: number;
}

export function CatalogSlider({ categories }: { categories: Category[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ axis: "x", loop: true, duration: 30 });
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const scrollPrev = useCallback(() => {
    if (animating) return;
    emblaApi?.scrollPrev();
  }, [emblaApi, animating]);

  const scrollNext = useCallback(() => {
    if (animating) return;
    emblaApi?.scrollNext();
  }, [emblaApi, animating]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap());
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); scrollNext(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); scrollPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollNext, scrollPrev]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-neutral-950">
      {/* Top overlay — logo + info */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-14 py-6">
        <Link href="/" className="text-lg font-black text-white font-(family-name:--font-unbounded)">
          МЕТАЛЛ<span className="text-primary">ЛИДЕР</span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm text-white/40">
          <span>Каталог металлопроката</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {categories.length} разделов
          </span>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-14 py-6">
        {/* Dots */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white/30 font-(family-name:--font-unbounded)">
            {String(current + 1).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5">
            {categories.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`rounded-full transition-all duration-500 ${
                  i === current
                    ? "bg-primary w-8 h-2"
                    : "bg-white/20 w-2 h-2 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-white/30 font-(family-name:--font-unbounded)">
            {String(categories.length).padStart(2, "0")}
          </span>
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={scrollPrev}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Swipe hint */}
      {current === 0 && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 z-40 hidden lg:flex items-center gap-2 animate-pulse">
          <span className="text-xs text-white/20 uppercase tracking-widest">Свайп</span>
          <ChevronRight className="h-5 w-5 text-white/20" />
        </div>
      )}

      {/* Embla viewport — horizontal */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex-[0_0_100%] min-w-0 relative">
              <SlideContent cat={cat} isActive={idx === current} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Product3D({ image, name, isActive, index }: { image: string | null; name: string; isActive: boolean; index: number }) {
  if (!image) return <Package className="h-40 w-40 text-white/5" />;

  return (
    <div
      className="relative w-[65vw] h-[85vh] max-w-[900px] max-h-[900px]"
      style={{ perspective: "1000px" }}
    >
      {/* Glow under product — pulsing */}
      <div className="absolute bottom-[-8%] left-[18%] right-[18%] h-[25%] rounded-full bg-white/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />

      {/* Floating + auto-rotate wrapper */}
      <div
        className={`relative h-full w-full transition-all duration-700 ease-out ${
          isActive ? "scale-100 opacity-100" : "scale-90 opacity-0 translate-x-20"
        }`}
        style={{
          transformStyle: "preserve-3d",
          animation: isActive ? "product-float 6s ease-in-out infinite" : "none",
        }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          priority={index < 2}
        />
      </div>
    </div>
  );
}

function SlideContent({ cat, isActive }: { cat: Category; isActive: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Colored gradient background */}
      <div className={`absolute inset-0 bg-linear-to-br ${cat.color} opacity-40 transition-opacity duration-700 ${isActive ? "opacity-40" : "opacity-20"}`} />
      <div className="absolute inset-0 bg-linear-to-r from-neutral-950/80 via-neutral-950/30 to-neutral-950/70" />

      {/* Product image — 3D, ON TOP of text for depth effect */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <Product3D image={cat.image} name={cat.name} isActive={isActive} index={cat.index} />
      </div>

      {/* Left content — name + CTA */}
      <div className={`absolute left-8 lg:left-14 bottom-24 lg:bottom-28 z-20 max-w-md transition-all duration-700 ease-out delay-100 ${
        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}>
        {/* Big background number */}
        <span className="block text-[clamp(5rem,14vw,12rem)] font-black leading-none text-white/3 font-(family-name:--font-unbounded) -mb-10 lg:-mb-16">
          {String(cat.index + 1).padStart(2, "0")}
        </span>

        <h2 className="relative text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white uppercase leading-[0.85] font-(family-name:--font-unbounded)">
          {cat.name}
        </h2>

        {cat.children.length > 0 && (
          <p className={`mt-4 text-sm text-white/40 leading-relaxed transition-all duration-700 delay-200 ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            {cat.children.map((c) => c.name).join(" · ")}
          </p>
        )}

        <Link
          href={`/catalog/${cat.slug}`}
          className={`mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-sm pl-6 pr-3 py-3 text-sm font-bold text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-500 delay-300 group ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Смотреть товары
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      {/* Right side — subcategories */}
      {cat.children.length > 0 && (
        <div className={`absolute right-8 lg:right-14 top-24 z-20 hidden lg:flex flex-col gap-2 max-w-[180px] transition-all duration-700 delay-200 ${
          isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
        }`}>
          <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Подкатегории</span>
          {cat.children.slice(0, 5).map((sub) => (
            <Link
              key={sub.id}
              href={`/catalog/${sub.slug}`}
              className="rounded-lg bg-white/5 backdrop-blur-sm px-3 py-2 text-[11px] font-medium text-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              {sub.name}
            </Link>
          ))}
          {cat.children.length > 5 && (
            <span className="text-[10px] text-white/20 px-3">+{cat.children.length - 5} ещё</span>
          )}
        </div>
      )}

      {/* Top right — product count badge */}
      <div className={`absolute top-24 right-8 lg:top-20 lg:right-14 z-20 lg:hidden transition-all duration-500 delay-150 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}>
        <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-white">
          {cat.totalProducts} товаров
        </span>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute left-14 top-[20%] bottom-[25%] w-px bg-white/5 hidden lg:block" />
    </div>
  );
}
