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
  Send,
  Mail,
  Bot,
  Sparkles,
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
  { label: "Контакты", href: "/contacts" },
];

export function HeaderClassic() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const { data: session } = useSession();
  const hydrated = useStoreHydrated();
  const cartCount = useCartStore((s) => s.totalItems());
  const favCount = useFavoritesStore((s) => s.items.length);

  return (
    <>
      {/* ━━━ Top micro-bar — dark accent strip ━━━ */}
      <div className="hidden lg:block bg-neutral-900 text-[11px] text-white/50">
        <Container className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${contactInfo.phoneRaw}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="h-3 w-3 text-primary" />
              {contactInfo.phone}
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="h-3 w-3 text-primary/60" />
              {contactInfo.email}
            </a>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary/60" />
              {contactInfo.warehouse}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-primary/60" />
              {contactInfo.workingHours}
            </span>
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Telegram">
                <Send className="h-3 w-3" />
              </a>
              <a href="#" className="hover:text-primary transition-colors font-bold" aria-label="VK">
                VK
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* ━━━ Main header — light ━━━ */}
      <div className="relative overflow-hidden bg-white border-b border-neutral-100">
        {/* Giant watermark */}
        <span className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[clamp(5rem,14vw,11rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded) hidden lg:block">
          METAL
        </span>

        <Container className="relative flex items-center justify-between gap-4 py-4 lg:gap-6">
          {/* Logo + catalog btn */}
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <div>
                <div className="text-xl font-black tracking-tight text-neutral-900 font-(family-name:--font-unbounded)">
                  МЕТАЛЛ<span className="text-primary">ЛИДЕР</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight hidden sm:block">металлопрокат оптом и в розницу</p>
              </div>
            </Link>
          </div>

          {/* Search */}
          <SearchBar />

          {/* Phone + callback */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="text-right">
              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="text-lg font-black text-neutral-900 tracking-tight hover:text-primary transition-colors"
              >
                {contactInfo.phone}
              </a>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Онлайн
                </span>
                <button
                  type="button"
                  onClick={() => setCallbackOpen(true)}
                  className="text-[11px] font-medium text-primary hover:text-primary/70 transition-colors underline decoration-dashed underline-offset-2"
                >
                  Перезвоните мне
                </button>
              </div>
            </div>
          </div>
          <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />

          {/* Actions row */}
          <div className="flex items-center gap-1.5">
            {/* Favorites */}
            <Link
              href="/favorites"
              className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-neutral-600 hover:border-primary hover:text-primary transition-all relative"
            >
              <Heart className="h-5 w-5" />
              {hydrated && favCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-lg shadow-red-500/30">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-11 items-center gap-2 rounded-2xl border border-neutral-300 bg-white px-3 text-neutral-600 hover:border-primary hover:text-primary transition-all"
            >
              <ShoppingCart className="h-5 w-5" />
              {hydrated && cartCount > 0 ? (
                <span className="text-xs font-bold text-primary">{cartCount}</span>
              ) : (
                <span className="hidden sm:inline text-xs text-neutral-500">Корзина</span>
              )}
            </Link>

            {/* Profile */}
            {session?.user ? (
              <Link
                href="/profile"
                className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-neutral-600 hover:border-primary hover:text-primary transition-all"
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-neutral-600 hover:border-primary hover:text-primary transition-all"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* AI Chat — mobile */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-300 bg-white text-neutral-600 hover:border-primary hover:text-primary transition-all relative"
              aria-label="AI Помощник"
            >
              <Bot className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </button>

            {/* Mobile burger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-all">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] bg-neutral-950 border-r border-white/5 p-0 overflow-y-auto">
                {/* Mobile header */}
                <div className="relative overflow-hidden px-6 pt-8 pb-6">
                  <span className="pointer-events-none absolute -right-2 -top-2 select-none text-[5rem] font-black leading-none text-white/3 font-(family-name:--font-unbounded)">
                    ML
                  </span>
                  <SheetTitle className="relative text-2xl font-black font-(family-name:--font-unbounded)">
                    <span className="text-white">МЕТАЛЛ</span>
                    <span className="text-primary">ЛИДЕР</span>
                  </SheetTitle>
                  <p className="relative mt-1 text-xs text-white/30">Металлопрокат оптом и в розницу</p>
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

                {/* Nav links with numbers */}
                <div className="px-5 space-y-0.5">
                  {navLinks.map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-all"
                    >
                      <span className="text-[10px] font-black text-white/10 font-(family-name:--font-unbounded) w-5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* AI Chat in mobile */}
                <div className="px-5 mb-3">
                  <button
                    onClick={() => { window.dispatchEvent(new Event("open-ai-chat")); setMobileOpen(false); }}
                    className="flex w-full items-center justify-between rounded-2xl bg-white/8 p-4 text-white hover:bg-white/12 transition-all cursor-pointer"
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
                        <p className="text-[10px] text-white/30">Эксперт по металлопрокату</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30" />
                  </button>
                </div>

                <div className="mx-5 my-4 h-px bg-white/5" />

                {/* Action cards */}
                <div className="px-5 grid grid-cols-2 gap-2">
                  <Link
                    href="/favorites"
                    onClick={() => setMobileOpen(false)}
                    className="relative flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 text-white/40 hover:bg-white/10 hover:text-white transition-all"
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
                    className="relative flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 text-white/40 hover:bg-white/10 hover:text-white transition-all"
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

                <div className="mx-5 my-4 h-px bg-white/5" />

                {/* Account */}
                {session?.user ? (
                  <div className="px-5 mb-4">
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">Личный кабинет</span>
                        <p className="text-[10px] text-white/30">Мои заказы и настройки</p>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="px-5 mb-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">Войти</span>
                        <p className="text-[10px] text-white/30">Авторизация</p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Contact block */}
                <div className="px-5 pb-8">
                  <div className="rounded-2xl bg-white/5 p-5">
                    <a
                      href={`tel:${contactInfo.phoneRaw}`}
                      className="text-xl font-black text-white hover:text-primary transition-colors font-(family-name:--font-unbounded)"
                    >
                      {contactInfo.phone}
                    </a>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-white/40">
                        <Clock className="h-3 w-3 text-primary/50" />
                        {contactInfo.workingHours}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/40">
                        <MapPin className="h-3 w-3 text-primary/50" />
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
        </Container>
      </div>

      {/* ━━━ Sticky nav — light with style ━━━ */}
      <nav className="sticky top-0 z-50 hidden lg:block bg-white/80 backdrop-blur-xl border-b border-neutral-100 shadow-sm">
        <Container>
          <div className="flex items-center">
            {/* Catalog mega-menu */}
            <CatalogMenuV2 />

            <div className="mx-1 h-5 w-px bg-neutral-200" />

            {/* Nav links with numbers */}
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative flex items-center gap-2 px-5 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <span className="text-[9px] font-black text-neutral-300 font-(family-name:--font-unbounded) transition-colors group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
                <span className="absolute bottom-0 left-5 right-5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Склад работает
              </span>

              {/* AI Chat trigger in nav */}
              <button
                onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                className="flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary transition-all cursor-pointer group"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>AI Помощник</span>
                <Sparkles className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
              </button>

              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 transition-all"
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                {contactInfo.phone}
              </a>
            </div>
          </div>
        </Container>
      </nav>
    </>
  );
}
