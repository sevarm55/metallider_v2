import { type NextRequest } from "next/server";
import { syncAllPrices } from "@/lib/moysklad";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";
import { apiSuccess, apiError } from "@/lib/types/api-response";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    if (!process.env.MOYSKLAD_TOKEN) {
      return apiError("MOYSKLAD_TOKEN не настроен", 500, "CONFIG_ERROR");
    }

    const result = await syncAllPrices();

    await logAdminAction({
      userId,
      action: "SYNC_MOYSKLAD",
      entity: "products",
      data: {
        total: String(result.total),
        updated: String(result.updated),
        notFound: String(result.notFound),
        errors: String(result.errors),
      },
      request,
    });

    return apiSuccess(result);
  } catch (error) {
    console.error("MoySklad sync error:", error);
    return apiError(
      error instanceof Error ? error.message : "Ошибка синхронизации",
      500,
      "SYNC_ERROR",
    );
  }
}
