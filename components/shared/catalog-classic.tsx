"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  totalProducts: number;
  children: { id: string; name: string; slug: string }[];
}

export function CatalogClassic({ categories }: { categories: CatalogCategory[] }) {
  const totalProducts = categories.reduce((s, c) => s + c.totalProducts, 0);

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

      {/* Section heading */}
      <div className="relative mb-10 overflow-hidden">
        <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          КАТАЛОГ
        </span>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Металлопрокат
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            Каталог товаров
          </h1>
          <p className="mt-2 text-muted-foreground">
            {categories.length} разделов &middot; {totalProducts} товаров в наличии
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((parent, idx) => (
          <div
            key={parent.id}
            className="group relative overflow-hidden rounded-2xl bg-neutral-50 border border-neutral-200 transition-all duration-300 hover:shadow-2xl"
          >

            <div className="relative z-10 flex flex-col lg:flex-row">
              {/* Image side */}
              <Link
                href={`/catalog/${parent.slug}`}
                className="relative block h-56 lg:h-auto lg:w-92 shrink-0 overflow-hidden"
              >
                {parent.image ? (
                  <Image
                    src={parent.image}
                    alt={parent.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <Package className="h-14 w-14 text-neutral-300" />
                  </div>
                )}
                <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-neutral-50 to-transparent lg:left-auto" />
              </Link>

              {/* Content */}
              <div className="flex-1 p-6 lg:p-8">
                {/* Category header */}
                <div className="flex items-center justify-between mb-5">
                  <Link href={`/catalog/${parent.slug}`} className="group/title">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        Раздел {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                        {parent.totalProducts} товаров
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded) group-hover/title:text-primary transition-colors">
                      {parent.name}
                    </h2>
                  </Link>
                  <Link
                    href={`/catalog/${parent.slug}`}
                    className="hidden sm:flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-primary hover:text-white transition-all"
                  >
                    Все товары <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Subcategories grid */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {parent.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/catalog/${sub.slug}`}
                      className="group/sub flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 hover:bg-neutral-100 transition-all"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-neutral-700 group-hover/sub:text-neutral-900 transition-colors line-clamp-1">
                          {sub.name}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 group-hover/sub:text-primary group-hover/sub:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
