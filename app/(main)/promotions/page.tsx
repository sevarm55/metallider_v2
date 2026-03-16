export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Percent, Gift, ArrowRight, Phone, Scissors, BadgePercent, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProductCard } from "@/components/shared/product-card";
import { PromoCountdown } from "@/components/shared/promo-countdown";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma-client";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Акции и скидки — МеталлЛидер",
  description: "Акции и специальные предложения на металлопрокат. Горячие цены, бесплатная доставка, скидки для оптовиков.",
};

const unitLabels: Record<string, string> = {
  PCS: "шт", METER: "м", M2: "м²", KG: "кг", PACK: "уп", SET: "компл",
};

const promos = [
  {
    id: "1",
    icon: Flame,
    title: "Горячие цены на трубы",
    desc: "Специальные цены на профильные и электросварные трубы. Успейте купить по лучшей цене — количество ограничено!",
    badge: "Хит",
    endDate: "2026-04-15",
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-500",
    badgeBg: "bg-orange-500/10 text-orange-500 ring-orange-500/20",
  },
  {
    id: "3",
    icon: Percent,
    title: "Скидка 10% для оптовиков",
    desc: "При заказе от 100 000 ₽ — дополнительная скидка 10% на весь ассортимент. Для строительных компаний и постоянных клиентов.",
    badge: "Опт",
    endDate: "2026-05-01",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
  },
  {
    id: "4",
    icon: Scissors,
    title: "Резка в подарок",
    desc: "При покупке листового проката — резка в размер бесплатно. До 10 резов на один заказ. Точность ±1мм.",
    badge: "Подарок",
    endDate: "2026-03-31",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-500",
    badgeBg: "bg-violet-500/10 text-violet-500 ring-violet-500/20",
  },
  {
    id: "5",
    icon: Gift,
    title: "Приведи друга — получи скидку",
    desc: "Расскажите о нас партнёру. При его первом заказе вы оба получите скидку 5% на следующую покупку.",
    badge: "Новинка",
    endDate: "2026-06-01",
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-500",
    badgeBg: "bg-pink-500/10 text-pink-500 ring-pink-500/20",
  },
];

export default async function PromotionsPage() {
  const discountProducts = await prisma.product.findMany({
    where: { isActive: true, specialPrice: { gt: 0 } },
    include: {
      images: { orderBy: { position: "asc" } },
      attributes: {
        include: { attribute: true },
        orderBy: { attribute: { sortOrder: "asc" } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const products = discountProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    code: p.code || "",
    price: p.price,
    specialPrice: p.specialPrice || undefined,
    unit: unitLabels[p.unit] || "шт",
    isHit: p.isHit,
    isNew: p.isNew,
    images: p.images.map((img) => img.url),
    attributes: p.attributes.map((a) => ({
      name: a.attribute.name,
      value: a.value,
      unit: a.attribute.unit,
    })),
  }));

  return (
    <>
      {/* ── Hero section ── */}
      <section className="relative overflow-hidden bg-neutral-50">
        {/* Background decorative */}
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          АКЦИИ
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--color-primary),0.05),transparent_40%)]" />

        <Container className="relative py-10 lg:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">Акции</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-primary" />
                <span className="text-sm font-bold uppercase tracking-widest text-primary">
                  Спецпредложения
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                Акции и скидки
              </h1>
              <p className="mt-3 text-neutral-400 max-w-xl">
                Выгодные условия на металлопрокат — следите за сроками, некоторые акции ограничены
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-neutral-900">{promos.length} активных акций</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Promo cards grid ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Featured promo — spans 2 cols on lg */}
            {promos.slice(0, 1).map((p, idx) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 transition-all duration-300 hover:shadow-2xl md:col-span-2 lg:col-span-2 lg:row-span-2"
              >
                {/* Background number */}
                <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[10rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  01
                </span>
                {/* Gradient glow */}
                <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full bg-linear-to-br ${p.gradient} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className={`absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-linear-to-br ${p.gradient} opacity-5 blur-3xl`} />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${p.gradient} shadow-lg`}>
                      <p.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${p.badgeBg}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-extrabold text-neutral-900 lg:text-3xl font-(family-name:--font-unbounded)">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400 max-w-lg lg:text-base">
                    {p.desc}
                  </p>

                  <div className="mt-auto pt-8">
                    {p.endDate ? (
                      <PromoCountdown endDate={p.endDate} gradient={p.gradient} />
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-400">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        Бессрочная акция
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Rest of promos */}
            {promos.slice(1).map((p, i) => (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-2xl"
              >
                {/* Background number */}
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  {String(i + 2).padStart(2, "0")}
                </span>
                {/* Gradient glow */}
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${p.gradient} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${p.gradient} shadow-lg`}>
                      <p.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${p.badgeBg}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-neutral-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {p.desc}
                  </p>

                  <div className="mt-auto pt-5">
                    {p.endDate ? (
                      <PromoCountdown endDate={p.endDate} gradient={p.gradient} />
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Бессрочная
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Discount products ── */}
      {products.length > 0 && (
        <section className="bg-neutral-50 py-12 lg:py-16">
          <Container>
            <div className="relative mb-10 overflow-hidden">
              <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
                СКИДКИ
              </span>
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="block h-7 w-1 rounded-full bg-red-500" />
                    <span className="text-sm font-bold uppercase tracking-widest text-red-500">
                      Сниженные цены
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                    Товары со скидкой
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Специальные цены на выбранные позиции из каталога
                  </p>
                </div>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/catalog" className="gap-1 text-primary hover:text-primary/80">
                    Все товары <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── CTA section ── */}
      <section className="relative overflow-hidden bg-neutral-50 py-16 lg:py-20">
        <span className="pointer-events-none absolute top-4 right-0 select-none text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          ЗВОНИТЕ
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />

        <Container className="relative">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <BadgePercent className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
              Хотите индивидуальную скидку?
            </h2>
            <p className="mt-3 text-neutral-400 max-w-md">
              Позвоните нам — для крупных заказов действуют особые условия. Обсудим вашу задачу и подберём лучшее предложение.
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
              <Button asChild size="lg" className="h-13 px-8 text-base font-bold bg-primary text-white hover:bg-primary/90 rounded-xl">
                <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
                  <Phone className="h-5 w-5" />
                  {contactInfo.phone}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 px-8 text-base font-bold border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-100 rounded-xl">
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
