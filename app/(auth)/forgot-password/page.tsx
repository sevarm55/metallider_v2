"use client";

import { useState } from "react";
import { KeyRound, ArrowLeft, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { forgotPassword, resetPassword } from "@/lib/services/auth";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/lib/types/api-response";

type Step = "email" | "code";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Введите email");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      toast.success("Код отправлен на вашу почту");
      setStep("code");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Произошла ошибка");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset() {
    if (code.length !== 6) return;
    if (!newPassword.trim()) {
      toast.error("Введите новый пароль");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Пароль минимум 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword(email, code, newPassword);
      if (result.success) {
        toast.success("Пароль изменён! Войдите с новым паролем.");
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        toast.error(errorData.error);
        if (errorData.code === "INVALID_CODE" || errorData.code === "CODE_EXPIRED") {
          setCode("");
        }
      } else {
        toast.error("Произошла ошибка");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Mobile logo */}
      <Link href="/" className="mb-8 block lg:hidden">
        <span className="text-2xl font-black">МЕТАЛ</span>
        <span className="text-2xl font-black text-primary">ЛИДЕР</span>
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {step === "email" ? "Восстановление пароля" : "Новый пароль"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "email"
            ? "Введите email, на который зарегистрирован аккаунт"
            : (
              <>
                Код отправлен на{" "}
                <span className="font-medium text-foreground">{email}</span>
              </>
            )}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isSubmitting ? "Отправляем..." : "Получить код"}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Вернуться к входу
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* OTP input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Код из письма
            </label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-14 w-12 text-lg" />
                  <InputOTPSlot index={1} className="h-14 w-12 text-lg" />
                  <InputOTPSlot index={2} className="h-14 w-12 text-lg" />
                  <InputOTPSlot index={3} className="h-14 w-12 text-lg" />
                  <InputOTPSlot index={4} className="h-14 w-12 text-lg" />
                  <InputOTPSlot index={5} className="h-14 w-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Новый пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-10 text-sm outline-none transition-colors focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Подтвердите пароль
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={code.length !== 6 || !newPassword || !confirmPassword || isSubmitting}
            className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isSubmitting ? "Сохраняем..." : "Сменить пароль"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Код действителен 15 минут
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setStep("email"); setCode(""); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Отправить код повторно
            </button>
            <span className="text-muted-foreground/30">|</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              К входу
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
