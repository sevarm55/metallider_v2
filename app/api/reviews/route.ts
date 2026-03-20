import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const REVIEW_COOKIE = "review_submitted";

// Public: get all visible reviews
export async function GET(request: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const hasSubmitted = request.cookies.get(REVIEW_COOKIE)?.value === "1";

    return NextResponse.json({ success: true, data: reviews, hasSubmitted });
  } catch (error) {
    console.error("Get reviews error:", error);
    return apiError("Ошибка загрузки отзывов", 500, "INTERNAL_ERROR");
  }
}

// Public: submit a review (one per device)
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, "api");
  if (rateLimitResponse) return rateLimitResponse;

  // Check cookie
  if (request.cookies.get(REVIEW_COOKIE)?.value === "1") {
    return apiError("Вы уже оставили отзыв", 400, "ALREADY_SUBMITTED");
  }

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

    // Set cookie for 1 year
    const response = NextResponse.json({
      success: true,
      data: review,
      message: "Отзыв отправлен!",
    }, { status: 201 });

    response.cookies.set(REVIEW_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Create review error:", error);
    return apiError("Ошибка отправки отзыва", 500, "INTERNAL_ERROR");
  }
}
