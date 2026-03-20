"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Trash2,
  Package,
  MapPin,
  Building2,
  CheckCircle2,
  User,
  Mail,
  Truck,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCartStore } from "@/lib/store/cart";
import { useStoreHydrated } from "@/hooks/use-store-hydration";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";

type DeliveryMethod = "pickup" | "delivery";

export default function CartPage() {
  const { data: session } = useSession();
  const hydrated = useStoreHydrated();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clear = useCartStore((s) => s.clear);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalOriginal = useCartStore((s) => s.totalPriceOriginal());
  const discount = totalOriginal - totalPrice;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    axiosInstance.get("/auth/me").then((res) => {
      if (res.data.success) {
        const u = res.data.data;
        setName((prev) => prev || u.fullName || "");
        setEmail((prev) => prev || u.email || "");
        setPhone((prev) => prev || u.phone || "");
      }
    }).catch(() => {});
  }, [session]);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const handleSubmitOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    if (deliveryMethod === "delivery" && !address.trim()) {
      setError("Укажите адрес доставки");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          deliveryMethod,
          address: address.trim() || undefined,
          comment: comment.trim() || undefined,
          // TODO: Серверный API /api/orders должен сам рассчитывать цены по ID товаров
          items: items.map((i) => ({
            id: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка при оформлении");
        return;
      }
      setOrderNumber(data.orderNumber);
      clear();
    } catch {
      setError("Не удалось отправить заказ. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <BreadcrumbPage>Корзина</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="relative mb-10 overflow-x-clip">
        <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          КОРЗИНА
        </span>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-orange-500" />
            <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
              Оформление
            </span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
              Корзина
            </h1>
            {hydrated && items.length > 0 && (
              <Button variant="ghost" size="sm" className="w-fit text-muted-foreground" onClick={clear}>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Очистить
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success */}
      {orderNumber ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 font-(family-name:--font-unbounded)">
            Заказ оформлен!
          </h2>
          <p className="text-sm text-muted-foreground mb-1">
            Номер заказа: <span className="font-bold text-primary">{orderNumber}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Мы свяжемся с вами в ближайшее время для подтверждения
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/catalog">Вернуться в каталог</Link>
          </Button>
        </div>

      ) : !hydrated ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin block h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>

      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 mb-6">
            <ShoppingCart className="h-12 w-12 text-neutral-300" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 font-(family-name:--font-unbounded)">
            Корзина пуста
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Добавьте товары из каталога
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>

      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart items */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2 px-2 pb-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-neutral-900">
                  {totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}
                </span>
              </div>
              {items.map((item, idx) => {
                const { product } = item;
                const hasDiscount =
                  product.specialPrice &&
                  product.specialPrice > 0 &&
                  product.specialPrice < product.price;
                const effectivePrice = hasDiscount ? product.specialPrice! : product.price;
                const rowTotal = effectivePrice * item.quantity;

                return (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex gap-3 sm:gap-4 rounded-xl bg-neutral-50/50 p-3 transition-colors hover:bg-neutral-50"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-xl bg-white overflow-hidden"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full rounded-xl object-contain p-1"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-neutral-300" />
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-sm font-bold text-neutral-900 hover:text-primary transition-colors line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="shrink-0 rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {product.code && (
                        <span className="text-[10px] text-neutral-500 mt-0.5">
                          Арт: {product.code}
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                        <div className="flex items-center gap-3">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            onChange={(q) => updateQuantity(product.id, q)}
                            step={product.unit === "м²" ? 0.5 : 1}
                            min={product.unit === "м²" ? 0.5 : 1}
                            unit={product.unit}
                            className="h-8 w-auto rounded-lg bg-neutral-100 border-0"
                          />
                          <span className="hidden sm:inline text-xs text-neutral-500">
                            &times;{" "}
                            {hasDiscount ? (
                              <>
                                <span className="text-primary font-medium">
                                  {effectivePrice.toLocaleString("ru-RU")} &#8381;/{product.unit}
                                </span>
                                <span className="ml-1 line-through text-neutral-500">
                                  {product.price.toLocaleString("ru-RU")}
                                </span>
                              </>
                            ) : (
                              <>{effectivePrice.toLocaleString("ru-RU")} &#8381;/{product.unit}</>
                            )}
                          </span>
                        </div>
                        <span className="text-base font-black text-neutral-900 whitespace-nowrap">
                          {rowTotal.toLocaleString("ru-RU")} &#8381;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Checkout form ── */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

              {/* Watermark */}
              <span className="pointer-events-none absolute right-4 top-2 select-none text-[5rem] font-black leading-none text-neutral-100/60 font-(family-name:--font-unbounded)">
                ЗАКАЗ
              </span>

              <div className="relative divide-y divide-neutral-100">
                {/* ── Section: Contact ── */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Контактные данные</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-neutral-400">
                          Имя <span className="text-primary">*</span>
                        </label>
                        <Input
                          placeholder="Ваше имя"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-neutral-400">
                          Телефон <span className="text-primary">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="+7 (999) 123-45-67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="h-11 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-neutral-400">
                        Email <span className="text-neutral-300">(необязательно)</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section: Delivery ── */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <Truck className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Способ получения</h2>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {/* Самовывоз */}
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={cn(
                        "group relative rounded-xl p-4 text-left transition-all duration-200 overflow-hidden",
                        deliveryMethod === "pickup"
                          ? "bg-primary/5 ring-2 ring-primary"
                          : "bg-neutral-50 ring-1 ring-neutral-200 hover:bg-neutral-100",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                          deliveryMethod === "pickup" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-400",
                        )}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold", deliveryMethod === "pickup" ? "text-neutral-900" : "text-neutral-700")}>
                            Самовывоз
                          </p>
                          <p className={cn("text-[11px]", deliveryMethod === "pickup" ? "text-emerald-600 font-semibold" : "text-neutral-400")}>
                            Бесплатно
                          </p>
                        </div>
                      </div>
                      {deliveryMethod === "pickup" && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <p className="text-[11px] text-neutral-500 leading-snug">
                            Реутов, ш. Автомагистраль Москва — Нижний Новгород, 1
                          </p>
                        </div>
                      )}
                    </button>

                    {/* Доставка */}
                    <div
                      onClick={() => setDeliveryMethod("delivery")}
                      className={cn(
                        "group relative rounded-xl p-4 text-left transition-all duration-200 cursor-pointer overflow-hidden",
                        deliveryMethod === "delivery"
                          ? "bg-primary/5 ring-2 ring-primary"
                          : "bg-neutral-50 ring-1 ring-neutral-200 hover:bg-neutral-100",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                          deliveryMethod === "delivery" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-400",
                        )}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold", deliveryMethod === "delivery" ? "text-neutral-900" : "text-neutral-700")}>
                            Доставка
                          </p>
                          <p className={cn("text-[11px]", deliveryMethod === "delivery" ? "text-neutral-500" : "text-neutral-400")}>
                            Москва и МО
                          </p>
                        </div>
                      </div>
                      {deliveryMethod === "delivery" && (
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <Input
                            placeholder="Адрес доставки..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="h-10 rounded-lg border-neutral-200 bg-neutral-50 text-sm placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Section: Comment ── */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <Mail className="h-4 w-4 text-violet-500" />
                    </div>
                    <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Комментарий</h2>
                    <span className="text-[11px] text-neutral-300">(необязательно)</span>
                  </div>
                  <Textarea
                    placeholder="Удобное время, особые пожелания..."
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Summary sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6 space-y-4">
                <h2 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                  Итого
                </h2>
                <div className="h-px bg-neutral-100" />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Товаров</span>
                    <span className="font-semibold text-neutral-900">{totalItems}</span>
                  </div>
                  {discount > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Сумма</span>
                        <span className="text-neutral-400 line-through">
                          {totalOriginal.toLocaleString("ru-RU")} &#8381;
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Скидка</span>
                        <span className="font-semibold text-emerald-400">
                          &minus;{discount.toLocaleString("ru-RU")} &#8381;
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Доставка</span>
                    <span className="font-semibold text-neutral-900">
                      {deliveryMethod === "pickup" ? "Бесплатно" : "Рассчитывается"}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-neutral-100" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-neutral-500">К оплате</span>
                  <span className="text-2xl font-black text-neutral-900">
                    {totalPrice.toLocaleString("ru-RU")} <span className="text-sm font-bold text-neutral-500">&#8381;</span>
                  </span>
                </div>
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-sm text-center text-red-400 font-medium">{error}</p>
                  </div>
                )}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary accent-primary"
                  />
                  <span className="text-[11px] text-neutral-500 leading-snug">
                    Я соглашаюсь с{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Политикой конфиденциальности
                    </Link>{" "}
                    и{" "}
                    <Link href="/offer" className="text-primary hover:underline">
                      Публичной офертой
                    </Link>
                  </span>
                </label>
                <Button
                  size="lg"
                  className="w-full font-bold text-base rounded-xl h-12"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !consent}
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2 block h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                      Отправка...
                    </>
                  ) : (
                    "Оформить заказ"
                  )}
                </Button>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200/50 px-3 py-2.5 text-center">
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Оплата при получении
                  </p>
                  <p className="text-[10px] text-emerald-600/70 mt-0.5">
                    Наличными или картой
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
