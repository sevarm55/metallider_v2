import { type NextRequest } from "next/server";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return apiError("Заполните все поля", 400, "VALIDATION_ERROR");
    }

    if (newPassword.length < 6) {
      return apiError("Минимум 6 символов", 400, "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUnique({ where: { id: adminId } });
    if (!user) {
      return apiError("Пользователь не найден", 404, "NOT_FOUND");
    }

    const valid = await compare(currentPassword, user.password);
    if (!valid) {
      return apiError("Неверный текущий пароль", 400, "INVALID_PASSWORD");
    }

    const hashed = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: adminId },
      data: { password: hashed },
    });

    await logAdminAction({
      userId: adminId,
      action: "CHANGE_PASSWORD",
      entity: "User",
      entityId: adminId,
      request,
    });

    return apiSuccess({ changed: true }, "Пароль изменён");
  } catch (error) {
    console.error("Change password error:", error);
    return apiError("Ошибка смены пароля", 500, "INTERNAL_ERROR");
  }
}
