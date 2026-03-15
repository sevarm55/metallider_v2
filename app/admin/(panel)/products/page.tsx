"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Package,
  Pencil,
  RefreshCw,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/services/instance";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  stock: number;
  isActive: boolean;
  isHit: boolean;
  isNew: boolean;
  category: { id: string; name: string } | null;
  images: Array<{ url: string }>;
}

const PAGE_SIZE = 50;
const FILTER_STORAGE_KEY = "admin_products_filters";

function loadSavedFilters() {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as { page?: number; search?: string; categoryId?: string };
  } catch {}
  return {};
}

function saveFilters(filters: { page: number; search: string; categoryId: string }) {
  try {
    sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {}
}

export default function ProductsPage() {
  const savedFilters = useRef(loadSavedFilters());

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(savedFilters.current.page || 1);
  const [search, setSearch] = useState(savedFilters.current.search || "");
  const [searchInput, setSearchInput] = useState(savedFilters.current.search || "");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(savedFilters.current.categoryId || "");
  const [showFilter, setShowFilter] = useState(false);

  // Save filters to sessionStorage whenever they change
  useEffect(() => {
    saveFilters({ page, search, categoryId });
  }, [page, search, categoryId]);

  const loadProducts = useCallback(async (p: number, s: string, catId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
      if (catId) params.set("categoryId", catId);
      const res = await axiosInstance.get(`/admin/products?${params}`);
      if (res.data.success) {
        const d = res.data.data;
        setProducts(d.products);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      }
    } catch {
      toast.error("Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    axiosInstance.get("/admin/categories").then((res) => {
      if (res.data.success) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(page, search, categoryId); }, [page, search, categoryId, loadProducts]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setSearch(searchInput); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.success("Товар удалён");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка удаления");
      }
    }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await axiosInstance.delete("/admin/products", { data: { ids: Array.from(selected) } });
      if (res.data.success) {
        setSelected(new Set());
        toast.success(`Удалено ${res.data.data.deleted} товаров`);
        loadProducts(page, search, categoryId);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка массового удаления");
      }
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleSyncMoysklad() {
    setSyncing(true);
    try {
      const res = await axiosInstance.post("/admin/moysklad/sync");
      if (res.data.success) {
        const { updated, notFound, errors, total: syncTotal } = res.data.data;
        toast.success(
          `Цены: обновлено ${updated} из ${syncTotal}` +
            (notFound > 0 ? `, не найдено ${notFound}` : "") +
            (errors > 0 ? `, ошибок ${errors}` : ""),
        );
        loadProducts(page, search, categoryId);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка синхронизации цен");
      }
    } finally {
      setSyncing(false);
    }
  }

  async function handleSyncStock() {
    setSyncingStock(true);
    try {
      const res = await axiosInstance.post("/admin/moysklad/sync-stock");
      if (res.data.success) {
        const { updated, notFound, errors, total: syncTotal } = res.data.data;
        toast.success(
          `Остатки: обновлено ${updated} из ${syncTotal}` +
            (notFound > 0 ? `, не найдено ${notFound}` : "") +
            (errors > 0 ? `, ошибок ${errors}` : ""),
        );
        loadProducts(page, search, categoryId);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка синхронизации остатков");
      }
    } finally {
      setSyncingStock(false);
    }
  }

  const allPageSelected = products.length > 0 && products.every((p) => selected.has(p.id));

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      products.forEach((p) => checked ? next.add(p.id) : next.delete(p.id));
      return next;
    });
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  const startIdx = (page - 1) * PAGE_SIZE;

  const statusBadge = (product: Product) => {
    if (product.isActive) {
      return <span className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white bg-green-500">Активен</span>;
    }
    return <span className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white bg-neutral-400">Скрыт</span>;
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-lg font-bold text-neutral-800 mr-1">Товары</h1>
        <button
          onClick={() => loadProducts(page, search, categoryId)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors mr-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {/* Pill buttons — МойСклад style */}
        <Link href="/admin/products/new">
          <button className="inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
            <Plus className="h-3.5 w-3.5 text-[#1195eb]" />
            Товар
          </button>
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn(
              "inline-flex items-center gap-1.5 h-[30px] rounded border px-3 text-[13px] transition-colors shadow-sm",
              categoryId
                ? "border-[#1195eb] bg-[#e8f4fd] text-[#1195eb]"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            <Filter className="h-3 w-3" />
            {categoryId
              ? categories.find((c) => c.id === categoryId)?.name || "Фильтр"
              : "Фильтр"}
            {categoryId && (
              <span
                onClick={(e) => { e.stopPropagation(); setCategoryId(""); setPage(1); setShowFilter(false); }}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
          {showFilter && (
            <div className="absolute top-full left-0 mt-1 z-50 w-64 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
              <button
                onClick={() => { setCategoryId(""); setPage(1); setShowFilter(false); }}
                className={cn(
                  "w-full px-3 py-2 text-left text-[13px] hover:bg-neutral-50 transition-colors",
                  !categoryId && "bg-[#e8f4fd] text-[#1195eb] font-medium",
                )}
              >
                Все категории
              </button>
              {categories
                .filter((c) => !c.parentId)
                .map((parent) => {
                  const children = categories.filter((c) => c.parentId === parent.id);
                  return (
                    <div key={parent.id}>
                      <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                        {parent.name}
                      </div>
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => { setCategoryId(child.id); setPage(1); setShowFilter(false); }}
                          className={cn(
                            "w-full px-3 py-1.5 pl-5 text-left text-[13px] hover:bg-neutral-50 transition-colors",
                            categoryId === child.id && "bg-[#e8f4fd] text-[#1195eb] font-medium",
                          )}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <button
          onClick={handleSyncMoysklad}
          disabled={syncing}
          className="inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
          {syncing ? "Синхр..." : "Цены МС"}
        </button>
        <button
          onClick={handleSyncStock}
          disabled={syncingStock}
          className="inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3 w-3", syncingStock && "animate-spin")} />
          {syncingStock ? "Синхр..." : "Остатки МС"}
        </button>
        <Link href="/admin/products/import">
          <button className="inline-flex items-center gap-1.5 h-[30px] rounded border border-neutral-300 bg-white px-3 text-[13px] text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
            <FileUp className="h-3 w-3" />
            Импорт
          </button>
        </Link>

        {selected.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center gap-1 h-[30px] rounded border border-red-300 bg-white px-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors" disabled={bulkDeleting}>
                <Trash2 className="h-3 w-3" />
                {bulkDeleting ? "..." : `Удалить (${selected.size})`}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить {selected.size} товаров?</AlertDialogTitle>
                <AlertDialogDescription>Отменить будет невозможно.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Search — right side */}
        <div className="relative ml-auto">
          <input
            placeholder="Название или артикул"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-[30px] w-52 rounded border border-neutral-300 bg-white pl-3 pr-8 text-[13px] text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-[#1195eb] transition-colors"
          />
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      {/* ── Data table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-y border-neutral-200">
              <th className="w-8  px-2 py-2 text-center">
                <Checkbox checked={allPageSelected} onCheckedChange={(c) => toggleAll(!!c)} />
              </th>
              <th className="w-10  px-2 py-2 text-center font-semibold text-neutral-500 text-[11px]">№</th>
              <th className="w-10  px-2 py-2 text-center font-semibold text-neutral-500 text-[11px]">Фото</th>
              <th className=" px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Наименование</th>
              <th className="w-32  px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Артикул</th>
              <th className="w-40  px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Категория</th>
              <th className="w-24  px-3 py-2 text-right font-semibold text-neutral-500 text-[11px]">Цена</th>
              <th className="w-20  px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Остаток</th>
              <th className="w-24  px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Статус</th>
              <th className="w-16 px-2 py-2 text-center font-semibold text-neutral-500 text-[11px]">
                <Settings2 className="h-3.5 w-3.5 mx-auto text-neutral-400" />
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-neutral-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-neutral-300 mx-auto" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-neutral-400">
                  {search ? "Ничего не найдено" : "Нет товаров"}
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-neutral-200 hover:bg-[#e8f4fd] transition-colors",
                    selected.has(product.id) && "bg-[#e8f4fd]",
                  )}
                >
                  <td className=" px-2 py-1.5 text-center">
                    <Checkbox
                      checked={selected.has(product.id)}
                      onCheckedChange={(c) => toggleOne(product.id, !!c)}
                    />
                  </td>
                  <td className=" px-2 py-1.5 text-center text-neutral-400">
                    {startIdx + idx + 1}
                  </td>
                  <td className=" px-2 py-1.5 text-center">
                    <div className="h-7 w-7 mx-auto flex items-center justify-center rounded bg-neutral-100 overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt="" className="h-7 w-7 object-contain" />
                      ) : (
                        <Package className="h-3.5 w-3.5 text-neutral-300" />
                      )}
                    </div>
                  </td>
                  <td className=" px-3 py-1.5 max-w-[300px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-[#1195eb] hover:underline truncate"
                      >
                        {product.name}
                      </Link>
                      {product.isHit && (
                        <span className="shrink-0 rounded bg-orange-100 px-1 py-px text-[10px] font-semibold text-orange-600">Хит</span>
                      )}
                      {product.isNew && (
                        <span className="shrink-0 rounded bg-green-100 px-1 py-px text-[10px] font-semibold text-green-600">New</span>
                      )}
                    </div>
                  </td>
                  <td className=" px-3 py-1.5 text-neutral-500 truncate">
                    {product.code || "—"}
                  </td>
                  <td className=" px-3 py-1.5 text-neutral-500 max-w-[160px] truncate">
                    {product.category?.name || "—"}
                  </td>
                  <td className=" px-3 py-1.5 text-right text-neutral-700">
                    {product.price.toLocaleString("ru-RU")} руб
                  </td>
                  <td className=" px-3 py-1.5 text-center text-neutral-500">
                    {product.stock}
                  </td>
                  <td className=" px-3 py-1.5 text-center">
                    {statusBadge(product)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-[#1195eb] hover:bg-blue-50 transition-colors">
                          <Pencil className="h-3 w-3" />
                        </button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                            <AlertDialogDescription>«{product.name}» будет удалён.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600">Удалить</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ── */}
      <div className="flex items-center justify-between mt-3 text-[13px] text-neutral-500">
        <span>
          {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, total)} из {total}
          {selected.size > 0 && <span className="ml-2 text-[#1195eb]">· выбрано: {selected.size}</span>}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-0.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-7 w-7 flex items-center justify-center rounded border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className="px-1 text-neutral-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "h-7 w-7 flex items-center justify-center rounded border text-xs transition-colors",
                      p === page
                        ? "border-[#1195eb] bg-[#1195eb] text-white"
                        : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 w-7 flex items-center justify-center rounded border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
