"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

export function AdminHeader() {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-neutral-200 bg-white px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={toggle}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <button className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>
      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
        А
      </div>
    </header>
  );
}
