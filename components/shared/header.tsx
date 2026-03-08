"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  Phone,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Container } from "./container";
import { TopBar } from "./top-bar";
import { SearchBar } from "./search-bar";
import { CallbackModal } from "./callback-modal";
import { contactInfo } from "@/lib/mock-data";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useStoreHydrated } from "@/hooks/use-store-hydration";
import Image from "next/image";

const navLinks = [
  { label: "Акции", href: "/promotions" },
  { label: "Доставка", href: "/delivery" },
  { label: "Оплата", href: "/payment" },
  { label: "О компании", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const { data: session } = useSession();
  const hydrated = useStoreHydrated();
  const cartCount = useCartStore((s) => s.totalItems());
  const favCount = useFavoritesStore((s) => s.items.length);

  return (
    <>
      <TopBar />

      {/* Main header */}
      <div className="border-b bg-white">
        <Container className="flex items-center gap-6 py-4 lg:gap-10">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* <div className="flex items-center gap-1">
              <div className="h-10 w-2 rounded-sm bg-primary" />
              <div>
                <span className="text-2xl font-black tracking-tight text-neutral-900">
                  МЕТАЛЛ
                </span>
                <span className="text-2xl font-black tracking-tight text-primary">
                  ЛИДЕР
                </span>
              </div>
            </div> */}
            <div className="flex items-center gap-2 md:gap-2">
                <Image
                  src="/images/logov3.png"
                  alt="МеталлЛидер"
                  width={200}
                  height={24}
                  className="h-6 w-auto"
                  priority
                />
                {/* <div>
                  <h1 className="text-xl md:text-2xl uppercase font-black font-unbounded">
                    МЕТАЛ<span className="text-orange-500">ЛИДЕР</span>
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground font-montserrat leading-3 hidden md:block">
                    Металлическое Превосходство
                  </p>
                </div> */}
              </div>
          </Link>

          {/* Search */}
          <SearchBar />

          {/* Phone block */}
          <div className="hidden shrink-0 lg:flex items-center gap-3">
            <a href={`tel:${contactInfo.phoneRaw}`} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground tracking-tight">
                  {contactInfo.phone}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setCallbackOpen(true); }}
                  className="block text-xs text-primary hover:underline"
                >
                  Обратный звонок
                </button>
              </div>
            </a>
          </div>
          <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />

          {/* Divider */}
          <div className="hidden lg:block h-10 w-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <Link
              href="/favorites"
              className="hidden sm:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <div className="relative">
                <Heart className="h-5 w-5" />
                {hydrated && favCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {favCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Избранное</span>
            </Link>
            <Link
              href="/cart"
              className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {hydrated && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">Корзина</span>
            </Link>
            {session?.user ? (
              <Link
                href="/profile"
                className="hidden sm:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-[10px]">Кабинет</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-[10px]">Войти</span>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden ml-1">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetTitle className="text-xl font-black">
                  <span className="text-neutral-900">МЕТАЛЛ</span>
                  <span className="text-primary">ЛИДЕР</span>
                </SheetTitle>
                <div className="mt-6 flex flex-col gap-1">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Поиск..." className="pl-9" />
                  </div>
                  <Link
                    href="/catalog"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Каталог
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-3" />
                  {session?.user ? (
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Личный кабинет
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Войти
                    </Link>
                  )}
                  <hr className="my-3" />
                  <a
                    href={`tel:${contactInfo.phoneRaw}`}
                    className="px-3 py-2 text-lg font-bold text-primary"
                  >
                    {contactInfo.phone}
                  </a>
                  <p className="px-3 text-xs text-muted-foreground">
                    {contactInfo.workingHours}
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Container>

      </div>

      {/* Navigation — sticky */}
      <nav className="sticky top-0 z-50 hidden lg:block border-b border-neutral-100 bg-white/80 backdrop-blur-lg shadow-sm">
        <Container>
          <div className="flex items-center">
            {/* Catalog button */}
            <Link
              href="/catalog"
              className="flex items-center gap-2 rounded-lg bg-primary mr-1 px-5 py-2 my-1.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
              Каталог
              <ChevronDown className="h-3.5 w-3.5 ml-0.5 opacity-70" />
            </Link>

            {/* Divider */}
            <div className="mx-2 h-5 w-px bg-neutral-200" />

            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
              >
                {link.label}
              </Link>
            ))}

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Склад работает
              </span>
            </div>
          </div>
        </Container>
      </nav>
    </>
  );
}
