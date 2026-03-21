import { notFound, redirect } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import { Truck, Shield, RotateCcw, Phone, ChevronRight, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProductCard } from "@/components/shared/product-card";
import { AddToCartSection } from "@/components/shared/add-to-cart-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { prisma } from "@/lib/prisma-client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

const unitLabels: Record<string, string> = {
  PCS: "шт",
  METER: "м",
  M2: "м²",
  KG: "кг",
  PACK: "уп",
  SET: "компл",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // Для старых числовых ID не генерируем мета — будет редирект
  if (/^\d+$/.test(slug)) return { title: "Перенаправление..." };

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      code: true,
      price: true,
      specialPrice: true,
      unit: true,
      images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
      category: { select: { name: true } },
    },
  });
  if (!product) return { title: "Товар не найден" };

  const effectivePrice = product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price
    ? product.specialPrice
    : product.price;
  const unit = unitLabels[product.unit] || "шт";
  const imageUrl = product.images[0]?.url;

  return {
    title: `${product.name} — купить в Москве | МеталлЛидер`,
    description: `${product.name}${product.code ? ` (арт. ${product.code})` : ""}. Цена от ${effectivePrice.toLocaleString("ru-RU")} ₽/${unit}. ${product.category?.name || "Металлопрокат"} с доставкой по Москве и МО. В наличии на складе.`,
    alternates: {
      canonical: `${SITE_URL}/product/${slug}`,
    },
    openGraph: {
      title: `${product.name} — МеталлЛидер`,
      description: `Цена от ${effectivePrice.toLocaleString("ru-RU")} ₽/${unit}. Доставка по Москве и МО.`,
      url: `${SITE_URL}/product/${slug}`,
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`, width: 800, height: 800, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // 301 redirect: старые URL вида /product/123 → /product/[slug]
  if (/^\d+$/.test(slug)) {
    const oldProduct = await prisma.product.findUnique({
      where: { oldId: parseInt(slug, 10) },
      select: { slug: true },
    });
    if (oldProduct) {
      redirect(`/product/${oldProduct.slug}`);
    }
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      attributes: {
        include: { attribute: { include: { group: true } } },
        orderBy: { attribute: { sortOrder: "asc" } },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const hasDiscount =
    !!product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.specialPrice!) / product.price) * 100)
    : 0;

  const unit = unitLabels[product.unit] || "шт";

  // Find sibling products with same dimensions but different thickness
  const attrMap = new Map(product.attributes.map((pa) => [pa.attribute.key, pa.value]));
  const dimensionKeys = [
    ["prof_height", "prof_width"],
    ["ugol_a", "ugol_b"],
    ["beam_flange", "beam_number"],
    ["diameter"],
  ];

  let thicknessVariants: { slug: string; thickness: string; price: number; isCurrent: boolean }[] = [];

  // Find which dimension combo this product uses
  for (const combo of dimensionKeys) {
    const vals = combo.map((k) => attrMap.get(k)).filter(Boolean);
    if (vals.length === combo.length) {
      // Find all products in same category with same dimension values
      const siblings = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          attributes: {
            some: {
              attribute: { key: combo[0] },
              value: vals[0]!,
            },
          },
        },
        select: {
          id: true,
          slug: true,
          price: true,
          specialPrice: true,
          attributes: {
            where: { attribute: { key: { in: [...combo, "thickness"] } } },
            select: { value: true, attribute: { select: { key: true } } },
          },
        },
      });

      // Filter: same dimensions, collect thickness variants
      thicknessVariants = siblings
        .filter((s) => {
          // Check all dimension keys match
          return combo.every((k) => {
            const sVal = s.attributes.find((a) => a.attribute.key === k)?.value;
            return sVal === attrMap.get(k);
          });
        })
        .map((s) => {
          const thick = s.attributes.find((a) => a.attribute.key === "thickness")?.value || "";
          const effectivePrice = s.specialPrice && s.specialPrice > 0 && s.specialPrice < s.price ? s.specialPrice : s.price;
          return { slug: s.slug, thickness: thick, price: effectivePrice, isCurrent: s.id === product.id };
        })
        .filter((v) => v.thickness)
        .sort((a, b) => parseFloat(a.thickness) - parseFloat(b.thickness));

      break;
    }
  }

  // Related products from same category
  const relatedDb = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: product.id },
        },
        include: {
          images: { orderBy: { position: "asc" } },
          attributes: {
            include: { attribute: true },
            orderBy: { attribute: { sortOrder: "asc" } },
          },
        },
        take: 4,
      })
    : [];

  const relatedProducts = relatedDb.map((p) => ({
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

  const mainImage = product.images[0]?.url || null;

  const breadcrumbItems = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(product.category ? [{ name: product.category.name, href: `/catalog/${product.category.slug}` }] : []),
    { name: product.name, href: `/product/${product.slug}` },
  ];

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      <ProductJsonLd
        name={product.name}
        slug={product.slug}
        description={product.description || `${product.name} — купить в МеталлЛидер с доставкой по Москве и МО.`}
        price={product.price}
        specialPrice={product.specialPrice || undefined}
        code={product.code || undefined}
        image={mainImage || undefined}
        inStock={product.stock > 0}
        category={product.category?.name}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Container className="py-6 lg:py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog">Каталог</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/catalog/${product.category.slug}`}>
                      {product.category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* Main product section */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={product.images.map((img) => ({ url: img.url }))}
              name={product.name}
            />
          </div>

          {/* Right: Product info */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isHit && (
                <Badge className="bg-primary text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Хит продаж
                </Badge>
              )}
              {product.isNew && (
                <Badge className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Новинка
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl font-(family-name:--font-unbounded) leading-tight">
              {product.name}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
              {product.code && (
                <span className="text-sm text-neutral-400">
                  Арт. <span className="text-neutral-600 font-medium">{product.code}</span>
                </span>
              )}
              {product.category && (
                <Link
                  href={`/catalog/${product.category.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Price card */}
            <div className="mt-6 rounded-2xl bg-white border border-neutral-200 p-6">
              <div className="flex items-end gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-4xl font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                      {product.specialPrice!.toLocaleString("ru-RU")} &#8381;
                    </span>
                    <span className="text-lg text-neutral-400 line-through mb-1">
                      {product.price.toLocaleString("ru-RU")} &#8381;
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                    {product.price.toLocaleString("ru-RU")} &#8381;
                  </span>
                )}
                <span className="text-sm text-neutral-400 mb-1.5">/ {unit}</span>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 mt-4">
                {product.stock > 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">В наличии на складе</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">Под заказ</span>
                  </>
                )}
              </div>

              {/* Thickness variants */}
              {thicknessVariants.length > 1 && (
                <div className="mt-5 pt-5 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2.5">Толщина стенки</p>
                  <div className="flex flex-wrap gap-2">
                    {thicknessVariants.map((v) => (
                      v.isCurrent ? (
                        <span
                          key={v.slug}
                          className="inline-flex flex-col items-center rounded-xl bg-primary text-white px-4 py-2 min-w-[60px]"
                        >
                          <span className="text-sm font-bold">{v.thickness} мм</span>
                          <span className="text-[10px] text-white/70">{v.price.toLocaleString("ru-RU")} ₽</span>
                        </span>
                      ) : (
                        <Link
                          key={v.slug}
                          href={`/product/${v.slug}`}
                          className="inline-flex flex-col items-center rounded-xl border border-neutral-200 bg-white px-4 py-2 min-w-[60px] hover:border-primary/40 hover:bg-primary/5 transition-all"
                        >
                          <span className="text-sm font-bold text-neutral-800">{v.thickness} мм</span>
                          <span className="text-[10px] text-neutral-400">{v.price.toLocaleString("ru-RU")} ₽</span>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart */}
              <div className="mt-5">
                <AddToCartSection
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    code: product.code || "",
                    price: product.price,
                    specialPrice: product.specialPrice || undefined,
                    unit,
                    image: mainImage,
                  }}
                />
              </div>

              {/* Quick contact */}
              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-neutral-100">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm text-neutral-500">Нужна консультация?</span>
                <a href="tel:+74957605539" className="text-sm font-semibold text-neutral-900 hover:text-primary transition-colors">
                  +7 (495) 760-55-39
                </a>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-neutral-200 p-4 text-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Доставка</p>
                  <p className="text-[11px] text-neutral-400">По Москве и МО</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-neutral-200 p-4 text-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Гарантия</p>
                  <p className="text-[11px] text-neutral-400">Сертификат ГОСТ</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-neutral-200 p-4 text-center">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Возврат</p>
                  <p className="text-[11px] text-neutral-400">14 дней</p>
                </div>
              </div>
            </div>

            {/* Attributes / Specs inline */}
            {(product.attributes.length > 0 || product.code) && (() => {
              // Build a map of key → value for dimension combining
              const attrMap = new Map(
                product.attributes.map((pa) => [pa.attribute.key, pa])
              );

              // Define dimension combos: [groupId prefix, label, keys[], unit]
              const dimensionCombos: { keys: string[]; label: string; unit: string }[] = [
                { keys: ["prof_height", "prof_width", "thickness"], label: "Размер", unit: "мм" },
                { keys: ["ugol_a", "ugol_b", "thickness"], label: "Размер", unit: "мм" },
                { keys: ["beam_flange", "beam_number"], label: "Размер", unit: "мм" },
                { keys: ["diameter", "thickness"], label: "Размер", unit: "мм" },
                { keys: ["width", "length", "thickness"], label: "Размер", unit: "мм" },
              ];

              // Find first matching combo where at least 2 keys have values
              let comboRow: { label: string; value: string; unit: string } | null = null;
              const hiddenKeys = new Set<string>();

              for (const combo of dimensionCombos) {
                const vals = combo.keys.map((k) => attrMap.get(k)?.value).filter(Boolean) as string[];
                if (vals.length >= 2) {
                  comboRow = { label: combo.label, value: vals.join("х"), unit: combo.unit };
                  combo.keys.forEach((k) => { if (attrMap.has(k)) hiddenKeys.add(k); });
                  break;
                }
              }

              // Filter out hidden attributes (already shown in combo row)
              const visibleAttrs = product.attributes.filter(
                (pa) => !hiddenKeys.has(pa.attribute.key)
              );

              return (
                <div className="mt-4 rounded-2xl bg-white border border-neutral-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100">
                    <h3 className="text-sm font-bold text-neutral-900">Характеристики</h3>
                  </div>
                  <div className="divide-y divide-neutral-50">
                    {product.code && (
                      <div className="flex items-center justify-between px-6 py-3">
                        <span className="text-sm text-neutral-500">Артикул</span>
                        <span className="text-sm font-medium text-neutral-900">{product.code}</span>
                      </div>
                    )}
                    {comboRow && (
                      <div className="flex items-center justify-between px-6 py-3">
                        <span className="text-sm text-neutral-500">{comboRow.label}</span>
                        <span className="text-sm font-bold text-neutral-900">
                          {comboRow.value}
                          <span className="ml-1 font-medium text-neutral-400">{comboRow.unit}</span>
                        </span>
                      </div>
                    )}
                    {visibleAttrs.map((pa) => (
                      <div key={pa.id} className="flex items-center justify-between px-6 py-3">
                        <span className="text-sm text-neutral-500">{pa.attribute.name}</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {pa.value}
                          {pa.attribute.unit && (
                            <span className="ml-1 text-neutral-400">{pa.attribute.unit}</span>
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-6 py-3">
                      <span className="text-sm text-neutral-500">Единица измерения</span>
                      <span className="text-sm font-medium text-neutral-900">{unit}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Description & Delivery section */}
        <div className="grid gap-4 lg:grid-cols-2 mt-8">
          {/* Description */}
          <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Описание</h3>
            </div>
            <div className="px-6 py-5">
              <div
                className="prose prose-sm max-w-none text-neutral-600 prose-headings:text-neutral-900 prose-strong:text-neutral-900"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    product.description ||
                    `<p>${product.name} — сертифицированная металлопродукция от проверенных производителей. Подходит для строительных, промышленных и бытовых задач. Соответствует стандартам ГОСТ.</p>`,
                    { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col"]) }
                  ),
                }}
              />
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Доставка и оплата</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Самовывоз — бесплатно</p>
                  <p className="text-xs text-neutral-500 mt-0.5">АНГАР 4, шоссе Автомагистраль Москва — Нижний Новгород, вл19к4</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-50 shrink-0 mt-0.5">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Доставка по Москве — от 1 500 &#8381;</p>
                  <p className="text-xs text-neutral-500 mt-0.5">По МО рассчитывается индивидуально</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-50 shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Срок 1 рабочих дня</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Точные сроки уточняйте у менеджера</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                Похожие товары
              </h2>
              {product.category && (
                <Link
                  href={`/catalog/${product.category.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Все в категории <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
