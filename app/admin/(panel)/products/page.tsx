"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Package, Pencil, RefreshCw, FileUp, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadProducts = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
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
    loadProducts(page, search);
  }, [page, search, loadProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
      const res = await axiosInstance.delete("/admin/products", {
        data: { ids: Array.from(selected) },
      });
      if (res.data.success) {
        const deletedCount = res.data.data.deleted;
        setSelected(new Set());
        toast.success(`Удалено ${deletedCount} товаров`);
        loadProducts(page, search);
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
          `Синхронизация завершена: обновлено ${updated} из ${syncTotal}` +
            (notFound > 0 ? `, не найдено ${notFound}` : "") +
            (errors > 0 ? `, ошибок ${errors}` : ""),
        );
        loadProducts(page, search);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка синхронизации с МойСклад");
      }
    } finally {
      setSyncing(false);
    }
  }

  const allPageSelected =
    products.length > 0 && products.every((p) => selected.has(p.id));

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected((prev) => {
        const next = new Set(prev);
        products.forEach((p) => next.add(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        products.forEach((p) => next.delete(p.id));
        return next;
      });
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Товары</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSyncMoysklad}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Синхронизация..." : "Синхр. МойСклад"}
          </Button>
          <Link href="/admin/products/import">
            <Button variant="outline" className="gap-2">
              <FileUp className="h-4 w-4" />
              Импорт CSV
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
              Добавить товар
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + bulk actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        {selected.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={bulkDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {bulkDeleting
                  ? "Удаление..."
                  : `Удалить (${selected.size})`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить {selected.size} товаров?</AlertDialogTitle>
                <AlertDialogDescription>
                  Выбранные товары будут удалены безвозвратно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Удалить {selected.size} товаров
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-[60px]">Фото</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead className="text-center">Остаток</TableHead>
              <TableHead className="text-center">Статус</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  {search ? "Ничего не найдено" : "Нет товаров"}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className={selected.has(product.id) ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(product.id)}
                      onCheckedChange={(checked) => toggleOne(product.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary/50 overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      {product.isHit && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px]">
                          Хит
                        </Badge>
                      )}
                      {product.isNew && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                          Новинка
                        </Badge>
                      )}
                    </div>
                    {product.code && (
                      <p className="text-xs text-muted-foreground">
                        Арт: {product.code}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        product.stock > 0
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-600"
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className={
                        product.isActive
                          ? "bg-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {product.isActive ? "Активен" : "Скрыт"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                            <AlertDialogDescription>
                              «{product.name}» будет удалён безвозвратно.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} из {total} товаров
          {selected.size > 0 && ` · Выбрано: ${selected.size}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dot-${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ),
              )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
