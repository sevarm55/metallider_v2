import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { contactInfo } from "@/lib/mock-data";

export function HeroBento() {
  return (
    <div className="relative overflow-hidden">
      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 min-h-[420px] lg:min-h-[520px]">
        {/* Left column — 2 stacked images */}
        <div className="hidden lg:grid lg:col-span-4 grid-rows-2 gap-2 sm:gap-3">
          {/* Top image */}
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/images/categories/truby2.png"
              alt="Трубы профильные"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 z-10">
              <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                Трубы профильные
              </span>
            </div>
          </div>

          {/* Bottom image */}
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src="/images/categories/listy2.png"
              alt="Листовой прокат"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-4 z-10">
              <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                Листовой прокат
              </span>
            </div>
          </div>
        </div>

        {/* Right — large hero image with text */}
        <div className="relative overflow-hidden rounded-2xl lg:col-span-8 min-h-[380px] lg:min-h-0">
          {/* Video background with image fallback */}
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
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
            {/* Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Более 336 наименований
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[0.95] font-(family-name:--font-unbounded)">
              МЕТАЛЛО
              <br />
              ПРОКАТ
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-md text-sm sm:text-base text-white/60 leading-relaxed">
              Трубы, листы, арматура, уголки, швеллеры — оптом и в розницу с доставкой по Москве и МО.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-all"
              >
                В каталог
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                <Phone className="h-4 w-4 text-primary" />
                {contactInfo.phone}
              </a>
            </div>
          </div>

          {/* Decorative large text */}
          <span className="pointer-events-none absolute right-6 top-6 select-none text-[clamp(4rem,10vw,9rem)] font-black leading-none text-white/4 font-(family-name:--font-unbounded)">
            ML
          </span>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="mt-2 sm:mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-neutral-100 px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Сертификаты</p>
            <p className="text-[10px] text-neutral-500">На всю продукцию</p>
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-100 px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Быстрая доставка</p>
            <p className="text-[10px] text-neutral-500">По Москве и МО</p>
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-100 px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Оптовые цены</p>
            <p className="text-[10px] text-neutral-500">Для строителей</p>
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-100 px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Консультация</p>
            <p className="text-[10px] text-neutral-500">Бесплатная помощь</p>
          </div>
        </div>
      </div>
    </div>
  );
}
