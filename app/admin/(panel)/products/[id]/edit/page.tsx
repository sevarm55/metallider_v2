"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X, CloudDownload, Eraser, Wand2, Plus, Trash2, Download, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichEditor } from "@/components/ui/rich-editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/services/instance";
import {
  createProductSchema,
  type CreateProductData,
  type ProductAttributeData,
  unitLabels,
} from "@/lib/schemas/product-schema";
import { slugify } from "@/lib/slugify";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: CategoryChild[];
}

interface AttributeDef {
  id: string;
  name: string;
  key: string;
  type: string;
  unit: string | null;
  groupId: string | null;
  group: { id: string; name: string } | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fetchingMs, setFetchingMs] = useState(false);
  const [processingIdx, setProcessingIdx] = useState<number | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [availableAttributes, setAvailableAttributes] = useState<AttributeDef[]>([]);
  const [productAttributes, setProductAttributes] = useState<ProductAttributeData[]>([]);
  const [withDimensions, setWithDimensions] = useState(true);
  const [applyingToCategory, setApplyingToCategory] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      unit: "METER" as const,
      isActive: true,
      isHit: false,
      isNew: false,
      stock: 0,
      price: 0,
      images: [] as string[],
      attributes: [] as ProductAttributeData[],
    },
  });

  const name = watch("name");

  useEffect(() => {
    if (name) {
      setValue("slug", slugify(name));
    }
  }, [name, setValue]);

  // Load categories, attributes, and product data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, attrRes, prodRes] = await Promise.all([
          axiosInstance.get("/admin/categories"),
          axiosInstance.get("/admin/attributes"),
          axiosInstance.get(`/admin/products/${productId}`),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data);
        if (attrRes.data.success) setAvailableAttributes(attrRes.data.data);

        if (prodRes.data.success) {
          const p = prodRes.data.data;
          const imageUrls = (p.images || []).map(
            (img: { url: string }) => img.url,
          );
          setImages(imageUrls);

          // Load existing attributes
          const existingAttrs: ProductAttributeData[] = (p.attributes || []).map(
            (pa: { attributeId: string; value: string; numericValue: number | null }) => ({
              attributeId: pa.attributeId,
              value: pa.value,
              numericValue: pa.numericValue,
            })
          );
          setProductAttributes(existingAttrs);

          reset({
            name: p.name,
            slug: p.slug,
            code: p.code || "",
            description: p.description || "",
            categoryId: p.categoryId || "",
            brandId: p.brandId || null,
            price: p.price,
            specialPrice: p.specialPrice || undefined,
            unit: p.unit,
            stock: p.stock,
            isActive: p.isActive,
            isHit: p.isHit,
            isNew: p.isNew,
            images: imageUrls,
            attributes: existingAttrs,
          });
        }
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoadingProduct(false);
      }
    };

    loadData();
  }, [productId, reset]);

  // Sync productAttributes to form
  useEffect(() => {
    setValue("attributes", productAttributes);
  }, [productAttributes, setValue]);

  function addAttribute() {
    const unused = availableAttributes.find(
      (a) => !productAttributes.some((pa) => pa.attributeId === a.id)
    );
    if (!unused) {
      toast.info("Все атрибуты уже добавлены");
      return;
    }
    setProductAttributes((prev) => [
      ...prev,
      { attributeId: unused.id, value: "", numericValue: null },
    ]);
  }

  function removeAttribute(index: number) {
    setProductAttributes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttribute(index: number, field: keyof ProductAttributeData, val: string) {
    setProductAttributes((prev) => {
      const updated = [...prev];
      if (field === "attributeId") {
        updated[index] = { ...updated[index], attributeId: val };
      } else if (field === "value") {
        const attr = availableAttributes.find((a) => a.id === updated[index].attributeId);
        updated[index] = {
          ...updated[index],
          value: val,
          numericValue: attr?.type === "NUMBER" ? parseFloat(val) || null : null,
        };
      }
      return updated;
    });
  }

  const parentCategories = categories.filter((c) => !c.parentId);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;

      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await axiosInstance.post("/admin/upload", formData);
          if (res.data.success) {
            setImages((prev) => {
              const updated = [...prev, res.data.data.url];
              setValue("images", updated);
              return updated;
            });
          }
        }
        toast.success("Фото загружено");
      } catch {
        toast.error("Ошибка загрузки фото");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [setValue],
  );

  function removeImage(index: number) {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setValue("images", updated);
      return updated;
    });
  }

  async function handleProcessImage(index: number, action: "remove-bg") {
    setProcessingIdx(index);
    try {
      const res = await axiosInstance.post("/admin/images/process", {
        imageUrl: images[index],
        action,
      });
      if (res.data.success) {
        setImages((prev) => {
          const updated = [...prev];
          updated[index] = res.data.data.url;
          setValue("images", updated);
          return updated;
        });
        toast.success("Фон удалён");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка обработки фото");
      }
    } finally {
      setProcessingIdx(null);
    }
  }

  async function handleGenerateImage() {
    const productName = watch("name");
    if (!productName?.trim()) {
      toast.error("Сначала введите название товара");
      return;
    }
    const catId = watch("categoryId");
    const allCats = categories.flatMap((c) => [c, ...(c.children || [])]);
    const catName = allCats.find((c) => c.id === catId)?.name;
    setProcessingIdx(-1);
    try {
      // Собираем характеристики для промпта
      const attrText = productAttributes
        .filter((a) => a.value.trim())
        .map((a) => {
          const def = availableAttributes.find((d) => d.id === a.attributeId);
          return def ? `${def.name}: ${a.value}${def.unit ? ` ${def.unit}` : ""}` : "";
        })
        .filter(Boolean)
        .join(", ");

      const res = await axiosInstance.post("/admin/images/process", {
        action: "generate",
        productName: productName.trim(),
        categoryName: catName,
        attributes: attrText || undefined,
        withDimensions,
      });
      if (res.data.success) {
        setImages((prev) => {
          const updated = [...prev, res.data.data.url];
          setValue("images", updated);
          return updated;
        });
        toast.success("Фото сгенерировано");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка генерации фото");
      }
    } finally {
      setProcessingIdx(null);
    }
  }

  async function handleFetchMoyskladImages() {
    const code = watch("code");
    if (!code?.trim()) {
      toast.error("Сначала введите артикул");
      return;
    }
    setFetchingMs(true);
    try {
      const res = await axiosInstance.post("/admin/moysklad/images", { code: code.trim() });
      if (res.data.success) {
        const newImages: string[] = res.data.data.images;
        setImages((prev) => {
          const updated = [...prev, ...newImages];
          setValue("images", updated);
          return updated;
        });
        toast.success(`Загружено ${newImages.length} фото из МойСклад`);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        toast.error(errorData.error);
      } else {
        toast.error("Ошибка загрузки фото из МойСклад");
      }
    } finally {
      setFetchingMs(false);
    }
  }

  async function handleApplyImageToCategory() {
    const catId = watch("categoryId");
    if (!catId || images.length === 0) return;

    setApplyingToCategory(true);
    try {
      const res = await axiosInstance.post("/admin/products/bulk-image", {
        categoryId: catId,
        imageUrl: images[0], // Используем главное фото
      });
      if (res.data.success) {
        const { updated, replaced, added } = res.data.data;
        if (updated > 0) {
          const parts = [];
          if (replaced > 0) parts.push(`заменено у ${replaced}`);
          if (added > 0) parts.push(`добавлено к ${added}`);
          toast.success(`Фото обновлено: ${parts.join(", ")} товаров`);
        } else {
          toast.info("Нет товаров в этой категории");
        }
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка применения фото");
      }
    } finally {
      setApplyingToCategory(false);
    }
  }

  async function onSubmit(data: CreateProductData) {
    try {
      data.images = images;
      data.attributes = productAttributes.filter((a) => a.value.trim() !== "");
      const res = await axiosInstance.put(
        `/admin/products/${productId}`,
        data,
      );
      if (res.data.success) {
        toast.success("Товар обновлён!");
        router.push("/admin/products");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        toast.error(errorData.error);
      } else {
        toast.error("Ошибка обновления товара");
      }
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin block h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Редактировать товар</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    placeholder="Труба профильная 40x20x2"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL (slug)</Label>
                    <Input
                      id="slug"
                      placeholder="truba-profilnaya-40x20x2"
                      {...register("slug")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Артикул</Label>
                    <Input
                      id="code"
                      placeholder="ТП-40-20-2"
                      {...register("code")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <RichEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Описание товара..."
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attributes (EAV) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Характеристики</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addAttribute}
                  disabled={productAttributes.length >= availableAttributes.length}
                >
                  <Plus className="h-4 w-4" />
                  Добавить
                </Button>
              </CardHeader>
              <CardContent>
                {productAttributes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нажмите «Добавить» чтобы указать характеристики товара
                  </p>
                ) : (
                  <div className="space-y-3">
                    {productAttributes.map((pa, index) => {
                      const attrDef = availableAttributes.find((a) => a.id === pa.attributeId);
                      const usedIds = productAttributes
                        .filter((_, i) => i !== index)
                        .map((p) => p.attributeId);
                      const selectableAttrs = availableAttributes.filter(
                        (a) => a.id === pa.attributeId || !usedIds.includes(a.id)
                      );

                      return (
                        <div key={index} className="flex items-start gap-2">
                          <Select
                            value={pa.attributeId}
                            onValueChange={(val) => updateAttribute(index, "attributeId", val)}
                          >
                            <SelectTrigger className="w-[200px] shrink-0">
                              <SelectValue placeholder="Атрибут" />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const grouped = new Map<string, AttributeDef[]>();
                                const ungrouped: AttributeDef[] = [];
                                selectableAttrs.forEach((a) => {
                                  if (a.group) {
                                    const list = grouped.get(a.group.id) || [];
                                    list.push(a);
                                    grouped.set(a.group.id, list);
                                  } else {
                                    ungrouped.push(a);
                                  }
                                });
                                const groupNames = new Map<string, string>();
                                selectableAttrs.forEach((a) => {
                                  if (a.group) groupNames.set(a.group.id, a.group.name);
                                });
                                return (
                                  <>
                                    {Array.from(grouped.entries()).map(([gId, attrs]) => (
                                      <SelectGroup key={gId}>
                                        <SelectLabel className="text-xs font-bold text-amber-600">
                                          {groupNames.get(gId)}
                                        </SelectLabel>
                                        {attrs.map((a) => (
                                          <SelectItem key={a.id} value={a.id}>
                                            {a.name}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    ))}
                                    {ungrouped.length > 0 && (
                                      <SelectGroup>
                                        {grouped.size > 0 && (
                                          <SelectLabel className="text-xs text-muted-foreground">
                                            Без группы
                                          </SelectLabel>
                                        )}
                                        {ungrouped.map((a) => (
                                          <SelectItem key={a.id} value={a.id}>
                                            {a.name}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    )}
                                  </>
                                );
                              })()}
                            </SelectContent>
                          </Select>
                          <div className="flex-1 relative">
                            <Input
                              placeholder={attrDef?.type === "NUMBER" ? "0" : "Значение"}
                              type={attrDef?.type === "NUMBER" ? "number" : "text"}
                              step={attrDef?.type === "NUMBER" ? "0.01" : undefined}
                              value={pa.value}
                              onChange={(e) => updateAttribute(index, "value", e.target.value)}
                            />
                            {attrDef?.unit && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                {attrDef.unit}
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeAttribute(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Фотографии</CardTitle>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                    <Checkbox
                      checked={withDimensions}
                      onCheckedChange={(v) => setWithDimensions(!!v)}
                    />
                    С размерами
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleGenerateImage}
                    disabled={processingIdx !== null}
                  >
                    <Wand2 className={`h-4 w-4 ${processingIdx === -1 ? "animate-pulse" : ""}`} />
                    {processingIdx === -1 ? "Генерация..." : "Сгенерировать"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleFetchMoyskladImages}
                    disabled={fetchingMs}
                  >
                    <CloudDownload className={`h-4 w-4 ${fetchingMs ? "animate-pulse" : ""}`} />
                    {fetchingMs ? "Загрузка..." : "Из МойСклад"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.map((url, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square rounded-lg border bg-secondary/30 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-0.5">
                          <a
                            href={url}
                            download
                            title="Скачать"
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                          <button
                            type="button"
                            title="Удалить фон"
                            onClick={() => handleProcessImage(i, "remove-bg")}
                            disabled={processingIdx !== null}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                          >
                            {processingIdx === i ? (
                              <span className="animate-spin block h-3 w-3 border border-white/30 border-t-white rounded-full" />
                            ) : (
                              <Eraser className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Главное
                        </span>
                      )}
                    </div>
                  ))}

                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <div className="text-center">
                      {uploading ? (
                        <span className="animate-spin block mx-auto h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full" />
                      ) : (
                        <>
                          <Upload className="mx-auto h-6 w-6 text-muted-foreground/40" />
                          <span className="mt-1 block text-[10px] text-muted-foreground">
                            Загрузить
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {images.length > 0 && watch("categoryId") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    onClick={handleApplyImageToCategory}
                    disabled={applyingToCategory}
                  >
                    <Copy className={`h-4 w-4 ${applyingToCategory ? "animate-pulse" : ""}`} />
                    {applyingToCategory
                      ? "Применяем..."
                      : "Применить фото для всей категории"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category & price */}
            <Card>
              <CardHeader>
                <CardTitle>Категория и цена</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Категория *</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {parentCategories.map((parent) => (
                            <SelectGroup key={parent.id}>
                              <SelectLabel className="text-xs font-bold text-foreground">
                                {parent.name}
                              </SelectLabel>
                              {parent.children && parent.children.length > 0 ? (
                                parent.children.map((child) => (
                                  <SelectItem key={child.id} value={child.id}>
                                    {child.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value={parent.id}>
                                  {parent.name}
                                </SelectItem>
                              )}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoryId && (
                    <p className="text-xs text-destructive">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Цена *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price")}
                    />
                    {errors.price && (
                      <p className="text-xs text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialPrice">Спеццена</Label>
                    <Input
                      id="specialPrice"
                      type="number"
                      step="0.01"
                      {...register("specialPrice")}
                    />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-2">
                    <Label>Единица</Label>
                    <Controller
                      name="unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(unitLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Остаток</Label>
                    <Input
                      id="stock"
                      type="number"
                      step="0.01"
                      {...register("stock")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flags */}
            <Card>
              <CardHeader>
                <CardTitle>Параметры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">Активен (виден на сайте)</span>
                    </label>
                  )}
                />
                <Controller
                  name="isHit"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">Хит продаж</span>
                    </label>
                  )}
                />
                <Controller
                  name="isNew"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span className="text-sm">Новинка</span>
                    </label>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
