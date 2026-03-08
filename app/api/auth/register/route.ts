import { NextRequest } from "next/server";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma-client";
import { serverRegisterSchema } from "@/lib/auth-schemas";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkRequestSize } from "@/lib/request-size-limit";

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, "register");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeResponse = checkRequestSize(request);
  if (sizeResponse) return sizeResponse;

  try {
    const body = await request.json();
    const parsed = serverRegisterSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        if (!details[field]) details[field] = [];
        details[field].push(issue.message);
      }
      return apiError("Ошибка валидации", 400, "VALIDATION_ERROR", details);
    }

    const { fullName, email, phone, password } = parsed.data;

    // Check email uniqueness
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      if (existingByEmail.verified) {
        return apiError(
          "Пользователь с таким email уже зарегистрирован",
          409,
          "EMAIL_EXISTS",
        );
      }
      // Not verified — allow re-registration: delete old user
      await prisma.user.delete({ where: { id: existingByEmail.id } });
    }

    // Check phone uniqueness
    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingByPhone) {
      return apiError(
        "Пользователь с таким телефоном уже зарегистрирован",
        409,
        "PHONE_EXISTS",
      );
    }

    const hashedPassword = hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
      },
    });

    // TODO: Send email with verification code
    console.log(`[DEV] Verification code for ${email}: ${code}`);

    return apiSuccess({ userId: user.id }, "Регистрация прошла успешно. Проверьте email.", 201);
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Внутренняя ошибка сервера", 500, "INTERNAL_ERROR");
  }
}
