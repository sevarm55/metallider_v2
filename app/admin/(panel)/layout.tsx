"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "../_components/sidebar-context";
import { AdminSidebar } from "../_components/admin-sidebar";
import { AdminHeader } from "../_components/admin-header";

function PanelContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  // Clear product filters when navigating away from products section
  useEffect(() => {
    if (!pathname.startsWith("/admin/products")) {
      sessionStorage.removeItem("admin_products_filters");
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <AdminSidebar />
      <div
        className={cn(
          "flex-1 transition-all duration-200",
          collapsed ? "ml-16" : "ml-64",
        )}
      >
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PanelContent>{children}</PanelContent>
    </SidebarProvider>
  );
}
