import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { getUserSession } from "@/lib/get-user-session";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getUserSession();

    if (!session) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError("Пользователь не найден", 404, "USER_NOT_FOUND");
    }

    return apiSuccess(user);
  } catch (error) {
    console.error("Get me error:", error);
    return apiError("Внутренняя ошибка сервера", 500, "INTERNAL_ERROR");
  }
}

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Минимум 2 символа"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{10,}$/, "Некорректный номер телефона")
    .optional()
    .or(z.literal("")),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || "Ошибка валидации",
        400,
        "VALIDATION_ERROR",
      );
    }

    const { fullName, phone } = parsed.data;

    // Check phone uniqueness if provided
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: session.id } },
        select: { id: true },
      });
      if (existing) {
        return apiError("Этот номер телефона уже используется", 400, "PHONE_EXISTS");
      }
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        fullName,
        phone: phone || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return apiSuccess(user, "Профиль обновлён");
  } catch (error) {
    console.error("Update profile error:", error);
    return apiError("Ошибка обновления профиля", 500, "INTERNAL_ERROR");
  }
}

const changePasswordServerSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(6, "Минимум 6 символов"),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const parsed = changePasswordServerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || "Ошибка валидации",
        400,
        "VALIDATION_ERROR",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password: true },
    });

    if (!user) {
      return apiError("Пользователь не найден", 404, "USER_NOT_FOUND");
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) {
      return apiError("Неверный текущий пароль", 400, "WRONG_PASSWORD");
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashed },
    });

    return apiSuccess(undefined, "Пароль изменён");
  } catch (error) {
    console.error("Change password error:", error);
    return apiError("Ошибка смены пароля", 500, "INTERNAL_ERROR");
  }
}
