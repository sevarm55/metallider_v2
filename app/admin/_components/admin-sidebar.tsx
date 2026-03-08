"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ScrollText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { axiosInstance } from "@/lib/services/instance";

const navItems = [
  { label: "Дашборд", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Товары", href: "/admin/products", icon: Package },
  { label: "Категории", href: "/admin/categories", icon: FolderTree },
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
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#1B3A4B] text-white transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
        {collapsed ? (
          <span className="text-lg font-bold text-accent">TM</span>
        ) : (
          <span className="font-(family-name:--font-archivo-black) text-lg tracking-widest">
            ТРУБМАРКЕТ
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-2 py-3 space-y-1">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Свернуть</span>
            </>
          )}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
