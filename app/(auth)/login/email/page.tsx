"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/auth-schemas";

const AUTH_ERRORS: Record<string, string> = {
  INVALID_CREDENTIALS: "Неверный email или пароль",
  NOT_VERIFIED: "Подтвердите email перед входом",
  ACCOUNT_DISABLED: "Аккаунт заблокирован",
  MISSING_FIELDS: "Заполните все поля",
};

export default function EmailLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        const message =
          AUTH_ERRORS[result.error] || "Ошибка авторизации";
        toast.error(message);
        return;
      }

      toast.success("Вы успешно вошли!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Произошла ошибка. Попробуйте позже.");
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
        <h1 className="text-2xl font-bold text-foreground">Вход в аккаунт</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Введите свои данные для входа в личный кабинет
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="h-12 pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Введите пароль"
              className="h-12 pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
        >
          {isSubmitting ? (
            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isSubmitting ? "Входим..." : "Войти"}
        </Button>
      </form>

      {/* Register link */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <Link
          href="/register/email"
          className="font-semibold text-primary hover:underline"
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
