import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { sendEmail, buildPasswordResetEmail } from "@/lib/send-email";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, "forgot-password");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return apiError("Введите email", 400, "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.verified) {
      return apiSuccess(null, "Если аккаунт существует, код отправлен на email");
    }

    // Delete old code if exists
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id },
    });

    // Generate 6-digit code (cryptographically secure)
    const { randomInt } = await import("crypto");
    const code = randomInt(100000, 1000000).toString();

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
      },
    });

    try {
      const { subject, html } = buildPasswordResetEmail(code);
      await sendEmail({ to: email, subject, html });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
    }

    return apiSuccess(null, "Если аккаунт существует, код отправлен на email");
  } catch (error) {
    console.error("Forgot password error:", error);
    return apiError("Внутренняя ошибка", 500, "INTERNAL_ERROR");
  }
}
