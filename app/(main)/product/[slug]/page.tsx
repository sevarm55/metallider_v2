import { notFound } from "next/navigation";
import Link from "next/link";
import { Truck, Shield, RotateCcw } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProductCard } from "@/components/shared/product-card";
import { AddToCartSection } from "@/components/shared/add-to-cart-section";
import { ProductGallery } from "@/components/shared/product-gallery";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma-client";

export const dynamic = "force-dynamic";

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
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, code: true, price: true },
  });
  if (!product) return { title: "Товар не найден" };
  return {
    title: `${product.name} — купить в МеталлЛидер`,
    description: `${product.name}${product.code ? `, артикул ${product.code}` : ""}. Цена ${product.price} руб. Купить в МеталлЛидер с доставкой.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
      attributes: {
        include: { attribute: true },
        orderBy: { attribute: { sortOrder: "asc" } },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const hasDiscount =
    product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price;

  const unit = unitLabels[product.unit] || "шт";

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

      {/* Product main */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery
          images={product.images.map((img) => ({ url: img.url }))}
          name={product.name}
        />

        {/* Info */}
        <div>
          <div className="flex gap-2 mb-3">
            {product.isHit && (
              <Badge className="bg-accent text-accent-foreground">Хит</Badge>
            )}
            {product.isNew && (
              <Badge className="bg-emerald-500 text-white">Новинка</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold lg:text-3xl">{product.name}</h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {product.code && <span>Арт. {product.code}</span>}
            {product.category && <span>Категория: {product.category.name}</span>}
          </div>

          <Separator className="my-5" />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-bold text-accent">
                  {product.specialPrice!.toLocaleString("ru-RU")} &#8381;
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {product.price.toLocaleString("ru-RU")} &#8381;
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold">
                {product.price.toLocaleString("ru-RU")} &#8381;
              </span>
            )}
            <span className="text-sm text-muted-foreground">/ {unit}</span>
          </div>

          <p className={`mt-2 text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {product.stock > 0 ? "В наличии на складе" : "Под заказ"}
          </p>

          {/* Quantity + Add to cart */}
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

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium">Доставка</p>
                <p className="text-xs text-muted-foreground">По Москве и МО</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium">Гарантия</p>
                <p className="text-xs text-muted-foreground">Сертификат</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <RotateCcw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium">Возврат</p>
                <p className="text-xs text-muted-foreground">14 дней</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Описание</TabsTrigger>
          <TabsTrigger value="specs">Характеристики</TabsTrigger>
          <TabsTrigger value="delivery">Доставка</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 rounded-xl border bg-card p-6">
          <div
            className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground"
            dangerouslySetInnerHTML={{
              __html:
                product.description ||
                `<p>${product.name} — сертифицированная металлопродукция от проверенных производителей. Подходит для строительных, промышленных и бытовых задач. Соответствует стандартам ГОСТ.</p>`,
            }}
          />
        </TabsContent>
        <TabsContent value="specs" className="mt-4 rounded-xl border bg-card p-6">
          <table className="w-full text-sm">
            <tbody>
              {product.code && (
                <tr className="border-b">
                  <td className="py-2.5 text-muted-foreground w-1/3">Артикул</td>
                  <td className="py-2.5 font-medium">{product.code}</td>
                </tr>
              )}
              {product.category && (
                <tr className="border-b">
                  <td className="py-2.5 text-muted-foreground">Категория</td>
                  <td className="py-2.5 font-medium">{product.category.name}</td>
                </tr>
              )}
              {product.attributes.map((pa) => (
                <tr key={pa.id} className="border-b">
                  <td className="py-2.5 text-muted-foreground">{pa.attribute.name}</td>
                  <td className="py-2.5 font-medium">
                    {pa.value}
                    {pa.attribute.unit && (
                      <span className="ml-1 text-muted-foreground">{pa.attribute.unit}</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-b">
                <td className="py-2.5 text-muted-foreground">Единица измерения</td>
                <td className="py-2.5 font-medium">{unit}</td>
              </tr>
              <tr>
                <td className="py-2.5 text-muted-foreground">Наличие</td>
                <td className={`py-2.5 font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.stock > 0 ? "В наличии" : "Под заказ"}
                </td>
              </tr>
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="delivery" className="mt-4 rounded-xl border bg-card p-6">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Самовывоз:</strong> бесплатно, АНГАР 4, шоссе Автомагистраль Москва — Нижний Новгород, вл19к4</p>
            <p><strong className="text-foreground">Доставка по Москве:</strong> от 1500 &#8381;, в зависимости от объёма заказа</p>
            <p><strong className="text-foreground">Доставка по МО:</strong> рассчитывается индивидуально</p>
            <p><strong className="text-foreground">Срок доставки:</strong> 1-3 рабочих дня</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Похожие товары</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
