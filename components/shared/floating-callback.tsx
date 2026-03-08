"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { CallbackModal } from "./callback-modal";

export function FloatingCallback() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        aria-label="Обратный звонок"
      >
        <Phone className="h-6 w-6" />
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </button>
      <CallbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
