import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { contactInfo } from "@/lib/mock-data";

export function HeroFullwidth() {
  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[400px] lg:min-h-[500px]">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero-dark.webp"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/images/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full min-h-[400px] lg:min-h-[500px] px-6">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-white/80 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Более 336 наименований в наличии
        </span>

        {/* Logo text */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white font-(family-name:--font-unbounded) tracking-tight">
          Метал<span className="text-primary">Лидер</span>
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
          Металлопрокат оптом и в розницу с доставкой по&nbsp;Москве и&nbsp;МО
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
          >
            Каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`tel:${contactInfo.phoneRaw}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all"
          >
            <Phone className="h-4 w-4 text-primary" />
            {contactInfo.phone}
          </a>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="flex justify-center gap-6 sm:gap-10 py-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/70">Сертификаты ГОСТ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/70">Доставка 1 дня</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/70">Оптовые цены</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-white/70">Консультация</span>
          </div>
        </div>
      </div>
    </div>
  );
}
