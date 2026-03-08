import Link from "next/link";
import { Truck, Shield, BadgePercent, Headset, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { HeroCarousel } from "@/components/shared/hero-carousel";
import { ProductCard } from "@/components/shared/product-card";
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
      {/* Hero */}
      <section>
        <Container className="py-6">
          <HeroCarousel />
        </Container>
      </section>

      {/* Categories */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Каталог товаров</h2>
            <Button variant="ghost" asChild>
              <Link href="/catalog" className="gap-1 text-primary hover:text-primary/80">
                Все категории <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dbCategories.map((parent) => (
              <div
                key={parent.id}
                className="rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <Link
                  href={`/catalog/${parent.slug}`}
                  className="text-lg font-bold text-neutral-900 hover:text-primary transition-colors"
                >
                  {parent.name}
                </Link>
                <ul className="mt-3 space-y-1.5">
                  {parent.children.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/catalog/${sub.slug}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ChevronRight className="h-3.5 w-3.5" />
                          {sub.name}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {sub._count.products}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="bg-neutral-50 py-12 lg:py-16">
          <Container>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Популярные товары</h2>
              <Button variant="ghost" asChild>
                <Link href="/catalog" className="gap-1 text-primary hover:text-primary/80">
                  Все товары <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Advantages */}
      <section className="py-12 lg:py-16">
        <Container>
          <h2 className="mb-8 text-center text-2xl font-bold">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((adv) => (
              <div
                key={adv.title}
                className="flex flex-col items-center gap-3 rounded-xl border bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <adv.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold">{adv.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {adv.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* About + Contact */}
      <section className="bg-neutral-900 text-white py-12 lg:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">О компании</h2>
              <p className="mt-4 leading-relaxed text-white/80">
                <strong className="text-white">МеталлЛидер</strong> — ваш
                надёжный поставщик металлопроката. Мы предлагаем более 336
                наименований продукции: трубы профильные и круглые, листы,
                арматура, уголки, швеллеры, балки, профнастил и метизы.
                Работаем как с розничными, так и с оптовыми покупателями.
              </p>
              <p className="mt-3 leading-relaxed text-white/80">
                В нашем ассортименте продукция ведущих производителей:
                Северсталь и другие. Все товары сертифицированы и
                соответствуют стандартам качества.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/about">Подробнее о компании</Link>
              </Button>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold">Наш склад</h3>
              <div className="mt-4 space-y-3 text-sm text-white/80">
                <p className="text-lg font-bold text-white">
                  {contactInfo.warehouse}
                </p>
                <p>{contactInfo.address}</p>
                <p>{contactInfo.workingHours}</p>
                <p>{contactInfo.workingDays}</p>
                <hr className="border-white/20" />
                <a
                  href={`tel:${contactInfo.phoneRaw}`}
                  className="block text-xl font-bold text-primary"
                >
                  {contactInfo.phone}
                </a>
                <a href={`mailto:${contactInfo.email}`} className="block hover:text-primary transition-colors">
                  {contactInfo.email}
                </a>
              </div>
              <Button
                asChild
                className="mt-6"
              >
                <Link href="/contacts">Построить маршрут</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
