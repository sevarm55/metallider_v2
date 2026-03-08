"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart, Trash2, Package, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/shared/container";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Auto-fill from user profile
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
            <BreadcrumbPage>Корзина</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold lg:text-3xl">Корзина</h1>
        {hydrated && items.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clear}>
            Очистить корзину
          </Button>
        )}
      </div>

      {orderNumber ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Заказ оформлен!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Номер заказа: <span className="font-bold text-foreground">{orderNumber}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Мы свяжемся с вами в ближайшее время для подтверждения
          </p>
          <Button asChild>
            <Link href="/catalog">Вернуться в каталог</Link>
          </Button>
        </div>
      ) : !hydrated ? (
        <div className="flex items-center justify-center py-20">
          <span className="animate-spin block h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Корзина пуста</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Добавьте товары из каталога
          </p>
          <Button asChild>
            <Link href="/catalog">Перейти в каталог</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: cart items + form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div className="space-y-4">
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
                    className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-secondary/50 overflow-hidden"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col gap-2 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${product.slug}`}
                            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          {product.code && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Арт. {product.code}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <div className="flex items-center gap-3">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            onChange={(q) => updateQuantity(product.id, q)}
                          />
                          <span className="text-xs text-muted-foreground">
                            &times;{" "}
                            {hasDiscount ? (
                              <>
                                <span className="text-primary font-medium">
                                  {effectivePrice.toLocaleString("ru-RU")} &#8381;
                                </span>
                                <span className="ml-1 line-through">
                                  {product.price.toLocaleString("ru-RU")} &#8381;
                                </span>
                              </>
                            ) : (
                              <>{effectivePrice.toLocaleString("ru-RU")} &#8381;</>
                            )}
                          </span>
                        </div>
                        <span className="font-bold whitespace-nowrap">
                          {rowTotal.toLocaleString("ru-RU")} &#8381;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact info */}
            <Card>
              <CardHeader>
                <CardTitle>Контактные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery method */}
            <Card>
              <CardHeader>
                <CardTitle>Способ получения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                      deliveryMethod === "pickup"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <Building2 className={`h-5 w-5 shrink-0 ${deliveryMethod === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">Самовывоз</p>
                      <p className="text-xs text-muted-foreground">Бесплатно</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                      deliveryMethod === "delivery"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <MapPin className={`h-5 w-5 shrink-0 ${deliveryMethod === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">Доставка</p>
                      <p className="text-xs text-muted-foreground">По Москве и МО</p>
                    </div>
                  </button>
                </div>

                {deliveryMethod === "pickup" && (
                  <div className="rounded-lg bg-secondary/50 p-4 text-sm">
                    <p className="font-medium">Адрес самовывоза:</p>
                    <p className="text-muted-foreground mt-1">
                      АНГАР 4, шоссе Автомагистраль Москва — Нижний Новгород, вл19к4
                    </p>
                  </div>
                )}

                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <Label>Адрес доставки *</Label>
                    <Input
                      placeholder="Введите адрес доставки..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comment */}
            <Card>
              <CardHeader>
                <CardTitle>Комментарий к заказу</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Дополнительные пожелания, удобное время доставки и т.д."
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Итого</h2>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товаров</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              {discount > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сумма</span>
                    <span className="font-medium text-muted-foreground line-through">
                      {totalOriginal.toLocaleString("ru-RU")} &#8381;
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Скидка</span>
                    <span className="font-medium text-emerald-600">
                      &minus;{discount.toLocaleString("ru-RU")} &#8381;
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className="font-medium">
                  {deliveryMethod === "pickup" ? "Бесплатно" : "Рассчитывается"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Итого</span>
                <span className="text-xl font-bold">
                  {totalPrice.toLocaleString("ru-RU")} &#8381;
                </span>
              </div>
              {error && (
                <p className="text-sm text-center text-destructive font-medium">{error}</p>
              )}
              <Button
                size="lg"
                className="w-full font-semibold"
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
              <p className="text-xs text-center text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с условиями обработки данных
              </p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
