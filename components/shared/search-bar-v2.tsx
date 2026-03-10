"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Package, FolderOpen, Loader2, X, ArrowRight, Command } from "lucide-react";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  specialPrice?: number;
  unit: string;
  image: string | null;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
}

interface SearchResult {
  products: SearchProduct[];
  categories: SearchCategory[];
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/15 text-primary font-semibold rounded-sm">{part}</mark>
    ) : (
      part
    )
  );
}

export function SearchBar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const router = useRouter();

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResult = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchResults(value), 300) as ReturnType<typeof setTimeout>;
  };

  const openModal = () => {
    setModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const closeModal = () => {
    setModalOpen(false);
    setQuery("");
    setResults(null);
  };

  const navigate = (href: string) => {
    closeModal();
    router.push(href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Ctrl+K / Cmd+K to open, Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openModal();
      }
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const hasResults = results && (results.products.length > 0 || results.categories.length > 0);
  const noResults = results && results.products.length === 0 && results.categories.length === 0;

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={openModal}
        className="hidden md:flex flex-1 items-center gap-3 h-11 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 text-sm text-neutral-500 hover:border-primary/40 hover:bg-white transition-all cursor-text max-w-xl"
      >
        <Search className="h-4 w-4 shrink-0 text-primary/50" />
        <span className="flex-1 text-left">Поиск товаров...</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-300">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl mx-4 animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              {/* Search input */}
              <form onSubmit={handleSubmit} className="relative flex items-center border-b">
                <Search className="absolute left-5 h-5 w-5 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Поиск товаров, категорий..."
                  className="h-14 w-full bg-transparent pl-14 pr-20 text-base outline-none placeholder:text-neutral-400"
                  autoComplete="off"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-7 items-center rounded-md border bg-neutral-100 px-2 text-[11px] font-medium text-neutral-500 hover:bg-neutral-200 transition-colors"
                  >
                    ESC
                  </button>
                </div>
              </form>

              {/* Results area */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Empty state — before typing */}
                {!results && query.length < 2 && (
                  <div className="px-5 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-neutral-500">
                      Начните вводить название товара или артикул
                    </p>
                  </div>
                )}

                {/* Categories */}
                {results && results.categories.length > 0 && (
                  <div className="px-3 pt-3 pb-1">
                    <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Категории
                    </p>
                    <div className="flex flex-wrap gap-2 px-2 pb-2">
                      {results.categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => navigate(`/catalog/${cat.slug}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          {highlightMatch(cat.name, query)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {results && results.products.length > 0 && (
                  <div className="px-3 pb-3">
                    <p className="mb-2 px-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Товары
                    </p>
                    <div className="space-y-0.5">
                      {results.products.map((p) => {
                        const hasDiscount = p.specialPrice && p.specialPrice > 0 && p.specialPrice < p.price;
                        const effectivePrice = hasDiscount ? p.specialPrice! : p.price;
                        return (
                          <button
                            key={p.id}
                            onClick={() => navigate(`/product/${p.slug}`)}
                            className="flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors group"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 ring-1 ring-neutral-200/50">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-contain" />
                              ) : (
                                <Package className="h-6 w-6 text-neutral-300" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                                {highlightMatch(p.name, query)}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className={hasDiscount ? "text-sm font-bold text-primary" : "text-sm font-bold text-neutral-900"}>
                                  {effectivePrice.toLocaleString("ru-RU")} ₽
                                </span>
                                <span className="text-xs text-neutral-400">/ {p.unit}</span>
                                {hasDiscount && (
                                  <span className="text-xs line-through text-neutral-400">
                                    {p.price.toLocaleString("ru-RU")} ₽
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show all results link */}
                {hasResults && query.trim().length >= 2 && (
                  <div className="border-t px-3 py-2.5">
                    <button
                      onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      Показать все результаты
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* No results */}
                {noResults && (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                      <Search className="h-6 w-6 text-neutral-300" />
                    </div>
                    <p className="font-medium text-neutral-900">Ничего не найдено</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      По запросу «{query}» нет результатов. Проверьте написание.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
