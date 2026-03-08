import { type NextRequest } from "next/server";
import { fetchImagesByCode } from "@/lib/moysklad";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { apiSuccess, apiError } from "@/lib/types/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { code } = await request.json();
    if (!code || typeof code !== "string" || !code.trim()) {
      return apiError("Укажите артикул (код)", 400, "VALIDATION_ERROR");
    }

    const result = await fetchImagesByCode(code.trim());

    if (!result.found) {
      return apiError("Товар не найден в МойСклад", 404, "NOT_FOUND");
    }

    if (result.images.length === 0) {
      return apiError("У товара нет фото в МойСклад", 404, "NO_IMAGES");
    }

    return apiSuccess({ images: result.images });
  } catch (error) {
    console.error("MoySklad images error:", error);
    return apiError(
      error instanceof Error ? error.message : "Ошибка загрузки фото",
      500,
      "FETCH_ERROR",
    );
  }
}
