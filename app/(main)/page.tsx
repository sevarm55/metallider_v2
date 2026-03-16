import Image from "next/image";
import Link from "next/link";
import { Truck, Shield, BadgePercent, Headset, ArrowRight, MapPin, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { HeroBento } from "@/components/shared/hero-bento";
import { ProductCard } from "@/components/shared/product-card";
import { MetalCalculator } from "@/components/shared/metal-calculator";
import { CustomerReviews } from "@/components/shared/customer-reviews";
import { contactInfo } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma-client";

const unitLabels: Record<string, string> = {
  PCS: "шт",
  METER: "м",
  M2: "м²",
  KG: "кг",
  PACK: "уп",
  SET: "компл",
};

const advantages = [
  {
    icon: Truck,
    title: "Доставка",
    description: "По Москве и Московской области. Самовывоз со склада.",
  },
  {
    icon: Shield,
    title: "Гарантия качества",
    description: "Сертифицированная продукция от проверенных производителей.",
  },
  {
    icon: BadgePercent,
    title: "Оптовые цены",
    description: "Специальные условия для оптовых покупателей и строителей.",
  },
  {
    icon: Headset,
    title: "Консультация",
    description: "Поможем подобрать металлопрокат для вашего проекта.",
  },
];


export default async function HomePage() {
  const [dbCategories, dbProducts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { products: { where: { isActive: true } } } },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, isHit: true },
      include: {
        images: { orderBy: { position: "asc" } },
        attributes: {
          include: { attribute: true },
          orderBy: { attribute: { sortOrder: "asc" } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const popularProducts = dbProducts.map((p) => ({
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
      {/* Hero Bento */}
      <section className="bg-neutral-50">
        <Container className="py-4">
          <HeroBento />
        </Container>
      </section>

      {/* Categories — horizontal scroll */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              КАТАЛОГ
            </span>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="block h-7 w-1 rounded-full bg-orange-500" />
                  <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                    Металлопрокат
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                  Каталог товаров
                </h2>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/catalog" className="gap-1 text-primary hover:text-primary/80">
                  Все категории <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>

        <Container>
          <div className="flex gap-5 overflow-x-auto -mr-4 sm:-mr-6 lg:-mr-8 pr-4 sm:pr-6 lg:pr-8 pb-6 scrollbar-hide snap-x snap-mandatory">
            {dbCategories.map((parent, idx) => {
              const totalProducts = parent._count.products + parent.children.reduce((acc, sub) => acc + sub._count.products, 0);
              const image = parent.image;

              return (
                <Link
                  key={parent.id}
                  href={`/catalog/${parent.slug}`}
                  className="group relative flex h-96 w-80 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Background image */}
                  {image ? (
                    <Image
                      src={image}
                      alt={parent.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-700" />
                  )}

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/10" />

                  {/* Background number */}
                  <span className="pointer-events-none absolute right-4 top-3 z-10 select-none text-[6rem] font-black leading-none text-white/10 font-(family-name:--font-unbounded)">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Count badge */}
                  <span className="absolute top-5 left-5 z-10 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {totalProducts} товаров
                  </span>

                  {/* Content */}
                  <div className="relative z-10 p-6">
                    <h3 className="text-xl font-bold text-white font-(family-name:--font-unbounded)">
                      {parent.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/60 line-clamp-1">
                      {parent.children.map((s) => s.name).join(", ")}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      Смотреть <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="bg-neutral-50 py-12 lg:py-16">
          <Container>
            <div className="relative mb-10 overflow-hidden">
              <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
                ХИТЫ
              </span>
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="block h-7 w-1 rounded-full bg-orange-500" />
                    <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                      Лучший выбор
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                    Популярные товары
                  </h2>
                </div>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/catalog" className="gap-1 text-primary hover:text-primary/80">
                    Все товары <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Metal Calculator */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              РАСЧЁТ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  Инструмент
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                Калькулятор металла
              </h2>
              <p className="mt-2 text-muted-foreground">
                Быстрый расчёт веса металлопроката по размерам
              </p>
            </div>
          </div>
          <MetalCalculator />
        </Container>
      </section>

      {/* Customer Reviews */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ОТЗЫВЫ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  Наши клиенты
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                Отзывы клиентов
              </h2>
            </div>
          </div>
          <CustomerReviews />
        </Container>
      </section>

      {/* Advantages */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              ПОЧЕМУ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
                  Преимущества
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                Почему выбирают нас
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((adv, idx) => (
              <div
                key={adv.title}
                className="group relative overflow-hidden rounded-2xl bg-white  p-6 transition-all duration-300 hover:shadow-2xl"
              >
                {/* Background number */}
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                    <adv.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">
                    {adv.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {adv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* About + Contact */}
      <section className="relative overflow-hidden bg-neutral-50  py-16 lg:py-24">
        {/* Background decorative text */}
        <span className="pointer-events-none absolute top-6 left-0 select-none text-[clamp(5rem,12vw,12rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          METALLLIDER
        </span>

        <Container>
          <div className="relative grid gap-10 lg:grid-cols-5 lg:gap-16">
            {/* About — 3 cols */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="block h-7 w-1 rounded-full bg-primary" />
                  <span className="text-sm font-bold uppercase tracking-widest text-primary">
                    О компании
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
                  Металл<span className="text-primary">Лидер</span>
                </h2>
                <p className="mt-6 text-base leading-relaxed text-neutral-400 max-w-2xl">
                  Ваш надёжный поставщик металлопроката. Мы предлагаем более 336
                  наименований продукции: трубы профильные и круглые, листы,
                  арматура, уголки, швеллеры, балки, профнастил и метизы.
                  Работаем как с розничными, так и с оптовыми покупателями.
                </p>
                <p className="mt-3 text-base leading-relaxed text-neutral-400 max-w-2xl">
                  В нашем ассортименте продукция ведущих производителей:
                  Северсталь и другие. Все товары сертифицированы и
                  соответствуют стандартам качества.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild className="rounded-xl h-12 px-6 text-sm font-bold bg-primary text-white hover:bg-primary/90">
                    <Link href="/about">Подробнее о компании</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-xl h-12 px-6 text-sm font-bold border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-100"
                  >
                    <Link href="/contacts">Связаться с нами</Link>
                  </Button>
                </div>
              </div>

            {/* Contact card — 2 cols */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                  Наш склад
                </h3>
                <p className="mt-1 text-sm text-primary font-semibold">
                  {contactInfo.warehouse}
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Адрес</p>
                      <p className="mt-0.5 text-sm text-neutral-300">{contactInfo.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Режим работы</p>
                      <p className="mt-0.5 text-sm text-neutral-300">{contactInfo.workingDays}</p>
                      <p className="text-sm text-neutral-300">{contactInfo.workingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Телефон</p>
                      <a
                        href={`tel:${contactInfo.phoneRaw}`}
                        className="mt-0.5 block text-lg font-bold text-neutral-900 hover:text-primary transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                      <a href={`mailto:${contactInfo.email}`} className="text-sm text-neutral-400 hover:text-primary transition-colors">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>

                <Button asChild className="mt-6 w-full rounded-xl h-11 bg-primary text-white hover:bg-primary/90">
                  <Link href="/contacts">Построить маршрут</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
