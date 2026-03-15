"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickOrderModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    specialPrice?: number;
    unit: string;
    image?: string | null;
  } | null;
}

export function QuickOrderModal({ open, onClose, product }: QuickOrderModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  if (!open || !product) return null;

  const hasDiscount = product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price;
  const effectivePrice = hasDiscount ? product.specialPrice! : product.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Введите номер телефона");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quick_order",
          name: name.trim(),
          phone: phone.trim(),
          productId: product.id,
          productName: product.name,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Ошибка отправки, попробуйте позже");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName("");
      setPhone("");
      setSent(false);
      setError("");
      setConsent(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold">Заявка отправлена!</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Менеджер свяжется с вами для подтверждения заказа
            </p>
            <Button onClick={handleClose} className="mt-5 w-full">
              Хорошо
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Быстрый заказ</h3>
                <p className="text-xs text-neutral-500">Оформим заказ за вас</p>
              </div>
            </div>

            {/* Product preview */}
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-neutral-200/50">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="h-14 w-14 rounded-lg object-contain" />
                ) : (
                  <Package className="h-6 w-6 text-neutral-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900 line-clamp-2">{product.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={hasDiscount ? "text-sm font-bold text-primary" : "text-sm font-bold"}>
                    {effectivePrice.toLocaleString("ru-RU")} ₽
                  </span>
                  <span className="text-xs text-neutral-400">/ {product.unit}</span>
                  {hasDiscount && (
                    <span className="text-xs line-through text-neutral-400">
                      {product.price.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm outline-none focus:border-primary transition-colors"
              />
              <input
                type="tel"
                placeholder="Номер телефона *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-neutral-200 px-4 text-sm outline-none focus:border-primary transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary accent-primary"
                />
                <span className="text-[11px] text-neutral-500 leading-snug">
                  Я соглашаюсь с{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline">
                    Политикой конфиденциальности
                  </a>{" "}
                  и{" "}
                  <a href="/offer" target="_blank" className="text-primary hover:underline">
                    Публичной офертой
                  </a>
                </span>
              </label>
              <Button type="submit" className="w-full h-11 gap-2 bg-amber-500 hover:bg-amber-600 text-white" disabled={loading || !consent}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Zap className="h-4 w-4" />
                    Оформить заказ
                  </>
                )}
              </Button>
            </form>

            <p className="mt-3 text-center text-[10px] text-neutral-400">
              Менеджер перезвонит для уточнения деталей и количества
            </p>
          </>
        )}
      </div>
    </div>
  );
}
