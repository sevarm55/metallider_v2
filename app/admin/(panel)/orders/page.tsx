"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ShoppingCart,
  Eye,
  X,
  Trash2,
  Package,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  total: number;
  product: { name: string; code: string | null };
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  comment: string | null;
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  user: { fullName: string; email: string } | null;
}

const PAGE_SIZE = 50;

const statusLabels: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  CONFIRMED: "bg-indigo-500",
  PROCESSING: "bg-yellow-500",
  SHIPPED: "bg-orange-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-neutral-400",
};

const allStatuses = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail panel
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadOrders = useCallback(async (p: number, s: string, st: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
      if (st) params.set("status", st);
      const res = await axiosInstance.get(`/admin/orders?${params}`);
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {
      toast.error("Ошибка загрузки заказов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(page, search, statusFilter);
  }, [page, search, statusFilter, loadOrders]);

  function handleSearchInput(val: string) {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setChangingStatus(true);
    try {
      await axiosInstance.put(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Статус изменён на «${statusLabels[newStatus]}»`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      toast.error("Ошибка смены статуса");
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleSaveNotes(orderId: string) {
    setSavingNotes(true);
    try {
      await axiosInstance.put(`/admin/orders/${orderId}`, { notes: editingNotes });
      toast.success("Заметка сохранена");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, notes: editingNotes } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, notes: editingNotes } : null);
      }
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await axiosInstance.delete(`/admin/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setTotal((prev) => prev - 1);
      if (selectedOrder?.id === id) setSelectedOrder(null);
      toast.success("Заказ удалён");
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  function openDetail(order: Order) {
    setSelectedOrder(order);
    setEditingNotes(order.notes || "");
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(n: number) {
    return n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " руб";
  }

  // Pagination
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <h1 className="text-lg font-bold text-neutral-800">Заказы</h1>
        <button onClick={() => loadOrders(page, search, statusFilter)} className="text-neutral-300 hover:text-neutral-500 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="ml-2 h-[30px] rounded border border-neutral-300 bg-white px-2 text-[13px] text-neutral-700 outline-none focus:border-[#1195eb] transition-colors"
        >
          <option value="">Все статусы</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Номер, имя, телефон..."
            className="h-[30px] w-52 rounded border border-neutral-300 bg-white pl-7 pr-2 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
          />
        </div>

        <span className="text-xs text-neutral-400">{total} шт</span>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={cn("bg-white rounded-lg border border-neutral-200 overflow-x-auto", selectedOrder ? "flex-1 min-w-0" : "w-full")}>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-neutral-200">
                <th className="w-16 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">№</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Клиент</th>
                <th className="w-28 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Статус</th>
                <th className="w-24 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Товаров</th>
                <th className="w-28 px-3 py-2 text-right font-semibold text-neutral-500 text-[11px]">Сумма</th>
                <th className="w-36 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Дата</th>
                <th className="w-16 px-2 py-2 text-center">
                  <Settings2 className="h-3.5 w-3.5 mx-auto text-neutral-400" />
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-neutral-300 mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <ShoppingCart className="h-8 w-8 mx-auto text-neutral-200 mb-2" />
                    Нет заказов
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={cn(
                      "border-b border-neutral-200 hover:bg-[#e8f4fd] transition-colors cursor-pointer",
                      selectedOrder?.id === order.id && "bg-[#e8f4fd]",
                    )}
                    onClick={() => openDetail(order)}
                  >
                    <td className="px-3 py-2 text-center">
                      <span className="text-[#1195eb] font-semibold">#{order.orderNumber}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-neutral-800 truncate">{order.fullName}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{order.phone}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white", statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-neutral-500">
                      {order.items.length}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-neutral-800">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-3 py-2 text-center text-neutral-500 text-[12px]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => openDetail(order)}
                          className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-[#1195eb] hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить заказ #{order.orderNumber}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Заказ и все его позиции будут удалены безвозвратно.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(order.id)} className="bg-red-500 hover:bg-red-600">
                                Удалить
                              </AlertDialogAction>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-3 py-2">
              <span className="text-[12px] text-neutral-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} из {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 flex items-center justify-center rounded border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-1 text-neutral-400 text-[12px]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "h-7 min-w-[28px] rounded border text-[12px] font-medium transition-colors",
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-7 w-7 flex items-center justify-center rounded border border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedOrder && (
          <div className="w-[380px] shrink-0 bg-white rounded-lg border border-neutral-200 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-[#fafafa]">
              <h2 className="text-sm font-bold text-neutral-800">
                Заказ <span className="text-[#1195eb]">#{selectedOrder.orderNumber}</span>
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">Статус</label>
                <div className="flex flex-wrap gap-1.5">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={changingStatus || selectedOrder.status === s}
                      className={cn(
                        "rounded px-2.5 py-1 text-[11px] font-semibold transition-colors",
                        selectedOrder.status === s
                          ? cn(statusColors[s], "text-white")
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
                      )}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">Клиент</label>
                <div className="text-[13px] text-neutral-800 space-y-0.5">
                  <div className="font-medium">{selectedOrder.fullName}</div>
                  <div className="text-neutral-500">{selectedOrder.phone}</div>
                  {selectedOrder.email && <div className="text-neutral-500">{selectedOrder.email}</div>}
                </div>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">Адрес доставки</label>
                  <div className="text-[13px] text-neutral-700">{selectedOrder.address}</div>
                </div>
              )}

              {/* Comment */}
              {selectedOrder.comment && (
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">Комментарий клиента</label>
                  <div className="text-[13px] text-neutral-600 bg-neutral-50 rounded px-3 py-2 border border-neutral-200">
                    {selectedOrder.comment}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Товары ({selectedOrder.items.length})
                </label>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 bg-neutral-50 rounded px-3 py-2 border border-neutral-200">
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-neutral-800 truncate">{item.product.name}</div>
                        {item.product.code && (
                          <div className="text-[11px] text-neutral-400 font-mono">{item.product.code}</div>
                        )}
                        <div className="text-[11px] text-neutral-500">
                          {item.qty} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="text-[12px] font-semibold text-neutral-800 shrink-0">
                        {formatPrice(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                  <span className="text-[12px] font-semibold text-neutral-500">Итого</span>
                  <span className="text-[14px] font-bold text-neutral-800">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Заметка менеджера
                </label>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Внутренняя заметка..."
                  rows={3}
                  className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-[#1195eb] transition-colors resize-none"
                />
                <button
                  onClick={() => handleSaveNotes(selectedOrder.id)}
                  disabled={savingNotes || editingNotes === (selectedOrder.notes || "")}
                  className="mt-1.5 h-7 px-3 rounded bg-[#1195eb] text-white text-[12px] font-semibold hover:bg-[#0d7fd4] disabled:opacity-40 transition-colors"
                >
                  {savingNotes ? "..." : "Сохранить заметку"}
                </button>
              </div>

              {/* Date */}
              <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-200">
                Создан: {formatDate(selectedOrder.createdAt)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
