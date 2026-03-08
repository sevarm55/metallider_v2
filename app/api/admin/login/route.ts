import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma-client";
import { loginSchema } from "@/lib/auth-schemas";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkRequestSize } from "@/lib/request-size-limit";
import { logAdminAction } from "@/lib/admin-logger";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, "login");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeResponse = checkRequestSize(request);
  if (sizeResponse) return sizeResponse;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Некорректные данные" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role === "USER") {
      return NextResponse.json(
        { success: false, error: "Доступ запрещён", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Неверный пароль", code: "INVALID_CREDENTIALS" },
        { status: 401 },
      );
    }

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(getSecretKey());

    const response = NextResponse.json(
      { success: true, data: { message: "Вход выполнен" } },
      { status: 200 },
    );

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
    });

    await logAdminAction({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      request,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
