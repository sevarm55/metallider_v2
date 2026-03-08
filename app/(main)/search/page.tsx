import Link from "next/link";
import { Container } from "@/components/shared/container";
import { ProductsView } from "@/components/shared/products-view";
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
  PCS: "шт", METER: "м", M2: "м²", KG: "кг", PACK: "уп", SET: "компл",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return { title: q ? `Поиск: ${q} — МеталлЛидер` : "Поиск — МеталлЛидер" };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let products: any[] = [];

  if (query.length >= 2) {
    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        images: { orderBy: { position: "asc" } },
        attributes: {
          include: { attribute: true },
          orderBy: { attribute: { sortOrder: "asc" } },
        },
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    products = dbProducts.map((p) => ({
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
            <BreadcrumbPage>Поиск</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-1 text-3xl font-bold">
        {query ? `Результаты поиска: «${query}»` : "Поиск"}
      </h1>
      <p className="mb-8 text-muted-foreground">
        {query
          ? `Найдено ${products.length} товаров`
          : "Введите запрос для поиска"}
      </p>

      {products.length > 0 ? (
        <ProductsView products={products} />
      ) : query.length >= 2 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            По запросу «{query}» ничего не найдено
          </p>
        </div>
      ) : null}
    </Container>
  );
}
