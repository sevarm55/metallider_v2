"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  size?: "sm" | "default";
  className?: string;
}

export function QuantitySelector({
  min = 1,
  max = 999,
  defaultValue = 1,
  value: controlledValue,
  onChange,
  size = "default",
  className,
}: QuantitySelectorProps) {
  const [internalQty, setInternalQty] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const qty = isControlled ? controlledValue : internalQty;

  const setQty = (next: number) => {
    if (!isControlled) setInternalQty(next);
    onChange?.(next);
  };

  const decrement = () => setQty(Math.max(min, qty - 1));
  const increment = () => setQty(Math.min(max, qty + 1));

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
      <span
        className={cn(
          "flex-1 text-center font-medium select-none",
          isSmall ? "min-w-[2rem] text-sm" : "min-w-[2.5rem] text-sm"
        )}
      >
        {qty}
      </span>
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
