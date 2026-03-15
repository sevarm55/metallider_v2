// Previous email-based login page moved to /login/email/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Phone, ArrowLeft, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/services/instance";

const AUTH_ERRORS: Record<string, string> = {
  INVALID_CODE: "Неверный код",
  CODE_EXPIRED: "Код истёк",
  ACCOUNT_DISABLED: "Аккаунт заблокирован",
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) {
    return "+7" + digits.slice(1);
  }
  if (digits.startsWith("7") && digits.length === 11) {
    return "+7" + digits.slice(1);
  }
  if (digits.length === 10) {
    return "+7" + digits;
  }
  if (digits.startsWith("7") && digits.length > 11) {
    return "+" + digits;
  }
  return "+" + digits;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    const d = digits.slice(1);
    return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  }
  return phone;
}

export default function PhoneLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  async function handleSendCode() {
    const normalized = normalizePhone(phone);
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 11) {
      toast.error("Введите корректный номер телефона");
      return;
    }

    setIsSending(true);
    try {
      await axiosInstance.post("/auth/send-code", { phone: normalized });
      setStep(2);
      setCountdown(60);
      setCode(["", "", "", ""]);
      toast.success("Код отправлен");
    } catch {
      toast.error("Не удалось отправить код. Попробуйте позже.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleResendCode() {
    const normalized = normalizePhone(phone);
    setIsSending(true);
    try {
      await axiosInstance.post("/auth/send-code", { phone: normalized });
      setCountdown(60);
      setCode(["", "", "", ""]);
      toast.success("Код отправлен повторно");
    } catch {
      toast.error("Не удалось отправить код. Попробуйте позже.");
    } finally {
      setIsSending(false);
    }
  }

  const handleVerifyCode = useCallback(
    async (codeValue: string[]) => {
      const fullCode = codeValue.join("");
      if (fullCode.length !== 4) return;

      const normalized = normalizePhone(phone);
      setIsVerifying(true);
      try {
        const result = await signIn("phone-credentials", {
          phone: normalized,
          code: fullCode,
          redirect: false,
        });

        if (result?.error) {
          const message = AUTH_ERRORS[result.error] || "Ошибка авторизации";
          toast.error(message);
          setCode(["", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        toast.success("Вы успешно вошли!");
        router.push("/");
        router.refresh();
      } catch {
        toast.error("Произошла ошибка. Попробуйте позже.");
      } finally {
        setIsVerifying(false);
      }
    },
    [phone, router]
  );

  function handleCodeInput(index: number, value: string) {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 3 && newCode.every((d) => d !== "")) {
      handleVerifyCode(newCode);
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 0) return;
    const newCode = [...code];
    for (let i = 0; i < 4; i++) {
      newCode[i] = pasted[i] || "";
    }
    setCode(newCode);
    const focusIndex = Math.min(pasted.length, 3);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === 4) {
      handleVerifyCode(newCode);
    }
  }

  return (
    <div>
      {/* Mobile logo */}
      <Link href="/" className="mb-8 block lg:hidden">
        <span className="text-2xl font-black">МЕТАЛ</span>
        <span className="text-2xl font-black text-primary">ЛИДЕР</span>
      </Link>

      {step === 1 && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Вход</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Введите номер телефона для входа или регистрации
            </p>
          </div>

          <div className="space-y-5">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="h-12 pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendCode();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="button"
              disabled={isSending}
              onClick={handleSendCode}
              className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isSending ? "Отправка..." : "Получить код"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">или</span>
            </div>
          </div>

          {/* Email login link */}
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login/email"
              className="font-semibold text-primary hover:underline"
            >
              Войти по email
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-8">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode(["", "", "", ""]);
              }}
              className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Изменить номер
            </button>
            <h1 className="text-2xl font-bold text-foreground">Введите код</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Отправили SMS на{" "}
              <span className="font-medium text-foreground">
                {formatPhone(normalizePhone(phone))}
              </span>
            </p>
          </div>

          {/* Code inputs */}
          <div className="space-y-5">
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={index === 0 ? handleCodePaste : undefined}
                  autoFocus={index === 0}
                  disabled={isVerifying}
                  className="w-14 h-14 text-center text-2xl font-bold border rounded-xl bg-background text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Submit button */}
            <Button
              type="button"
              disabled={isVerifying || code.some((d) => !d)}
              onClick={() => handleVerifyCode(code)}
              className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isVerifying ? "Проверка..." : "Подтвердить"}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Отправить повторно через{" "}
                  <span className="font-medium">{formatCountdown(countdown)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isSending}
                  className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {isSending ? "Отправка..." : "Отправить повторно"}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
