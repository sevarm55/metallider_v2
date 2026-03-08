import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const action = searchParams.get("action") || "";

    const where = action ? { action } : {};

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.adminLog.count({ where }),
    ]);

    return apiSuccess({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get logs error:", error);
    return apiError("Ошибка получения логов", 500, "INTERNAL_ERROR");
  }
}
