"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormData } from "@/lib/auth-schemas";
import { registerUser } from "@/lib/services/auth";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      const result = await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      if (result.success) {
        toast.success("Проверьте email для подтверждения регистрации");
        router.push(`/verify?email=${encodeURIComponent(data.email)}`);
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;

        // Set field-level errors
        if (errorData.details) {
          for (const [field, messages] of Object.entries(errorData.details)) {
            if (field in data) {
              setError(field as keyof RegisterFormData, {
                message: messages[0],
              });
            }
          }
        }

        // Show specific error toasts
        if (errorData.code === "EMAIL_EXISTS") {
          setError("email", { message: errorData.error });
        } else if (errorData.code === "PHONE_EXISTS") {
          setError("phone", { message: errorData.error });
        } else {
          toast.error(errorData.error);
        }
        return;
      }
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
        <h1 className="text-2xl font-bold text-foreground">Регистрация</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Создайте аккаунт для отслеживания заказов и персональных скидок
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Имя и фамилия</Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Иван Иванов"
              className="h-12 pl-10"
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

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
              {...register("phone")}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Минимум 6 символов"
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

        {/* Confirm password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Повторите пароль"
              className="h-12 pl-10 pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground">
          Нажимая «Зарегистрироваться», вы соглашаетесь с{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Политикой конфиденциальности
          </Link>
        </p>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full gap-2 bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90"
        >
          {isSubmitting ? (
            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">или</span>
        </div>
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Войти
        </Link>
      </p>
    </div>
  );
}
