"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/auth-schemas";
import { axiosInstance } from "@/lib/services/instance";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";

export default function AdminLoginPage() {
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
      await axiosInstance.post("/admin/login", data);
      toast.success("Добро пожаловать!");
      router.push("/admin/dashboard");
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        toast.error(errorData.error);
      } else {
        toast.error("Произошла ошибка");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1A23] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-(family-name:--font-archivo-black) text-2xl tracking-widest text-white">
            МЕТАЛЛЛИДЕР
          </h1>
          <p className="mt-2 text-sm text-white/50">Панель управления</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                id="email"
                type="email"
                placeholder="admin@metallider.ru"
                className="h-12 border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70">
              Пароль
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                className="h-12 border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/30"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full bg-primary text-base font-semibold hover:bg-primary/90"
          >
            {isSubmitting ? "Входим..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
