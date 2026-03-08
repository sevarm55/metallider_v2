import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Percent, Truck, Gift, ArrowRight, Phone, Scissors } from "lucide-react";
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
  title: "Акции — МеталлЛидер",
  description: "Акции и специальные предложения на металлопрокат.",
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
    gradient: "from-orange-500 to-red-500",
    bg: "bg-gradient-to-br from-orange-50 to-red-50",
    ring: "ring-orange-200/60",
  },
  {
    id: "2",
    icon: Truck,
    title: "Бесплатная доставка от 50 000 ₽",
    desc: "Оформите заказ на сумму от 50 000 ₽ и получите бесплатную доставку по Москве. Экономия до 7 000 ₽!",
    badge: "Постоянная",
    endDate: null,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    ring: "ring-emerald-200/60",
  },
  {
    id: "3",
    icon: Percent,
    title: "Скидка 10% для оптовиков",
    desc: "При заказе от 100 000 ₽ — дополнительная скидка 10% на весь ассортимент. Для строительных компаний и постоянных клиентов.",
    badge: "Опт",
    endDate: "2026-05-01",
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    ring: "ring-blue-200/60",
  },
  {
    id: "4",
    icon: Scissors,
    title: "Резка в подарок",
    desc: "При покупке листового проката — резка в размер бесплатно. До 10 резов на один заказ. Точность ±1мм.",
    badge: "Подарок",
    endDate: "2026-03-31",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-gradient-to-br from-violet-50 to-purple-50",
    ring: "ring-violet-200/60",
  },
  {
    id: "5",
    icon: Gift,
    title: "Приведи друга — получи скидку",
    desc: "Расскажите о нас партнёру. При его первом заказе вы оба получите скидку 5% на следующую покупку.",
    badge: "Новинка",
    endDate: "2026-06-01",
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    ring: "ring-pink-200/60",
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
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Акции</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Акции и спецпредложения</h1>
      <p className="mt-2 mb-10 text-muted-foreground max-w-2xl">
        Выгодные условия на металлопрокат — следите за сроками, некоторые акции ограничены
      </p>

      {/* Timeline */}
      <div className="relative mb-14">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-neutral-200 to-transparent hidden md:block" />

        <div className="space-y-6">
          {promos.map((p, idx) => (
            <div key={p.id} className="relative md:pl-16">
              {/* Timeline dot */}
              <div className={`absolute left-4 top-6 hidden h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${p.gradient} shadow-md ring-4 ring-white md:flex`}>
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>

              {/* Card */}
              <div className={`group overflow-hidden rounded-2xl ${p.bg} ring-1 ${p.ring} transition-all duration-300 hover:shadow-xl hover:shadow-black/5`}>
                {/* Top gradient bar */}
                <div className={`h-1 bg-gradient-to-r ${p.gradient}`} />

                <div className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left */}
                    <div className="flex gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} shadow-lg`}>
                        <p.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-lg font-bold text-neutral-900">{p.title}</h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/80 text-neutral-600 ring-1 ring-neutral-200/50`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">{p.desc}</p>
                      </div>
                    </div>

                    {/* Right — countdown */}
                    <div className="shrink-0 sm:text-right">
                      {p.endDate ? (
                        <PromoCountdown endDate={p.endDate} gradient={p.gradient} />
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Бессрочная
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount products */}
      {products.length > 0 && (
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Товары со скидкой</h2>
              <p className="mt-1 text-sm text-muted-foreground">Специальные цены на выбранные позиции</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/catalog" className="gap-1 text-primary">
                Все товары <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-orange-600 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Хотите индивидуальную скидку?</h2>
        <p className="mt-2 text-sm text-white/80">
          Позвоните нам — для крупных заказов действуют особые условия
        </p>
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg" variant="secondary">
            <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
              <Phone className="h-4 w-4" />
              {contactInfo.phone}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
