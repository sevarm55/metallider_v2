import { NextRequest } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email?.trim() || !code?.trim() || !newPassword?.trim()) {
      return apiError("Все поля обязательны", 400, "VALIDATION_ERROR");
    }

    if (newPassword.length < 6) {
      return apiError("Пароль минимум 6 символов", 400, "VALIDATION_ERROR");
    }

    if (!/^\d{6}$/.test(code)) {
      return apiError("Код должен содержать 6 цифр", 400, "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return apiError("Неверный код", 400, "INVALID_CODE");
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: { userId: user.id, code },
    });

    if (!verificationCode) {
      return apiError("Неверный код", 400, "INVALID_CODE");
    }

    const codeAge = Date.now() - verificationCode.createdAt.getTime();
    if (codeAge > CODE_TTL_MS) {
      await prisma.verificationCode.delete({ where: { id: verificationCode.id } });
      return apiError("Код истёк. Запросите новый.", 400, "CODE_EXPIRED");
    }

    const hashedPassword = hashSync(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      }),
    ]);

    return apiSuccess(null, "Пароль успешно изменён");
  } catch (error) {
    console.error("Reset password error:", error);
    return apiError("Внутренняя ошибка", 500, "INTERNAL_ERROR");
  }
}
