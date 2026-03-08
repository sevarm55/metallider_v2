"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyCode } from "@/lib/services/auth";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/lib/types/api-response";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify() {
    if (code.length !== 6) return;

    setIsSubmitting(true);
    try {
      const result = await verifyCode(code);

      if (result.success) {
        toast.success("Email подтверждён! Теперь войдите в аккаунт.");
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        toast.error(errorData.error);
      } else {
        toast.error("Произошла ошибка. Попробуйте позже.");
      }
      setCode("");
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
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Подтверждение email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Мы отправили 6-значный код на{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "вашу почту"
          )}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={handleVerify}
          >
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

        <Button
          onClick={handleVerify}
          disabled={code.length !== 6 || isSubmitting}
          className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {isSubmitting ? (
            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {isSubmitting ? "Проверяем..." : "Подтвердить"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Код действителен 15 минут
        </p>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Вернуться к регистрации
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
