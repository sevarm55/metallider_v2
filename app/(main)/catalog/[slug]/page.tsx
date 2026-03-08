import { notFound } from "next/navigation";
import Link from "next/link";
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
import { prisma } from "@/lib/prisma-client";

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
    select: { name: true },
  });
  if (!category) return { title: "Категория не найдена" };
  return {
    title: `${category.name} — МеталлЛидер`,
    description: `${category.name} — купить по выгодной цене в МеталлЛидер.`,
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
    // Parent category: get products from ALL children
    categoryIds = category.children.map((c) => c.id);
  } else {
    // Subcategory or leaf: get products only from this category
    categoryIds = [category.id];
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
    orderBy: { createdAt: "desc" },
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
      name: a.attribute.name,
      value: a.value,
      unit: a.attribute.unit,
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

  return (
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

      <h1 className="mb-1 text-3xl font-bold">{category.name}</h1>
      <p className="mb-6 text-muted-foreground">
        {products.length} {products.length === 1 ? "товар" : "товаров"}
      </p>

      {isParent ? (
        <CategoryProducts
          products={products}
          subcategories={subcategories}
        />
      ) : siblings.length > 1 ? (
        <div>
          {/* Show sibling tabs for navigation */}
          <div className="mb-6 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/catalog/${s.slug}`}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  s.id === category.id
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary hover:text-primary"
                }`}
              >
                {s.name}
                <span className="ml-1.5 text-xs opacity-60">{s.count}</span>
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
  );
}
