"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  User,
  Package,
  Lock,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Clock,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { axiosInstance } from "@/lib/services/instance";
import type { ApiErrorResponse } from "@/lib/types/api-response";
import { AxiosError } from "axios";

// ─── Schemas ────────────────────────────────────────

const profileSchema = z.object({
  fullName: z.string().min(2, "Минимум 2 символа"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{10,}$/, "Некорректный номер")
    .or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

// ─── Types ──────────────────────────────────────────

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

interface OrderItem {
  id: string;
  qty: number;
  price: number;
  total: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW: { label: "Новый", color: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Подтверждён", color: "bg-sky-100 text-sky-700" },
  PROCESSING: { label: "В обработке", color: "bg-amber-100 text-amber-700" },
  SHIPPED: { label: "Отправлен", color: "bg-violet-100 text-violet-700" },
  DELIVERED: { label: "Доставлен", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Отменён", color: "bg-red-100 text-red-700" },
};

// ─── Component ──────────────────────────────────────

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load profile
  useEffect(() => {
    if (status !== "authenticated") return;

    axiosInstance
      .get("/auth/me")
      .then((res) => {
        if (res.data.success) {
          const u = res.data.data;
          setProfile(u);
          profileForm.reset({ fullName: u.fullName, phone: u.phone || "" });
        }
      })
      .catch(() => toast.error("Ошибка загрузки профиля"))
      .finally(() => setLoading(false));
  }, [status, profileForm]);

  // Load orders
  useEffect(() => {
    if (status !== "authenticated") return;

    axiosInstance
      .get("/auth/orders")
      .then((res) => {
        if (res.data.success) setOrders(res.data.data);
      })
      .catch(() => toast.error("Ошибка загрузки заказов"))
      .finally(() => setOrdersLoading(false));
  }, [status]);

  async function onProfileSubmit(data: ProfileData) {
    try {
      const res = await axiosInstance.put("/auth/me", data);
      if (res.data.success) {
        setProfile(res.data.data);
        toast.success("Профиль обновлён");
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка обновления профиля");
      }
    }
  }

  async function onPasswordSubmit(data: PasswordData) {
    try {
      const res = await axiosInstance.patch("/auth/me", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.data.success) {
        toast.success("Пароль изменён");
        passwordForm.reset();
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        toast.error((err.response.data as ApiErrorResponse).error);
      } else {
        toast.error("Ошибка смены пароля");
      }
    }
  }

  if (status === "loading" || loading) {
    return (
      <Container className="py-20">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Container>
    );
  }

  if (!profile) return null;

  return (
    <Container className="py-6 lg:py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Главная</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Личный кабинет</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold lg:text-3xl">Личный кабинет</h1>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Заказы
            {orders.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-[10px]">
                {orders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        {/* ─── Profile Tab ──────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Имя</Label>
                  <Input
                    id="fullName"
                    placeholder="Иван Иванов"
                    {...profileForm.register("fullName")}
                  />
                  {profileForm.formState.errors.fullName && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Email нельзя изменить
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    placeholder="+7 (999) 123-45-67"
                    {...profileForm.register("phone")}
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Зарегистрирован:{" "}
                  {new Date(profile.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                  className="gap-2"
                >
                  {profileForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Сохранить
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Orders Tab ───────────────────────────── */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <p className="text-lg font-medium">Заказов пока нет</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Ваши заказы появятся здесь после оформления
                </p>
                <Button asChild>
                  <Link href="/catalog">Перейти в каталог</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const st = statusLabels[order.status] || {
                  label: order.status,
                  color: "bg-neutral-100 text-neutral-700",
                };
                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      {/* Order header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">
                            Заказ #{order.orderNumber}
                          </span>
                          <Badge className={st.color}>{st.label}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      {/* Order items */}
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-neutral-50">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-5 w-5 text-neutral-200" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/product/${item.productSlug}`}
                                className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                              >
                                {item.productName}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {item.qty} x{" "}
                                {item.price.toLocaleString("ru-RU")} ₽
                              </p>
                            </div>
                            <span className="text-sm font-semibold shrink-0">
                              {item.total.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Итого
                        </span>
                        <span className="text-lg font-bold">
                          {order.totalAmount.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Security Tab ─────────────────────────── */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Смена пароля</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPw ? "text" : "password"}
                      {...passwordForm.register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPw ? "text" : "password"}
                      {...passwordForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="gap-2"
                >
                  {passwordForm.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Изменить пароль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
