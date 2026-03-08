"use client";

import { useEffect, useState } from "react";
import { Package, FolderTree, ShoppingCart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { axiosInstance } from "@/lib/services/instance";

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
  LOGIN: "Вход",
  LOGOUT: "Выход",
  CREATE_PRODUCT: "Создание товара",
  UPDATE_PRODUCT: "Обновление товара",
  DELETE_PRODUCT: "Удаление товара",
  CREATE_CATEGORY: "Создание категории",
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
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
      color: "text-primary bg-primary/10",
    },
    {
      label: "Активных",
      value: stats.activeProducts,
      icon: Activity,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Категорий",
      value: stats.totalCategories,
      icon: FolderTree,
      color: "text-accent bg-accent/10",
    },
    {
      label: "Заказов",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-violet-600 bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Дашборд</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Последние действия</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет действий</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {actionLabels[log.action] || log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.user.fullName} — {log.entity}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
