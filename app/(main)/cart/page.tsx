"use client";

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
  Phone,
  Mail,
  Shield,
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
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            specialPrice: i.product.specialPrice,
            quantity: i.quantity,
            unit: i.product.unit,
          })),
          totalPrice,
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
              {items.map((item) => {
                const { product } = item;
                const hasDiscount =
                  product.specialPrice &&
                  product.specialPrice > 0 &&
                  product.specialPrice < product.price;
                const effectivePrice = hasDiscount ? product.specialPrice! : product.price;
                const rowTotal = effectivePrice * item.quantity;

                return (
                  <div
                    key={product.id}
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
                            className="h-8 w-auto rounded-lg bg-neutral-100 border-0"
                          />
                          <span className="hidden sm:inline text-xs text-neutral-500">
                            &times;{" "}
                            {hasDiscount ? (
                              <>
                                <span className="text-primary font-medium">
                                  {effectivePrice.toLocaleString("ru-RU")} &#8381;
                                </span>
                                <span className="ml-1 line-through text-neutral-500">
                                  {product.price.toLocaleString("ru-RU")}
                                </span>
                              </>
                            ) : (
                              <>{effectivePrice.toLocaleString("ru-RU")} &#8381;</>
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

            {/* ── Step sections with timeline ── */}
            <div className="relative pl-8 sm:pl-12 before:absolute before:left-[13px] before:sm:left-[21px] before:top-0 before:bottom-0 before:w-px before:bg-neutral-200">

            {/* Contact info */}
            <div className="relative mb-6">
              <div className="absolute -left-8 sm:-left-12 top-6 flex h-7 w-7 sm:h-[42px] sm:w-[42px] items-center justify-center rounded-full bg-primary text-white text-xs sm:text-sm font-black ring-4 ring-white z-10">
                1
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded) mb-6">Контактные данные</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        Имя <span className="text-primary">*</span>
                      </label>
                      <Input
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                          <Phone className="h-3 w-3 text-primary" />
                        </div>
                        Телефон <span className="text-primary">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                        <Mail className="h-3 w-3 text-primary" />
                      </div>
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl border-neutral-200 bg-neutral-50 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery method */}
            <div className="relative mb-6">
              <div className="absolute -left-8 sm:-left-12 top-6 flex h-7 w-7 sm:h-[42px] sm:w-[42px] items-center justify-center rounded-full bg-primary text-white text-xs sm:text-sm font-black ring-4 ring-white z-10">
                2
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded) mb-5">Способ получения</h2>
                <div className="space-y-3">
                  {/* Самовывоз */}
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={cn(
                      "w-full rounded-2xl text-left transition-all duration-200 overflow-hidden",
                      deliveryMethod === "pickup"
                        ? "bg-zinc-800 shadow-lg"
                        : "bg-neutral-50 hover:bg-neutral-100",
                    )}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                        deliveryMethod === "pickup" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-400",
                      )}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold", deliveryMethod === "pickup" ? "text-white" : "text-neutral-600")}>
                          Самовывоз со склада
                        </p>
                        <p className={cn("text-[11px]", deliveryMethod === "pickup" ? "text-emerald-400 font-semibold" : "text-neutral-400")}>
                          Бесплатно
                        </p>
                      </div>
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full shrink-0 transition-all",
                        deliveryMethod === "pickup" ? "bg-primary" : "border-2 border-neutral-300",
                      )}>
                        {deliveryMethod === "pickup" && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    {deliveryMethod === "pickup" && (
                      <div className="border-t border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-xs text-neutral-400">
                          <span className="font-semibold text-neutral-300">Склад МеталлЛидер</span> — Реутов, ш. Автомагистраль Москва — Нижний Новгород, 1
                        </p>
                      </div>
                    )}
                  </button>

                  {/* Доставка */}
                  <div
                    onClick={() => setDeliveryMethod("delivery")}
                    className={cn(
                      "w-full rounded-2xl text-left transition-all duration-200 cursor-pointer overflow-hidden",
                      deliveryMethod === "delivery"
                        ? "bg-zinc-800 shadow-lg"
                        : "bg-neutral-50 hover:bg-neutral-100",
                    )}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                        deliveryMethod === "delivery" ? "bg-primary text-white" : "bg-neutral-200 text-neutral-400",
                      )}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-bold", deliveryMethod === "delivery" ? "text-white" : "text-neutral-600")}>
                          Доставка
                        </p>
                        <p className={cn("text-[11px]", deliveryMethod === "delivery" ? "text-neutral-400" : "text-neutral-400")}>
                          По Москве и Московской области
                        </p>
                      </div>
                      <div className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full shrink-0 transition-all",
                        deliveryMethod === "delivery" ? "bg-primary" : "border-2 border-neutral-300",
                      )}>
                        {deliveryMethod === "delivery" && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    {deliveryMethod === "delivery" && (
                      <div className="border-t border-white/10 bg-white/5 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Input
                          placeholder="Введите адрес доставки..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="h-11 rounded-xl border-0 bg-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="relative">
              <div className="absolute -left-8 sm:-left-12 top-6 flex h-7 w-7 sm:h-[42px] sm:w-[42px] items-center justify-center rounded-full bg-primary text-white text-xs sm:text-sm font-black ring-4 ring-white z-10">
                3
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded) mb-4">Комментарий</h2>
                <Textarea
                  placeholder="Дополнительные пожелания, удобное время доставки и т.д."
                  rows={3}
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
                <Button
                  size="lg"
                  className="w-full font-bold text-base rounded-xl h-12"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
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
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                  <Shield className="h-3 w-3" />
                  Безопасная оплата
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
