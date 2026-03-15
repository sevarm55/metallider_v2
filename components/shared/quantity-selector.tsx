"use client";

import { useState, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "default";
  unit?: string;
  className?: string;
}

export function QuantitySelector({
  min = 1,
  max = 999,
  step = 1,
  defaultValue = 1,
  value: controlledValue,
  onChange,
  size = "default",
  unit,
  className,
}: QuantitySelectorProps) {
  const [internalQty, setInternalQty] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const qty = isControlled ? controlledValue : internalQty;

  const isDecimal = step < 1;

  // Display value — allows empty string while typing
  const [inputValue, setInputValue] = useState<string>(String(qty));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setQty = (next: number) => {
    // Round to avoid floating-point drift
    const rounded = isDecimal ? Math.round(next * 100) / 100 : Math.round(next);
    const clamped = Math.max(min, Math.min(max, rounded));
    if (!isControlled) setInternalQty(clamped);
    onChange?.(clamped);
    setInputValue(String(clamped));
  };

  const decrement = () => setQty(qty - step);
  const increment = () => setQty(qty + step);

  // Keep inputValue in sync when controlled value changes externally
  const displayValue = isFocused ? inputValue : String(qty);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty so user can clear and type a new number
    if (raw === "") {
      setInputValue("");
      return;
    }

    // Allow digits and decimal point/comma
    if (!/^\d+([.,]\d*)?$/.test(raw)) return;

    const num = parseFloat(raw.replace(",", "."));

    // Allow typing even if over max — we'll clamp on blur
    setInputValue(raw);

    // Update value immediately if within bounds
    if (!isNaN(num) && num >= min && num <= max) {
      if (!isControlled) setInternalQty(num);
      onChange?.(num);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(String(qty));
    // Select all text on focus for easy replacement
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // If empty or invalid, reset to min
    const num = parseFloat(inputValue.replace(",", "."));
    if (inputValue === "" || isNaN(num) || num < min) {
      setQty(min);
    } else {
      setQty(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between rounded-lg border",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn("shrink-0", isSmall ? "h-9 w-9" : "h-8 w-8")}
        onClick={decrement}
        disabled={qty <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <div className="flex items-center gap-0.5">
        <input
          ref={inputRef}
          type="text"
          inputMode={isDecimal ? "decimal" : "numeric"}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-transparent text-center font-medium outline-none",
            isSmall ? "text-sm" : "text-sm",
            isDecimal ? "w-12" : isSmall ? "w-8" : "w-10"
          )}
        />
        {unit && (
          <span className="text-[10px] text-inherit opacity-50 shrink-0 pr-0.5">
            {unit}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn("shrink-0", isSmall ? "h-9 w-9" : "h-8 w-8")}
        onClick={increment}
        disabled={qty >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
