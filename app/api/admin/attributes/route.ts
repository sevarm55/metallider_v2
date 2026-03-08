import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
        unit: true,
        sortOrder: true,
        isFilter: true,
      },
    });

    return apiSuccess(attributes);
  } catch (error) {
    console.error("Get attributes error:", error);
    return apiError("Ошибка получения атрибутов", 500, "INTERNAL_ERROR");
  }
}
