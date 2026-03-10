"use client";

import { useEffect, useState } from "react";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Activity,
  TrendingUp,
  Clock,
  User,
  ArrowUpRight,
} from "lucide-react";
import { axiosInstance } from "@/lib/services/instance";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Statistics {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalOrders: number;
  recentLogs: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user: { fullName: string };
  }>;
}

const actionLabels: Record<string, string> = {
  LOGIN: "Вход в систему",
  LOGOUT: "Выход из системы",
  CREATE_PRODUCT: "Создание товара",
  UPDATE_PRODUCT: "Обновление товара",
  DELETE_PRODUCT: "Удаление товара",
  CREATE_CATEGORY: "Создание категории",
};

const actionColors: Record<string, string> = {
  LOGIN: "bg-green-500",
  LOGOUT: "bg-neutral-400",
  CREATE_PRODUCT: "bg-blue-500",
  UPDATE_PRODUCT: "bg-amber-500",
  DELETE_PRODUCT: "bg-red-500",
  CREATE_CATEGORY: "bg-violet-500",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/admin/statistics")
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-7 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: "Всего товаров",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600 bg-blue-50",
      href: "/admin/products",
    },
    {
      label: "Активных",
      value: stats.activeProducts,
      icon: Activity,
      color: "text-green-600 bg-green-50",
      href: "/admin/products",
    },
    {
      label: "Категорий",
      value: stats.totalCategories,
      icon: FolderTree,
      color: "text-violet-600 bg-violet-50",
      href: "/admin/categories",
    },
    {
      label: "Заказов",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-amber-600 bg-amber-50",
      href: "/admin/products",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Дашборд</h1>
        <span className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Clock className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group flex items-center gap-4 rounded-xl bg-white border border-neutral-200 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", card.color)}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
              <p className="text-xs text-neutral-400">{card.label}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-neutral-300 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Recent logs */}
        <div className="lg:col-span-3 rounded-xl bg-white border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900">Последние действия</h2>
            <Link href="/admin/logs" className="text-xs text-primary hover:underline">
              Все логи
            </Link>
          </div>

          {stats.recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-8 w-8 text-neutral-200 mb-2" />
              <p className="text-sm text-neutral-400">Нет действий</p>
            </div>
          ) : (
            <div>
              {stats.recentLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 hover:bg-neutral-50 transition-colors",
                    idx !== stats.recentLogs.length - 1 && "border-b border-neutral-50",
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0", actionColors[log.action] || "bg-neutral-300")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 truncate">
                      {actionLabels[log.action] || log.action}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">{log.entity}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.user.fullName}
                    </p>
                    <p className="text-[10px] text-neutral-300">
                      {new Date(log.createdAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          {/* Activity */}
          <div className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-4">Активность товаров</h3>
            <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-1000"
                style={{ width: stats.totalProducts > 0 ? `${(stats.activeProducts / stats.totalProducts) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-400">
              <span>Активных</span>
              <span className="font-medium text-neutral-600">
                {stats.totalProducts > 0 ? Math.round((stats.activeProducts / stats.totalProducts) * 100) : 0}%
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                {stats.activeProducts} из {stats.totalProducts}
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-xl bg-white border border-neutral-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">Быстрые действия</h3>
            <div className="space-y-1.5">
              <Link
                href="/admin/products/new"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Package className="h-4 w-4" />
                Добавить товар
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <FolderTree className="h-4 w-4" />
                Категории
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Activity className="h-4 w-4" />
                Настройки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
