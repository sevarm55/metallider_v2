"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "./input";
import { axiosInstance } from "@/lib/services/instance";

export interface MoyskladItem {
  name: string;
  code: string;
  article: string;
  price: number;
  weight: number;
}

interface CodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: MoyskladItem) => void;
  placeholder?: string;
  id?: string;
}

export function CodeAutocomplete({ value, onChange, onSelect, placeholder, id }: CodeAutocompleteProps) {
  const [results, setResults] = useState<MoyskladItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only search when user is actually typing
    if (!typing || !value || value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/admin/moysklad/search?q=${encodeURIComponent(value)}`);
        if (res.data.success) {
          setResults(res.data.data);
          setOpen(res.data.data.length > 0);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, typing]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(val: string) {
    setTyping(true);
    onChange(val);
  }

  function handleSelect(item: MoyskladItem) {
    const code = item.code || item.article;
    setTyping(false);
    onChange(code);
    setOpen(false);
    setResults([]);
    onSelect?.(item);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || "Артикул"}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-xl bg-white border border-neutral-200 shadow-xl">
          {results.map((item, i) => (
            <button
              key={`${item.code || item.article}-${i}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-50 last:border-0"
            >
              <span className="shrink-0 font-mono text-sm font-bold text-primary min-w-[60px]">
                {item.code || item.article || "—"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-800 truncate">{item.name}</p>
                {item.price > 0 && (
                  <p className="text-xs text-neutral-400">{item.price.toLocaleString("ru-RU")} ₽</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
