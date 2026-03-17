export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { CategoryProducts } from "@/components/shared/category-products";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/shared/json-ld";
import { prisma } from "@/lib/prisma-client";

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
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      parent: { select: { name: true } },
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  if (!category) return { title: "Категория не найдена" };

  const parentName = category.parent?.name;
  const title = `${category.name} — купить в Москве | МеталлЛидер`;
  const description = `${category.name}${parentName ? ` (${parentName})` : ""} — ${category._count.products} товаров в наличии. Низкие цены, доставка по Москве и МО. Купить ${category.name.toLowerCase()} в МеталлЛидер.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/catalog/${slug}`,
    },
    openGraph: {
      title: `${category.name} — МеталлЛидер`,
      description,
      url: `${SITE_URL}/catalog/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { id: true, name: true, slug: true } },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category) notFound();

  const isParent = !category.parentId && category.children.length > 0;

  // Build category IDs to query products from
  let categoryIds: string[];
  if (isParent) {
    // Parent category: get products from ALL children + own products
    categoryIds = [category.id, ...category.children.map((c) => c.id)];
  } else {
    // Subcategory or leaf: get products only from this category
    categoryIds = [category.id];
  }

  // Natural sort: extract numbers from name for sorting by dimensions
  // e.g. "Труба профильная 15х15х1.5" → [15, 15, 1.5]
  function extractNumbers(name: string): number[] {
    // Find the dimensions pattern like "15х15х1.5" or "100x50x3"
    const match = name.match(/[\d]+[.,]?\d*[хxХX×][\d]+[.,]?\d*(?:[хxХX×][\d]+[.,]?\d*)*/);
    if (match) {
      return match[0].split(/[хxХX×]/).map((n) => parseFloat(n.replace(",", ".")));
    }
    // Fallback: find any standalone number (e.g. "Арматура ф 10")
    const nums = name.match(/\d+[.,]?\d*/g);
    return nums ? nums.map((n) => parseFloat(n.replace(",", "."))) : [];
  }

  const dbProducts = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds }, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      attributes: {
        include: { attribute: true },
        orderBy: { attribute: { sortOrder: "asc" } },
      },
    },
  });

  // Sort naturally by dimensions (small → large)
  dbProducts.sort((a, b) => {
    const numsA = extractNumbers(a.name);
    const numsB = extractNumbers(b.name);
    for (let i = 0; i < Math.max(numsA.length, numsB.length); i++) {
      const na = numsA[i] ?? 0;
      const nb = numsB[i] ?? 0;
      if (na !== nb) return na - nb;
    }
    return a.name.localeCompare(b.name, "ru");
  });

  const products = dbProducts.map((p) => ({
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
    categoryId: p.categoryId || "",
    attributes: p.attributes.map((a) => ({
      key: a.attribute.key,
      name: a.attribute.name,
      value: a.value,
      unit: a.attribute.unit,
      isFilter: a.attribute.isFilter,
    })),
  }));

  // Subcategories with product counts (for filter tabs)
  // Strip parent name prefix from subcategory names for shorter tabs
  const stripParentPrefix = (childName: string, parentName: string) => {
    const lower = childName.toLowerCase();
    const parentLower = parentName.toLowerCase();
    if (lower.startsWith(parentLower)) {
      const stripped = childName.slice(parentName.length).trim();
      if (stripped) return stripped.charAt(0).toUpperCase() + stripped.slice(1);
    }
    return childName;
  };

  const subcategories = isParent
    ? category.children.map((sub) => ({
        id: sub.id,
        name: stripParentPrefix(sub.name, category.name),
        slug: sub.slug,
        count: products.filter((p) => p.categoryId === sub.id).length,
      }))
    : [];

  // Sibling categories if this is a subcategory (for filter tabs)
  let siblings: { id: string; name: string; slug: string; count: number }[] = [];
  if (category.parentId && category.parent) {
    const siblingCats = await prisma.category.findMany({
      where: { parentId: category.parentId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });
    siblings = siblingCats.map((s) => ({
      id: s.id,
      name: stripParentPrefix(s.name, category.parent!.name),
      slug: s.slug,
      count: s._count.products,
    }));
  }

  const breadcrumbItems = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    ...(category.parent ? [{ name: category.parent.name, href: `/catalog/${category.parent.slug}` }] : []),
    { name: category.name, href: `/catalog/${category.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ItemListJsonLd
        items={products.map((p) => ({ name: p.name, slug: p.slug, price: p.price, image: p.images[0] }))}
        categoryName={category.name}
      />
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
          {/* If subcategory, show parent in breadcrumb */}
          {category.parent && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/catalog/${category.parent.slug}`}>
                    {category.parent.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative mb-10 overflow-hidden">
        <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          {category.name.split(" ")[0]}
        </span>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              {category.parent ? category.parent.name : "Каталог"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            {category.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {products.length} {products.length === 1 ? "товар" : "товаров"}
          </p>
        </div>
      </div>

      {isParent ? (
        <CategoryProducts
          products={products}
          subcategories={subcategories}
        />
      ) : siblings.length > 1 ? (
        <div>
          {/* Sibling category cards with "All" link */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:gap-4">
            {/* All products card → parent category */}
            <Link
              href={`/catalog/${category.parent!.slug}`}
              className="group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            >
              <span className="text-sm font-semibold">Все товары</span>
              <span className="text-xs font-medium text-neutral-400">{siblings.reduce((sum, s) => sum + s.count, 0)}</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 text-neutral-400" />
            </Link>
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/catalog/${s.slug}`}
                className={`group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 ${
                  s.id === category.id
                    ? "bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <span className="text-sm font-semibold">{s.name}</span>
                <span className={`text-xs font-medium ${
                  s.id === category.id ? "text-primary" : "text-neutral-400"
                }`}>{s.count}</span>
                <ArrowRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                  s.id === category.id ? "text-primary" : "text-neutral-400"
                }`} />
              </Link>
            ))}
          </div>
          {products.length > 0 ? (
            <CategoryProducts products={products} subcategories={[]} />
          ) : (
            <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">
                В этой категории пока нет товаров
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {products.length > 0 ? (
            <CategoryProducts products={products} subcategories={[]} />
          ) : (
            <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">
                В этой категории пока нет товаров
              </p>
            </div>
          )}
        </div>
      )}
    </Container>
    </>
  );
}
