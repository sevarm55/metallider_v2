"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Users,
  X,
  Check,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  verified: string | null;
  provider: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

interface UserDetail extends UserItem {
  orders: {
    id: string;
    orderNumber: number;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
}

const PAGE_SIZE = 50;

const roleLabels: Record<string, string> = {
  USER: "Клиент",
  MANAGER: "Менеджер",
  ADMIN: "Админ",
};

const roleColors: Record<string, string> = {
  USER: "bg-neutral-100 text-neutral-600",
  MANAGER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

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

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Detail panel
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadUsers = useCallback(async (p: number, s: string, r: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
      if (r) params.set("role", r);
      const res = await axiosInstance.get(`/admin/users?${params}`);
      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(page, search, roleFilter);
  }, [page, search, roleFilter, loadUsers]);

  function handleSearchInput(val: string) {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  }

  async function openDetail(userId: string) {
    setLoadingDetail(true);
    try {
      const res = await axiosInstance.get(`/admin/users/${userId}`);
      if (res.data.success) {
        setSelectedUser(res.data.data);
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(true);
    try {
      await axiosInstance.put(`/admin/users/${userId}`, { role: newRole });
      toast.success(`Роль изменена на «${roleLabels[newRole]}»`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
      }
    } catch {
      toast.error("Ошибка смены роли");
    } finally {
      setChangingRole(false);
    }
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    setTogglingActive(true);
    try {
      const res = await axiosInstance.put(`/admin/users/${userId}`, { isActive });
      if (res.data.success) {
        toast.success(isActive ? "Пользователь активирован" : "Пользователь деактивирован");
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive } : u)));
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => prev ? { ...prev, isActive } : null);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ошибка");
    } finally {
      setTogglingActive(false);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatDateTime(d: string) {
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
        <h1 className="text-lg font-bold text-neutral-800">Пользователи</h1>
        <button onClick={() => loadUsers(page, search, roleFilter)} className="text-neutral-300 hover:text-neutral-500 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="ml-2 h-[30px] rounded border border-neutral-300 bg-white px-2 text-[13px] text-neutral-700 outline-none focus:border-[#1195eb] transition-colors"
        >
          <option value="">Все роли</option>
          <option value="USER">Клиенты</option>
          <option value="MANAGER">Менеджеры</option>
          <option value="ADMIN">Админы</option>
        </select>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Имя, email, телефон..."
            className="h-[30px] w-52 rounded border border-neutral-300 bg-white pl-7 pr-2 text-[13px] outline-none focus:border-[#1195eb] transition-colors"
          />
        </div>

        <span className="text-xs text-neutral-400">{total} шт</span>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={cn("bg-white rounded-lg border border-neutral-200 overflow-x-auto", selectedUser ? "flex-1 min-w-0" : "w-full")}>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#fafafa] border-b border-neutral-200">
                <th className="w-10 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">№</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-500 text-[11px]">Пользователь</th>
                <th className="w-28 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Роль</th>
                <th className="w-20 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Статус</th>
                <th className="w-20 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Заказов</th>
                <th className="w-28 px-3 py-2 text-center font-semibold text-neutral-500 text-[11px]">Регистрация</th>
                <th className="w-12 px-2 py-2 text-center">
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <Users className="h-8 w-8 mx-auto text-neutral-200 mb-2" />
                    Нет пользователей
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "border-b border-neutral-200 hover:bg-[#e8f4fd] transition-colors cursor-pointer",
                      selectedUser?.id === user.id && "bg-[#e8f4fd]",
                      !user.isActive && "opacity-50",
                    )}
                    onClick={() => openDetail(user.id)}
                  >
                    <td className="px-3 py-2 text-center text-neutral-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-medium text-neutral-800 truncate">{user.fullName}</span>
                        {user.verified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" aria-label="Подтверждён" />
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">{user.email}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("inline-block rounded px-2 py-0.5 text-[11px] font-semibold", roleColors[user.role])}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {user.isActive ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-neutral-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-neutral-500">{user._count.orders}</td>
                    <td className="px-3 py-2 text-center text-neutral-500 text-[12px]">{formatDate(user.createdAt)}</td>
                    <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openDetail(user.id)}
                        className="h-6 w-6 flex items-center justify-center rounded text-neutral-400 hover:text-[#1195eb] hover:bg-blue-50 transition-colors mx-auto"
                      >
                        <Settings2 className="h-3 w-3" />
                      </button>
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
        {selectedUser && (
          <div className="w-[360px] shrink-0 bg-white rounded-lg border border-neutral-200 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-[#fafafa]">
              <h2 className="text-sm font-bold text-neutral-800 truncate">{selectedUser.fullName}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-5 w-5 animate-spin text-neutral-300 mx-auto" />
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Contact info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[13px]">
                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-neutral-700">{selectedUser.email}</span>
                    {selectedUser.verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-green-500" aria-label="Подтверждён" />
                    )}
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2 text-[13px]">
                      <Phone className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-neutral-700">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.provider && (
                    <div className="text-[11px] text-neutral-400">
                      Провайдер: {selectedUser.provider}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Роль
                  </label>
                  <div className="flex gap-1.5">
                    {(["USER", "MANAGER", "ADMIN"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(selectedUser.id, r)}
                        disabled={changingRole || selectedUser.role === r}
                        className={cn(
                          "rounded px-3 py-1.5 text-[12px] font-semibold transition-colors",
                          selectedUser.role === r
                            ? roleColors[r]
                            : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100",
                        )}
                      >
                        {roleLabels[r]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active toggle */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 block">Активность</label>
                  <button
                    onClick={() => handleToggleActive(selectedUser.id, !selectedUser.isActive)}
                    disabled={togglingActive}
                    className={cn(
                      "rounded px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      selectedUser.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200",
                    )}
                  >
                    {selectedUser.isActive ? "Активен — Деактивировать" : "Заблокирован — Активировать"}
                  </button>
                </div>

                {/* Orders */}
                <div>
                  <label className="text-[11px] font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" />
                    Заказы ({selectedUser._count.orders})
                  </label>
                  {selectedUser.orders.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedUser.orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-neutral-50 rounded px-3 py-2 border border-neutral-200">
                          <div>
                            <span className="text-[12px] font-semibold text-[#1195eb]">#{order.orderNumber}</span>
                            <span className={cn("ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold text-white", statusColors[order.status])}>
                              {statusLabels[order.status]}
                            </span>
                            <div className="text-[11px] text-neutral-400">{formatDateTime(order.createdAt)}</div>
                          </div>
                          <span className="text-[12px] font-semibold text-neutral-800">{formatPrice(order.totalAmount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[12px] text-neutral-400 bg-neutral-50 rounded px-3 py-3 text-center border border-neutral-200">
                      Нет заказов
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-200">
                  Регистрация: {formatDateTime(selectedUser.createdAt)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
