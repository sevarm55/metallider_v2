"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { axiosInstance } from "@/lib/services/instance";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";

interface Category {
  id: string;
  name: string;
}

type CsvRow = Record<string, string>;

const FIELDS = [
  { key: "name", label: "Название", required: true },
  { key: "code", label: "Артикул", required: false },
  { key: "price", label: "Цена", required: true },
  { key: "category", label: "Категория", required: true },
  { key: "unit", label: "Единица", required: false },
  { key: "stock", label: "Остаток", required: false },
  { key: "description", label: "Описание", required: false },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

const UNIT_MAP: Record<string, string> = {
  шт: "PCS", штука: "PCS", штук: "PCS",
  м: "METER", метр: "METER", метров: "METER",
  рулон: "ROLL", рул: "ROLL",
  упак: "PACK", упаковка: "PACK",
  комплект: "SET", компл: "SET",
  л: "LITER", литр: "LITER",
  кг: "KG", килограмм: "KG",
  pcs: "PCS", meter: "METER", roll: "ROLL", pack: "PACK", set: "SET", liter: "LITER", kg: "KG",
};

// Auto-detect column names
const COLUMN_HINTS: Record<FieldKey, string[]> = {
  name: ["название", "наименование", "name", "товар", "продукт"],
  code: ["артикул", "код", "code", "sku", "арт"],
  price: ["цена", "price", "стоимость"],
  category: ["категория", "category", "группа"],
  unit: ["единица", "unit", "ед", "ед.изм"],
  stock: ["остаток", "stock", "количество", "кол-во", "кол"],
  description: ["описание", "description", "desc"],
};

interface ImportResult {
  created: number;
  skipped: number;
  errors: number;
  total: number;
  details: Array<{ row: number; name: string; status: string; error?: string }>;
}

export default function ImportProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    name: "", code: "", price: "", category: "", unit: "", stock: "", description: "",
  });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch(() => toast.error("Ошибка загрузки категорий"));
  }, []);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: (results) => {
          if (results.data.length === 0) {
            toast.error("Файл пустой");
            return;
          }

          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
          setCsvData(results.data);

          // Auto-map columns
          const autoMap: Record<FieldKey, string> = {
            name: "", code: "", price: "", category: "", unit: "", stock: "", description: "",
          };

          for (const field of FIELDS) {
            const hints = COLUMN_HINTS[field.key];
            const match = headers.find((h) =>
              hints.some((hint) => h.toLowerCase().trim() === hint),
            );
            if (match) autoMap[field.key] = match;
          }

          setMapping(autoMap);
          setResult(null);
          toast.success(`Загружено ${results.data.length} строк`);
        },
        error: () => toast.error("Ошибка чтения файла"),
      });

      e.target.value = "";
    },
    [],
  );

  function resolveUnit(raw: string): string {
    if (!raw) return "PCS";
    const lower = raw.toLowerCase().trim();
    return UNIT_MAP[lower] || "PCS";
  }

  function resolveCategoryId(raw: string): string | null {
    if (!raw) return null;
    const lower = raw.toLowerCase().trim();
    const cat = categories.find((c) => c.name.toLowerCase() === lower);
    return cat?.id || null;
  }

  function buildProducts() {
    return csvData.map((row) => {
      const catRaw = mapping.category ? row[mapping.category] || "" : "";
      const categoryId = resolveCategoryId(catRaw);

      return {
        name: mapping.name ? (row[mapping.name] || "").trim() : "",
        code: mapping.code ? (row[mapping.code] || "").trim() : "",
        price: mapping.price ? parseFloat(row[mapping.price] || "0") || 0 : 0,
        categoryId: categoryId || "",
        unit: mapping.unit ? resolveUnit(row[mapping.unit] || "") : "PCS",
        stock: mapping.stock ? parseFloat(row[mapping.stock] || "0") || 1000 : 1000,
        description: mapping.description ? (row[mapping.description] || "").trim() : "",
      };
    });
  }

  async function handleImport() {
    if (!mapping.name || !mapping.price || !mapping.category) {
      toast.error("Укажите колонки: Название, Цена и Категория");
      return;
    }

    const allProducts = buildProducts().filter((p) => p.name && p.categoryId);
    if (allProducts.length === 0) {
      toast.error("Не удалось сопоставить категории. Проверьте названия категорий в файле.");
      return;
    }

    setImporting(true);
    setProgress(`0 / ${allProducts.length}`);

    const BATCH_SIZE = 200;
    const totalResult: ImportResult = { created: 0, skipped: 0, errors: 0, total: allProducts.length, details: [] };

    try {
      for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
        const batch = allProducts.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(allProducts.length / BATCH_SIZE);
        setProgress(`Пакет ${batchNum}/${totalBatches} — ${Math.min(i + BATCH_SIZE, allProducts.length)} / ${allProducts.length}`);

        try {
          const res = await axiosInstance.post("/admin/products/import", { products: batch });
          if (res.data.success) {
            const d = res.data.data as ImportResult;
            totalResult.created += d.created;
            totalResult.skipped += d.skipped;
            totalResult.errors += d.errors;
            // Offset row numbers for batched details
            totalResult.details.push(
              ...d.details.map((det: ImportResult["details"][number]) => ({ ...det, row: det.row + i })),
            );
          }
        } catch (err) {
          if (err instanceof AxiosError && err.response?.data) {
            toast.error(`Ошибка пакета ${batchNum}: ${(err.response.data as ApiErrorResponse).error}`);
          }
          totalResult.errors += batch.length;
        }
      }

      setResult(totalResult);
      toast.success(`Импорт завершён: создано ${totalResult.created} из ${totalResult.total}`);
    } finally {
      setImporting(false);
      setProgress("");
    }
  }

  const previewRows = csvData.slice(0, 10);
  const hasData = csvData.length > 0;
  const mappingComplete = !!(mapping.name && mapping.price && mapping.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Импорт товаров из CSV</h1>
      </div>

      {/* Step 1: File upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            1. Загрузите CSV файл
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 hover:border-primary/40 transition-colors">
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFile}
            />
            <Upload className="h-8 w-8 text-muted-foreground/40" />
            <div className="text-center">
              <p className="font-medium">
                {hasData
                  ? `Загружено: ${csvData.length} строк`
                  : "Нажмите для выбора файла"}
              </p>
              <p className="text-sm text-muted-foreground">
                Формат: CSV (разделитель — запятая или точка с запятой)
              </p>
            </div>
          </label>

          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-1">Формат файла:</p>
            <code className="text-xs">
              название,артикул,цена,категория,единица,остаток,описание
            </code>
            <p className="mt-1 text-xs">
              Категория — по названию (как в админке). Единица: шт, м, рулон, упак, комплект, л, кг
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Column mapping */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>2. Сопоставьте колонки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </label>
                  <Select
                    value={mapping[field.key] || "_none"}
                    onValueChange={(v) =>
                      setMapping((prev) => ({
                        ...prev,
                        [field.key]: v === "_none" ? "" : v,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Не выбрано" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Не выбрано —</SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {hasData && mappingComplete && (
        <Card>
          <CardHeader>
            <CardTitle>
              3. Превью{" "}
              <span className="text-sm font-normal text-muted-foreground">
                (первые {Math.min(10, csvData.length)} из {csvData.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Ед.</TableHead>
                  <TableHead>Остаток</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, i) => {
                  const catRaw = mapping.category ? row[mapping.category] || "" : "";
                  const catId = resolveCategoryId(catRaw);
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        {mapping.name ? row[mapping.name] : "—"}
                      </TableCell>
                      <TableCell>{mapping.code ? row[mapping.code] || "—" : "—"}</TableCell>
                      <TableCell>{mapping.price ? row[mapping.price] : "—"}</TableCell>
                      <TableCell>
                        {catId ? (
                          <span className="text-emerald-600">{catRaw}</span>
                        ) : (
                          <span className="text-destructive" title="Категория не найдена">
                            {catRaw || "—"} ⚠
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {mapping.unit ? resolveUnit(row[mapping.unit] || "") : "PCS"}
                      </TableCell>
                      <TableCell>{mapping.stock ? row[mapping.stock] || "0" : "0"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Import */}
      {hasData && mappingComplete && !result && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="h-12 bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90 px-12"
          >
            {importing ? "Импортируем..." : `Импортировать ${csvData.length} товаров`}
          </Button>
          {importing && progress && (
            <span className="text-sm text-muted-foreground animate-pulse">{progress}</span>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Результат импорта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-emerald-600 gap-1 px-3 py-1 text-sm">
                <Check className="h-3.5 w-3.5" />
                Создано: {result.created}
              </Badge>
              {result.skipped > 0 && (
                <Badge variant="secondary" className="gap-1 px-3 py-1 text-sm">
                  <SkipForward className="h-3.5 w-3.5" />
                  Пропущено: {result.skipped}
                </Badge>
              )}
              {result.errors > 0 && (
                <Badge variant="destructive" className="gap-1 px-3 py-1 text-sm">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Ошибок: {result.errors}
                </Badge>
              )}
            </div>

            {result.details.some((d) => d.status !== "created") && (
              <div className="max-h-60 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Строка</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Причина</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.details
                      .filter((d) => d.status !== "created")
                      .map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.row}</TableCell>
                          <TableCell>{d.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={d.status === "skipped" ? "secondary" : "destructive"}
                            >
                              {d.status === "skipped" ? "Пропущен" : "Ошибка"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {d.error}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Link href="/admin/products">
              <Button variant="outline">Перейти к списку товаров</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
