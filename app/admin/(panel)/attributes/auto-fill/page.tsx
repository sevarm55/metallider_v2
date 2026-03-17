"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Check, X, Wand2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";

interface ParsedProduct {
  id: string;
  name: string;
  category: string;
  existingAttrs: string[];
  newAttrs: { key: string; name: string; value: number }[];
}

export default function AutoFillPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPreview();
  }, []);

  async function loadPreview() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/attributes/auto-fill");
      if (res.data.success) setProducts(res.data.data);
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  function toggleExclude(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleApply() {
    const items = products
      .filter((p) => !excluded.has(p.id))
      .map((p) => ({
        productId: p.id,
        attrs: p.newAttrs.map((a) => ({ key: a.key, value: a.value })),
      }));

    if (items.length === 0) {
      toast.error("Нет товаров для обновления");
      return;
    }

    setApplying(true);
    try {
      const res = await axiosInstance.post("/admin/attributes/auto-fill", { items });
      if (res.data.success) {
        toast.success(`Добавлено ${res.data.data.created} характеристик`);
        router.push("/admin/attributes");
      }
    } catch {
      toast.error("Ошибка применения");
    } finally {
      setApplying(false);
    }
  }

  const activeCount = products.filter((p) => !excluded.has(p.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/attributes">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Автозаполнение характеристик</h1>
          <p className="text-sm text-neutral-400">Парсинг размеров из названий товаров</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-neutral-300" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Check className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
          <p className="text-neutral-600 font-medium">Все характеристики уже заполнены</p>
          <p className="text-sm text-neutral-400 mt-1">Нечего добавлять</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-neutral-700">
                Найдено <span className="font-bold">{products.length}</span> товаров с новыми характеристиками.
                {excluded.size > 0 && (
                  <span className="text-neutral-400"> (пропущено: {excluded.size})</span>
                )}
              </span>
            </div>
            <Button
              onClick={handleApply}
              disabled={applying || activeCount === 0}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              <Wand2 className={cn("h-4 w-4", applying && "animate-spin")} />
              {applying ? "Применяем..." : `Применить (${activeCount})`}
            </Button>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-lg border border-neutral-200 overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#fafafa] border-b border-neutral-200">
                  <th className="w-10 px-3 py-2 text-center" />
                  <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Товар</th>
                  <th className="w-32 px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Категория</th>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Уже есть</th>
                  <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Будет добавлено</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isExcluded = excluded.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "border-b border-neutral-100 transition-colors",
                        isExcluded ? "opacity-40 bg-neutral-50" : "hover:bg-[#e8f4fd]"
                      )}
                    >
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => toggleExclude(p.id)}
                          className={cn(
                            "h-5 w-5 rounded border flex items-center justify-center transition-colors cursor-pointer",
                            isExcluded
                              ? "border-neutral-300 bg-neutral-100"
                              : "border-emerald-400 bg-emerald-500"
                          )}
                        >
                          {!isExcluded && <Check className="h-3 w-3 text-white" />}
                        </button>
                      </td>
                      <td className="px-3 py-2 font-medium text-neutral-800">{p.name}</td>
                      <td className="px-3 py-2 text-neutral-500">{p.category}</td>
                      <td className="px-3 py-2">
                        {p.existingAttrs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.existingAttrs.map((a, i) => (
                              <span key={i} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500">
                                {a}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {p.newAttrs.map((a, i) => (
                            <span key={i} className="rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[11px] font-medium">
                              {a.name}: {a.value}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
