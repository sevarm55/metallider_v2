import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { verifyCodeSchema } from "@/lib/auth-schemas";
import { apiSuccess, apiError } from "@/lib/types/api-response";

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Некорректный код", 400, "VALIDATION_ERROR");
    }

    const { code } = parsed.data;

    const verificationCode = await prisma.verificationCode.findFirst({
      where: { code },
      include: { user: true },
    });

    if (!verificationCode) {
      return apiError("Неверный код подтверждения", 400, "INVALID_CODE");
    }

    // Check TTL
    const codeAge = Date.now() - verificationCode.createdAt.getTime();
    if (codeAge > CODE_TTL_MS) {
      await prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      });
      return apiError(
        "Код подтверждения истёк. Зарегистрируйтесь повторно.",
        400,
        "CODE_EXPIRED",
      );
    }

    // Verify user and delete code
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationCode.userId },
        data: { verified: new Date() },
      }),
      prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      }),
    ]);

    return apiSuccess(undefined, "Email подтверждён");
  } catch (error) {
    console.error("Verification error:", error);
    return apiError("Внутренняя ошибка сервера", 500, "INTERNAL_ERROR");
  }
}
