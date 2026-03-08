"use client";

import { useState } from "react";
import { Phone, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function CallbackModal({ open, onClose }: CallbackModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ type: "callback", name: name.trim(), phone: phone.trim() }),
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
    }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
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
              Мы перезвоним вам в ближайшее время
            </p>
            <Button onClick={handleClose} className="mt-5 w-full">
              Хорошо
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Обратный звонок</h3>
                <p className="text-xs text-neutral-500">Перезвоним за 5 минут</p>
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
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Заказать звонок"}
              </Button>
            </form>

            <p className="mt-3 text-center text-[10px] text-neutral-400">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </>
        )}
      </div>
    </div>
  );
}
