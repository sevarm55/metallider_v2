"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Pencil, FolderTree, Upload, Sparkles, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/services/instance";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";
import { slugify } from "@/lib/slugify";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  _count: { products: number };
}

const emptyForm = { name: "", slug: "", sortOrder: 0, isActive: true, image: "" as string | null, parentId: "" as string | null };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/categories?all=true");
      if (res.data.success) setCategories(res.data.data);
    } catch {
      toast.error("Ошибка загрузки категорий");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder, isActive: cat.isActive, image: cat.image, parentId: cat.parentId });
    setDialogOpen(true);
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axiosInstance.post("/admin/upload", fd);
      if (res.data.success) {
        setForm((f) => ({ ...f, image: res.data.data.url }));
        toast.success("Изображение загружено");
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleGenerateImage() {
    if (!form.name.trim()) {
      toast.error("Сначала введите название категории");
      return;
    }
    setGenerating(true);
    try {
      const res = await axiosInstance.post("/admin/images/process", {
        action: "generate-category",
        categoryName: form.name,
      });
      if (res.data.success) {
        setForm((f) => ({ ...f, image: res.data.data.url }));
        toast.success("Изображение сгенерировано");
      }
    } catch {
      toast.error("Ошибка генерации");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Введите название");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        image: form.image || null,
        parentId: form.parentId || null,
      };

      if (editingId) {
        await axiosInstance.put(`/admin/categories/${editingId}`, payload);
        toast.success("Категория обновлена");
      } else {
        await axiosInstance.post("/admin/categories", payload);
        toast.success("Категория создана");
      }
      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка сохранения");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Категория удалена");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка удаления");
      }
    }
  }

  // Group: parent categories first, then their children
  const filtered = (() => {
    const matched = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (search) return matched;
    const parents = matched.filter((c) => !c.parentId);
    const result: Category[] = [];
    for (const parent of parents) {
      result.push(parent);
      const children = matched.filter((c) => c.parentId === parent.id);
      result.push(...children);
    }
    // Add orphan children (parent filtered out)
    const addedIds = new Set(result.map((c) => c.id));
    for (const cat of matched) {
      if (!addedIds.has(cat.id)) result.push(cat);
    }
    return result;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Категории</h1>
        <Button onClick={openCreate} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Товаров</TableHead>
              <TableHead className="text-center">Порядок</TableHead>
              <TableHead className="text-center">Статус</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  {search ? "Ничего не найдено" : "Нет категорий"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className={`flex items-center gap-3 ${cat.parentId ? "pl-6" : ""}`}>
                      {cat.image ? (
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                          <img src={cat.image} alt={cat.name} className="absolute inset-0 h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => openEdit(cat)}
                          className="font-medium hover:underline text-left"
                        >
                          {cat.name}
                        </button>
                        {cat.parentId && (
                          <p className="text-xs text-muted-foreground">
                            ↳ {categories.find((c) => c.id === cat.parentId)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{cat._count.products}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{cat.sortOrder}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={cat.isActive ? "default" : "secondary"}
                      className={cat.isActive ? "bg-emerald-600" : "bg-muted text-muted-foreground"}
                    >
                      {cat.isActive ? "Активна" : "Скрыта"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
                            <AlertDialogDescription>
                              «{cat.name}» будет удалена. {cat._count.products > 0 && `В ней ${cat._count.products} товаров — удаление невозможно.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.id)}
                              className="bg-destructive hover:bg-destructive/90"
                              disabled={cat._count.products > 0}
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

      <p className="text-sm text-muted-foreground">
        Всего: {categories.length} категорий
      </p>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать категорию" : "Новая категория"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                placeholder="Трубы ПНД"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="truby-pnd"
              />
            </div>
            <div className="space-y-2">
              <Label>Родительская категория</Label>
              <select
                value={form.parentId || ""}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">— Корневая категория —</option>
                {categories
                  .filter((c) => !c.parentId && c.id !== editingId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
            {/* Category image */}
            <div className="space-y-2">
              <Label>Изображение</Label>
              {form.image ? (
                <div className="relative group">
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border bg-neutral-50">
                    <img src={form.image} alt="Превью" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: null }))}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-8 w-8 mb-1 opacity-40" />
                    <p className="text-xs">Нет изображения</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  disabled={uploading || generating}
                  onClick={() => document.getElementById("cat-image-input")?.click()}
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploading ? "Загрузка..." : "Загрузить"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  disabled={generating || uploading || !form.name.trim()}
                  onClick={handleGenerateImage}
                >
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {generating ? "Генерация..." : "Сгенерировать"}
                </Button>
                <input
                  id="cat-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, isActive: !!checked }))}
              />
              <span className="text-sm">Активна (видна на сайте)</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : editingId ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
