import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

export const dynamic = "force-dynamic";

// GET /api/mobile/blog — список статей
// GET /api/mobile/blog?slug=xxx — одна статья
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const slug = request.nextUrl.searchParams.get("slug");

  try {
    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug, isActive: true },
      });

      if (!article) return apiError("Статья не найдена", 404, "NOT_FOUND");

      // Get related articles
      const related = await prisma.article.findMany({
        where: { isActive: true, id: { not: article.id } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          createdAt: true,
        },
      });

      return apiSuccess({ article, related });
    }

    // List all active articles
    const articles = await prisma.article.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        createdAt: true,
      },
    });

    return apiSuccess(articles);
  } catch (error) {
    console.error("Mobile blog error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
