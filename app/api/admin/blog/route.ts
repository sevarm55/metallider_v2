import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";
import { slugify } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(articles);
  } catch (error) {
    console.error("Get articles error:", error);
    return apiError("Ошибка получения статей", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const body = await request.json();
    const { title, content, excerpt, image, isActive } = body;

    if (!title?.trim()) return apiError("Заголовок обязателен", 400, "VALIDATION_ERROR");
    if (!content?.trim()) return apiError("Содержание обязательно", 400, "VALIDATION_ERROR");

    const slug = body.slug?.trim() || slugify(title);

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) return apiError("Статья с таким URL уже существует", 400, "DUPLICATE_SLUG");

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content,
        excerpt: excerpt?.trim() || null,
        image: image || null,
        isActive: isActive ?? true,
      },
    });

    await logAdminAction({
      userId: adminUserId,
      action: "CREATE_ARTICLE",
      entity: "Article",
      entityId: article.id,
      data: { title: article.title },
    });

    return apiSuccess(article);
  } catch (error) {
    console.error("Create article error:", error);
    return apiError("Ошибка создания статьи", 500, "INTERNAL_ERROR");
  }
}
