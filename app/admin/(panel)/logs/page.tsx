"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { axiosInstance } from "@/lib/services/instance";

interface LogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
  user: { fullName: string; email: string };
}

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Вход",
  LOGOUT: "Выход",
  CREATE_PRODUCT: "Создание товара",
  UPDATE_PRODUCT: "Обновление товара",
  DELETE_PRODUCT: "Удаление товара",
  CREATE_CATEGORY: "Создание категории",
  UPDATE_CATEGORY: "Обновление категории",
  DELETE_CATEGORY: "Удаление категории",
  UPDATE_ORDER: "Обновление заказа",
  CHANGE_PASSWORD: "Смена пароля",
  UPDATE_SETTINGS: "Обновление настроек",
  SYNC_MOYSKLAD: "Синхр. МойСклад",
  IMPORT_PRODUCTS: "Импорт товаров",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_PRODUCT: "bg-emerald-500/10 text-emerald-600",
  CREATE_CATEGORY: "bg-emerald-500/10 text-emerald-600",
  UPDATE_PRODUCT: "bg-blue-500/10 text-blue-600",
  UPDATE_CATEGORY: "bg-blue-500/10 text-blue-600",
  UPDATE_ORDER: "bg-blue-500/10 text-blue-600",
  DELETE_PRODUCT: "bg-red-500/10 text-red-600",
  DELETE_CATEGORY: "bg-red-500/10 text-red-600",
  SYNC_MOYSKLAD: "bg-violet-500/10 text-violet-600",
  IMPORT_PRODUCTS: "bg-amber-500/10 text-amber-600",
  LOGIN: "bg-gray-500/10 text-gray-600",
  LOGOUT: "bg-gray-500/10 text-gray-600",
};

const PAGE_SIZE = 50;

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async (p: number, a: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (a) params.set("action", a);
      const res = await axiosInstance.get(`/admin/logs?${params}`);
      if (res.data.success) {
        const d = res.data.data;
        setLogs(d.logs);
        setTotal(d.total);
        setTotalPages(d.totalPages);
      }
    } catch {
      toast.error("Ошибка загрузки логов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs(page, action);
  }, [page, action, loadLogs]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatData(data: Record<string, unknown> | null): string {
    if (!data) return "—";
    const parts: string[] = [];
    if (data.name) parts.push(String(data.name));
    if (data.count) parts.push(`кол-во: ${data.count}`);
    if (data.created !== undefined) parts.push(`создано: ${data.created}`);
    if (data.updated !== undefined) parts.push(`обновлено: ${data.updated}`);
    return parts.length > 0 ? parts.join(", ") : "—";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Логи действий</h1>
        <Select value={action || "_all"} onValueChange={(v) => { setAction(v === "_all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Все действия" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Все действия</SelectItem>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Сущность</TableHead>
              <TableHead>Детали</TableHead>
              <TableHead>Пользователь</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Нет записей
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={ACTION_COLORS[log.action] || ""}>
                      {ACTION_LABELS[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.entity}
                    {log.entityId && (
                      <span className="text-muted-foreground text-xs ml-1">#{log.entityId.slice(-6)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {formatData(log.data)}
                  </TableCell>
                  <TableCell className="text-sm">{log.user.fullName}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} из {total}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
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
                  <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ),
              )}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
