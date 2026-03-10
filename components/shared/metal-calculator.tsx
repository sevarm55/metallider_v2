"use client";

import { useState, useMemo } from "react";
import { Weight, Ruler, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type ShapeType = "profile" | "round" | "sheet" | "rebar";

interface ShapeConfig {
  label: string;
  shortLabel: string;
  fields: { key: string; label: string; unit: string; placeholder: string }[];
  calc: (values: Record<string, number>) => number;
  resultUnit: string;
}

const STEEL_DENSITY = 7850; // kg/m³

const shapes: Record<ShapeType, ShapeConfig> = {
  profile: {
    label: "Труба профильная",
    shortLabel: "Профильная",
    fields: [
      { key: "a", label: "Сторона A", unit: "мм", placeholder: "40" },
      { key: "b", label: "Сторона B", unit: "мм", placeholder: "20" },
      { key: "t", label: "Стенка", unit: "мм", placeholder: "2" },
      { key: "l", label: "Длина", unit: "м", placeholder: "6" },
    ],
    calc: (v) => {
      const a = v.a / 1000;
      const b = v.b / 1000;
      const t = v.t / 1000;
      const perimeter = 2 * (a + b) - 4 * t;
      return perimeter * t * STEEL_DENSITY * v.l;
    },
    resultUnit: "кг",
  },
  round: {
    label: "Труба круглая",
    shortLabel: "Круглая",
    fields: [
      { key: "d", label: "Диаметр", unit: "мм", placeholder: "57" },
      { key: "t", label: "Стенка", unit: "мм", placeholder: "3" },
      { key: "l", label: "Длина", unit: "м", placeholder: "6" },
    ],
    calc: (v) => {
      const d = v.d / 1000;
      const t = v.t / 1000;
      return Math.PI * (d - t) * t * STEEL_DENSITY * v.l;
    },
    resultUnit: "кг",
  },
  sheet: {
    label: "Лист стальной",
    shortLabel: "Лист",
    fields: [
      { key: "w", label: "Ширина", unit: "мм", placeholder: "1250" },
      { key: "h", label: "Длина", unit: "мм", placeholder: "2500" },
      { key: "t", label: "Толщина", unit: "мм", placeholder: "2" },
    ],
    calc: (v) => {
      return (v.w / 1000) * (v.h / 1000) * (v.t / 1000) * STEEL_DENSITY;
    },
    resultUnit: "кг",
  },
  rebar: {
    label: "Арматура",
    shortLabel: "Арматура",
    fields: [
      { key: "d", label: "Диаметр", unit: "мм", placeholder: "12" },
      { key: "l", label: "Длина", unit: "м", placeholder: "11.7" },
    ],
    calc: (v) => {
      const d = v.d / 1000;
      return Math.PI * (d / 2) ** 2 * STEEL_DENSITY * v.l;
    },
    resultUnit: "кг",
  },
};

// SVG shape illustrations
function ShapeIllustration({ type, isActive }: { type: ShapeType; isActive: boolean }) {
  const color = isActive ? "#ffffff" : "#a3a3a3";
  const opacity = isActive ? 1 : 0.5;

  switch (type) {
    case "profile":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" style={{ opacity }}>
          <rect x="8" y="10" width="32" height="28" rx="2" fill="none" stroke={color} strokeWidth="3" />
          <rect x="14" y="16" width="20" height="16" rx="1" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );
    case "round":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" style={{ opacity }}>
          <circle cx="24" cy="24" r="17" fill="none" stroke={color} strokeWidth="3" />
          <circle cx="24" cy="24" r="11" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );
    case "sheet":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" style={{ opacity }}>
          <path d="M6 14 L24 6 L42 14 L42 34 L24 42 L6 34 Z" fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M6 14 L24 22 L42 14" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="24" y1="22" x2="24" y2="42" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "rebar":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" style={{ opacity }}>
          <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth="3" />
          <line x1="14" y1="14" x2="34" y2="34" stroke={color} strokeWidth="1.5" />
          <line x1="34" y1="14" x2="14" y2="34" stroke={color} strokeWidth="1.5" />
        </svg>
      );
  }
}

export function MetalCalculator() {
  const [activeShape, setActiveShape] = useState<ShapeType>("profile");
  const [values, setValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState("1");

  const shape = shapes[activeShape];

  const result = useMemo(() => {
    const nums: Record<string, number> = {};
    for (const f of shape.fields) {
      const v = parseFloat(values[f.key] || "");
      if (isNaN(v) || v <= 0) return null;
      nums[f.key] = v;
    }
    const qty = parseInt(quantity) || 1;
    const weight = shape.calc(nums) * qty;
    return { weight: Math.round(weight * 100) / 100, qty };
  }, [values, quantity, shape]);

  const handleShapeChange = (s: ShapeType) => {
    setActiveShape(s);
    setValues({});
    setQuantity("1");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-800">
      {/* Background decorative */}
      <span className="pointer-events-none absolute -right-8 -top-8 select-none text-[12rem] font-black leading-none text-white/2 font-(family-name:--font-unbounded)">
        КГ
      </span>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--color-primary),0.08),transparent_60%)]" />

      <div className="relative grid lg:grid-cols-12">
        {/* Left — shape tabs + illustration */}
        <div className="lg:col-span-4 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
          {/* Shape tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {(Object.entries(shapes) as [ShapeType, ShapeConfig][]).map(([key, s]) => (
              <button
                key={key}
                onClick={() => handleShapeChange(key)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300 cursor-pointer",
                  activeShape === key
                    ? "bg-white/10 ring-1 ring-primary/40 shadow-[0_0_20px_rgba(var(--color-primary),0.15)]"
                    : "bg-white/5 hover:bg-white/8",
                )}
              >
                <ShapeIllustration type={key} isActive={activeShape === key} />
                <span className={cn(
                  "text-xs font-semibold transition-colors",
                  activeShape === key ? "text-white" : "text-neutral-500",
                )}>
                  {s.shortLabel}
                </span>
                {activeShape === key && (
                  <div className="absolute -bottom-px left-1/4 right-1/4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Shape info */}
          <div className="hidden lg:block">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Формула
                </span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                Плотность стали: {STEEL_DENSITY.toLocaleString("ru-RU")} кг/м³.
                Расчёт по ГОСТ для {shape.label.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>

        {/* Right — form + result */}
        <div className="lg:col-span-8 p-6 lg:p-8">
          {/* Active shape title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <ShapeIllustration type={activeShape} isActive />
            </div>
            <h3 className="text-lg font-bold text-white font-(family-name:--font-unbounded)">
              {shape.label}
            </h3>
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {shape.fields.map((f) => (
              <div key={f.key} className="group">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={f.placeholder}
                    value={values[f.key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-base font-semibold text-white placeholder:text-neutral-600 outline-none focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                Кол-во
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-base font-semibold text-white placeholder:text-neutral-600 outline-none focus:border-primary/50 focus:bg-white/8 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                  шт
                </span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
            result
              ? "bg-linear-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20"
              : "bg-white/5 border border-white/10",
          )}>
            {result ? (
              <>
                {/* Glow effect */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                      <Weight className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                        Общий вес
                      </p>
                      <p className="text-3xl font-black text-white font-(family-name:--font-unbounded)">
                        {result.weight.toLocaleString("ru-RU")}
                        <span className="ml-1.5 text-base font-bold text-neutral-400">{shape.resultUnit}</span>
                      </p>
                    </div>
                  </div>
                  {result.qty > 1 && (
                    <div className="rounded-xl bg-white/10 backdrop-blur px-4 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-0.5">За 1 штуку</p>
                      <p className="text-lg font-bold text-white">
                        {(result.weight / result.qty).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}
                        <span className="ml-1 text-xs text-neutral-400">{shape.resultUnit}</span>
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Ruler className="h-5 w-5 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-500">
                  Заполните все размеры для расчёта веса
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
