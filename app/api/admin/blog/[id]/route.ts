import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";
import { slugify } from "@/lib/slugify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return apiError("Статья не найдена", 404, "NOT_FOUND");

    return apiSuccess(article);
  } catch (error) {
    console.error("Get article error:", error);
    return apiError("Ошибка получения статьи", 500, "INTERNAL_ERROR");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, image, isActive } = body;

    if (!title?.trim()) return apiError("Заголовок обязателен", 400, "VALIDATION_ERROR");

    const slug = body.slug?.trim() || slugify(title);

    const existing = await prisma.article.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) return apiError("Статья с таким URL уже существует", 400, "DUPLICATE_SLUG");

    const article = await prisma.article.update({
      where: { id },
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
      action: "UPDATE_ARTICLE",
      entity: "Article",
      entityId: id,
      data: { title: article.title },
    });

    return apiSuccess(article);
  } catch (error) {
    console.error("Update article error:", error);
    return apiError("Ошибка обновления статьи", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return apiError("Статья не найдена", 404, "NOT_FOUND");

    await prisma.article.delete({ where: { id } });

    await logAdminAction({
      userId: adminUserId,
      action: "DELETE_ARTICLE",
      entity: "Article",
      entityId: id,
      data: { title: article.title },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete article error:", error);
    return apiError("Ошибка удаления статьи", 500, "INTERNAL_ERROR");
  }
}
