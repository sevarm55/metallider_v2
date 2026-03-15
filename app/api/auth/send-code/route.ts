import { NextRequest } from "next/server";
import { randomInt } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { formatPhone, sendSms } from "@/lib/sms";
import { getClientIP } from "@/lib/get-client-ip";

// ─── Встроенный rate limiter для send-code ──────────────
// TODO: Заменить in-memory rate limiter на Redis-based (Upstash) для production.
// В serverless окружении (Vercel) Map живёт только в пределах одного инстанса,
// поэтому rate limiting фактически не работает между разными cold starts.
// 3 запроса за 2 минуты
const RATE_LIMIT_INTERVAL = 2 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

const rateLimitCache = new Map<
  string,
  { count: number; expiresAt: number }
>();

function rateLimiter(ip: string): boolean {
  const now = Date.now();
  const key = `send-code:${ip}`;
  const entry = rateLimitCache.get(key);

  // Очистка устаревших записей
  if (rateLimitCache.size > 1000) {
    for (const [k, v] of rateLimitCache) {
      if (v.expiresAt < now) rateLimitCache.delete(k);
    }
  }

  if (!entry || entry.expiresAt < now) {
    rateLimitCache.set(key, { count: 1, expiresAt: now + RATE_LIMIT_INTERVAL });
    return true;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return false;
  }

  return true;
}

// ─── Валидация российского мобильного номера ────────────
function isValidRussianMobile(phone: string): boolean {
  // После нормализации: +7XXXXXXXXXX (12 символов, 11 цифр)
  const cleaned = phone.replace(/[^\d]/g, "");
  return cleaned.length === 11 && cleaned.startsWith("7") && cleaned[1] === "9";
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIP(request);
  if (!rateLimiter(ip)) {
    return apiError(
      "Слишком много запросов. Попробуйте через 2 минуты.",
      429,
      "RATE_LIMIT_EXCEEDED",
    );
  }

  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== "string") {
      return apiError("Укажите номер телефона", 400, "VALIDATION_ERROR");
    }

    // Нормализация телефона
    const formattedPhone = formatPhone(phone.trim());

    // Валидация: российский мобильный
    if (!isValidRussianMobile(formattedPhone)) {
      return apiError(
        "Введите корректный российский мобильный номер",
        400,
        "INVALID_PHONE",
      );
    }

    // Поиск или создание пользователя
    let user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    });

    if (!user) {
      // Генерируем уникальный email-заглушку (email обязателен и уникален в схеме)
      const phoneEmail = `phone_${formattedPhone.replace("+", "")}@phone.local`;

      user = await prisma.user.create({
        data: {
          fullName: "",
          email: phoneEmail,
          phone: formattedPhone,
          password: await hash(crypto.randomUUID(), 10),
          verified: new Date(),
          role: "USER",
        },
      });
    }

    // Удаляем старые коды верификации для этого пользователя
    await prisma.verificationCode.deleteMany({
      where: { userId: user.id },
    });

    // Генерация 4-значного кода (1000-9999) — криптографически безопасно
    const code = randomInt(1000, 10000);

    // Сохраняем код в БД
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code: String(code),
      },
    });

    // Отправка SMS
    const smsMessage = `МеталлЛидер: ${code} — ваш код для входа`;
    const sent = await sendSms(formattedPhone, smsMessage);
    if (!sent) {
      return apiError("Не удалось отправить SMS. Попробуйте позже.", 500, "SMS_SEND_FAILED");
    }

    return apiSuccess(null, "Код отправлен");
  } catch (error) {
    console.error("Send code error:", error);
    return apiError("Внутренняя ошибка сервера", 500, "INTERNAL_ERROR");
  }
}
