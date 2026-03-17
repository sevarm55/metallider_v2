"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  SlidersHorizontal,
  Users,
  ScrollText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { axiosInstance } from "@/lib/services/instance";

const navItems = [
  { label: "Дашборд", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Товары", href: "/admin/products", icon: Package },
  { label: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { label: "Категории", href: "/admin/categories", icon: FolderTree },
  { label: "Характеристики", href: "/admin/attributes", icon: SlidersHorizontal },
  { label: "Блог", href: "/admin/blog", icon: BookOpen },
  { label: "Пользователи", href: "/admin/users", icon: Users },
  { label: "Логи", href: "/admin/logs", icon: ScrollText },
  { label: "Настройки", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggle } = useSidebar();

  async function handleLogout() {
    await axiosInstance.post("/admin/logout");
    router.push("/admin/login");
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-neutral-200 bg-white text-neutral-700 transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-neutral-200 px-4">
        {collapsed ? (
          <span className="text-lg font-black text-primary">МЛ</span>
        ) : (
          <span className="font-(family-name:--font-archivo-black) text-base tracking-widest text-neutral-900">
            МЕТАЛЛ<span className="text-primary">ЛИДЕР</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-neutral-200 px-2 py-2 space-y-0.5">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="h-[18px] w-[18px] mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="h-[18px] w-[18px]" />
              <span>Свернуть</span>
            </>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
