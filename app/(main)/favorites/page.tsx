"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/shared/container";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useStoreHydrated } from "@/hooks/use-store-hydration";

export default function FavoritesPage() {
  const hydrated = useStoreHydrated();
  const items = useFavoritesStore((s) => s.items);
  const clear = useFavoritesStore((s) => s.clear);

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
            <BreadcrumbPage>Избранное</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="relative mb-10 overflow-x-clip">
        <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          ИЗБРАННОЕ
        </span>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Мои товары
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
              Избранное
            </h1>
            {hydrated && items.length > 0 && (
              <Button variant="ghost" size="sm" className="w-fit text-muted-foreground" onClick={clear}>
                Очистить всё
              </Button>
            )}
          </div>
        </div>
      </div>

      {!hydrated ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin block h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
            <Heart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Нет товаров в избранном</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Добавляйте товары в избранное, нажимая на сердечко
          </p>
          <Button asChild>
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
