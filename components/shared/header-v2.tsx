"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Phone,
  LayoutGrid,
  Clock,
  MapPin,
  ArrowRight,
  Zap,
  Bot,
  Sparkles,
  Search,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Container } from "./container";
import { SearchBar } from "./search-bar";
import { CatalogMenuV2 } from "./catalog-menu-v2";
import { CallbackModal } from "./callback-modal";
import { contactInfo } from "@/lib/mock-data";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useStoreHydrated } from "@/hooks/use-store-hydration";

const navLinks = [
  { label: "Акции", href: "/promotions" },
  { label: "Доставка", href: "/delivery" },
  { label: "Оплата", href: "/payment" },
  { label: "О компании", href: "/about" },
  { label: "Блог", href: "/blog" },
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
      {/* ━━━ Sticky dark rounded header ━━━ */}
      <header className="sticky top-0 z-50 py-2">
        <Container>
          <div className="rounded-2xl bg-neutral-900 px-5 py-3 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="text-lg font-black tracking-tight text-white font-(family-name:--font-unbounded)">
                МЕТАЛЛ<span className="text-primary">ЛИДЕР</span>
              </div>
            </Link>

            {/* Catalog button */}
            <div className="hidden lg:block">
              <CatalogMenuV2 />
            </div>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar />
            </div>

            {/* Phone */}
            <a
              href={`tel:${contactInfo.phoneRaw}`}
              className="hidden xl:flex items-center gap-2 text-sm font-bold text-white/70 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4 text-primary" />
              {contactInfo.phone}
            </a>

            {/* Action buttons */}
            <div className="ml-auto flex items-center gap-1.5">
              {/* Search mobile */}
              <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 transition-all">
                <Search className="h-5 w-5" />
              </button>

              {/* AI Chat */}
              <button
                onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                className="hidden lg:flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/80 transition-all cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5" />
                AI
                <Sparkles className="h-3 w-3 text-primary group-hover:text-white" />
              </button>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-primary transition-all relative"
              >
                <Heart className="h-5 w-5" />
                {hydrated && favCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                    {favCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-white/50 hover:bg-white/10 hover:text-primary transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                {hydrated && cartCount > 0 && (
                  <span className="text-xs font-bold text-primary">{cartCount}</span>
                )}
              </Link>

              {/* Profile */}
              {session?.user ? (
                <Link
                  href="/profile"
                  className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-primary transition-all"
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-primary transition-all"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* AI Chat — mobile */}
              <button
                onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-white/50 hover:bg-white/10 hover:text-primary transition-all relative"
                aria-label="AI Помощник"
              >
                <Bot className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                  <Sparkles className="h-2 w-2 text-white" />
                </span>
              </button>

              {/* Mobile burger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] bg-white border-r border-neutral-200 p-0 overflow-y-auto">
                  {/* Mobile header */}
                  <div className="relative overflow-hidden px-6 pt-8 pb-6">
                    <span className="pointer-events-none absolute -right-2 -top-2 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                      ML
                    </span>
                    <SheetTitle className="relative text-2xl font-black font-(family-name:--font-unbounded)">
                      <span className="text-neutral-900">МЕТАЛЛ</span>
                      <span className="text-primary">ЛИДЕР</span>
                    </SheetTitle>
                    <p className="relative mt-1 text-xs text-neutral-400">Металлопрокат оптом и в розницу</p>
                  </div>

                  {/* Catalog CTA */}
                  <div className="px-5 mb-4">
                    <Link
                      href="/catalog"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-primary p-4 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="h-5 w-5" />
                        <div>
                          <span className="text-sm font-bold">Каталог</span>
                          <p className="text-[10px] text-white/70">Все категории товаров</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/60" />
                    </Link>
                  </div>

                  {/* Nav links */}
                  <div className="px-5 space-y-0.5">
                    {navLinks.map((link, i) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-neutral-100 transition-all"
                      >
                        <span className="text-[10px] font-black text-neutral-300 font-(family-name:--font-unbounded) w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* AI Chat in mobile */}
                  <div className="px-5 mb-3">
                    <button
                      onClick={() => { window.dispatchEvent(new Event("open-ai-chat")); setMobileOpen(false); }}
                      className="flex w-full items-center justify-between rounded-2xl bg-neutral-100 p-4 text-neutral-900 hover:bg-neutral-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Bot className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-bold flex items-center gap-1.5">
                            AI Помощник
                            <Sparkles className="h-3 w-3 text-primary" />
                          </span>
                          <p className="text-[10px] text-neutral-400">Эксперт по металлопрокату</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-400" />
                    </button>
                  </div>

                  <div className="mx-5 my-4 h-px bg-neutral-200" />

                  {/* Action cards */}
                  <div className="px-5 grid grid-cols-2 gap-2">
                    <Link
                      href="/favorites"
                      onClick={() => setMobileOpen(false)}
                      className="relative flex flex-col items-center gap-2 rounded-2xl bg-neutral-100 p-4 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-all"
                    >
                      <Heart className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Избранное</span>
                      {hydrated && favCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                          {favCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setMobileOpen(false)}
                      className="relative flex flex-col items-center gap-2 rounded-2xl bg-neutral-100 p-4 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-all"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-[11px] font-medium">Корзина</span>
                      {hydrated && cartCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  <div className="mx-5 my-4 h-px bg-neutral-200" />

                  {/* Account */}
                  {session?.user ? (
                    <div className="px-5 mb-4">
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-neutral-100 transition-all"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-neutral-900">Личный кабинет</span>
                          <p className="text-[10px] text-neutral-400">Мои заказы и настройки</p>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <div className="px-5 mb-4">
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-neutral-100 transition-all"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-neutral-900">Войти</span>
                          <p className="text-[10px] text-neutral-400">Авторизация</p>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Contact block */}
                  <div className="px-5 pb-8">
                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200">
                      <a
                        href={`tel:${contactInfo.phoneRaw}`}
                        className="text-xl font-black text-neutral-900 hover:text-primary transition-colors font-(family-name:--font-unbounded)"
                      >
                        {contactInfo.phone}
                      </a>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          <Clock className="h-3 w-3 text-primary" />
                          {contactInfo.workingHours}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          <MapPin className="h-3 w-3 text-primary" />
                          {contactInfo.warehouse}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCallbackOpen(true); setMobileOpen(false); }}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Заказать звонок
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center mt-2 pt-2 border-t border-white/10 gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-1 text-[13px] font-medium text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-3 text-[12px] text-white/30">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Склад работает
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {contactInfo.workingHours}
              </span>
            </div>
          </div>
          </div>
        </Container>
      </header>
      <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />
    </>
  );
}
