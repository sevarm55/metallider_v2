import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Public: get all visible reviews
export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return apiSuccess(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    return apiError("Ошибка загрузки отзывов", 500, "INTERNAL_ERROR");
  }
}

// Public: submit a review
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, "api");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { name, text, rating } = body;

    if (!name?.trim() || name.trim().length < 2) {
      return apiError("Введите имя (минимум 2 символа)", 400, "VALIDATION_ERROR");
    }
    if (!text?.trim() || text.trim().length < 5) {
      return apiError("Введите текст (минимум 5 символов)", 400, "VALIDATION_ERROR");
    }
    const safeRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

    const review = await prisma.review.create({
      data: {
        name: name.trim().slice(0, 100),
        text: text.trim().slice(0, 1000),
        rating: safeRating,
        isVisible: true,
      },
    });

    return apiSuccess(review, "Отзыв отправлен!", 201);
  } catch (error) {
    console.error("Create review error:", error);
    return apiError("Ошибка отправки отзыва", 500, "INTERNAL_ERROR");
  }
}
