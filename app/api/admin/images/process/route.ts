import { type NextRequest } from "next/server";
import { removeBackground, generateProductImage, generateCategoryImage, downloadAndSave } from "@/lib/fal";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { apiSuccess, apiError } from "@/lib/types/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { imageUrl, action, productName, categoryName, attributes, withDimensions } = await request.json();

    if (action === "generate") {
      if (!productName || typeof productName !== "string") {
        return apiError("Укажите название товара", 400, "VALIDATION_ERROR");
      }
      const falUrl = await generateProductImage(productName, categoryName, attributes, withDimensions);
      const resultUrl = await downloadAndSave(falUrl, "generated");
      return apiSuccess({ url: resultUrl });
    }

    if (action === "generate-category") {
      if (!categoryName || typeof categoryName !== "string") {
        return apiError("Укажите название категории", 400, "VALIDATION_ERROR");
      }
      const falUrl = await generateCategoryImage(categoryName);
      const resultUrl = await downloadAndSave(falUrl, "category");
      return apiSuccess({ url: resultUrl });
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return apiError("Укажите URL изображения", 400, "VALIDATION_ERROR");
    }

    if (action !== "remove-bg") {
      return apiError(
        "Укажите действие: remove-bg, generate или generate-category",
        400,
        "VALIDATION_ERROR",
      );
    }

    const falUrl = await removeBackground(imageUrl);
    const resultUrl = await downloadAndSave(falUrl, "nobg");

    return apiSuccess({ url: resultUrl });
  } catch (error) {
    console.error("Image processing error:", error);
    return apiError(
      error instanceof Error ? error.message : "Ошибка обработки изображения",
      500,
      "PROCESS_ERROR",
    );
  }
}
