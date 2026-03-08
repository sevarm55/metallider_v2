import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ArrowRight, Layers } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma-client";

export const metadata: Metadata = {
  title: "Каталог товаров — МеталлЛидер",
  description: "Полный каталог металлопроката: трубы, листы, арматура, уголки, швеллеры и метизы.",
};

// Accent colors for parent categories
const categoryColors = [
  { bg: "bg-orange-50", border: "border-orange-200/60", accent: "text-orange-600", iconBg: "bg-orange-100", hoverBorder: "hover:border-orange-300" },
  { bg: "bg-blue-50", border: "border-blue-200/60", accent: "text-blue-600", iconBg: "bg-blue-100", hoverBorder: "hover:border-blue-300" },
  { bg: "bg-emerald-50", border: "border-emerald-200/60", accent: "text-emerald-600", iconBg: "bg-emerald-100", hoverBorder: "hover:border-emerald-300" },
  { bg: "bg-violet-50", border: "border-violet-200/60", accent: "text-violet-600", iconBg: "bg-violet-100", hoverBorder: "hover:border-violet-300" },
  { bg: "bg-rose-50", border: "border-rose-200/60", accent: "text-rose-600", iconBg: "bg-rose-100", hoverBorder: "hover:border-rose-300" },
  { bg: "bg-amber-50", border: "border-amber-200/60", accent: "text-amber-600", iconBg: "bg-amber-100", hoverBorder: "hover:border-amber-300" },
];

export default async function CatalogPage() {
  const parentCategories = await prisma.category.findMany({
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
  });

  const totalProducts = parentCategories.reduce(
    (sum, p) => sum + p.children.reduce((s, c) => s + c._count.products, 0),
    0,
  );

  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Главная</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Каталог</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Каталог товаров</h1>
        <p className="mt-2 text-muted-foreground">
          {parentCategories.length} разделов &middot; {totalProducts} товаров в наличии
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {parentCategories.map((parent, idx) => {
          const color = categoryColors[idx % categoryColors.length];
          const totalInParent = parent.children.reduce((s, c) => s + c._count.products, 0);

          return (
            <div
              key={parent.id}
              className={`group relative overflow-hidden rounded-2xl border ${color.border} ${color.bg} p-5 transition-all duration-300 ${color.hoverBorder} hover:shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <Link
                  href={`/catalog/${parent.slug}`}
                  className="flex items-center gap-3"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.iconBg}`}>
                    <Layers className={`h-5 w-5 ${color.accent}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 group-hover:text-primary transition-colors">
                      {parent.name}
                    </h2>
                    <p className="text-xs text-neutral-500">{totalInParent} товаров</p>
                  </div>
                </Link>
                <Link
                  href={`/catalog/${parent.slug}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${color.iconBg} ${color.accent} opacity-0 group-hover:opacity-100 transition-all`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Subcategories */}
              <div className="space-y-0.5">
                {parent.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/catalog/${sub.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-white/80 hover:text-primary transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                      {sub.name}
                    </span>
                    {sub._count.products > 0 && (
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
                        {sub._count.products}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* View all link */}
              <Link
                href={`/catalog/${parent.slug}`}
                className={`mt-3 flex items-center gap-1 text-xs font-semibold ${color.accent} hover:underline`}
              >
                Смотреть все
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
