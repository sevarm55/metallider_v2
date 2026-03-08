import { type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { slugify } from "@/lib/slugify";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

const importRowSchema = z.object({
  name: z.string().min(1),
  code: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  unit: z
    .enum(["PCS", "METER", "M2", "KG", "PACK", "SET"])
    .default("PCS"),
  stock: z.coerce.number().min(0).default(1000),
  description: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return apiError("Нет данных для импорта", 400, "VALIDATION_ERROR");
    }

    if (products.length > 5000) {
      return apiError("Максимум 5000 товаров за раз", 400, "VALIDATION_ERROR");
    }

    // Get existing codes to skip duplicates
    const existingCodes = new Set(
      (
        await prisma.product.findMany({
          where: { code: { not: "" } },
          select: { code: true },
        })
      ).map((p) => p.code),
    );

    // Get existing slugs
    const existingSlugs = new Set(
      (
        await prisma.product.findMany({ select: { slug: true } })
      ).map((p) => p.slug),
    );

    let created = 0;
    let skipped = 0;
    let errors = 0;
    const details: Array<{ row: number; name: string; status: string; error?: string }> = [];

    for (let i = 0; i < products.length; i++) {
      const parsed = importRowSchema.safeParse(products[i]);

      if (!parsed.success) {
        errors++;
        details.push({
          row: i + 1,
          name: products[i]?.name || "—",
          status: "error",
          error: parsed.error.issues.map((e) => e.message).join(", "),
        });
        continue;
      }

      const row = parsed.data;

      // Skip if code already exists
      if (row.code && existingCodes.has(row.code)) {
        skipped++;
        details.push({
          row: i + 1,
          name: row.name,
          status: "skipped",
          error: `Артикул "${row.code}" уже существует`,
        });
        continue;
      }

      // Generate unique slug
      let slug = slugify(row.name);
      let suffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugify(row.name)}-${suffix}`;
        suffix++;
      }

      try {
        await prisma.product.create({
          data: {
            name: row.name,
            slug,
            code: row.code,
            description: row.description,
            categoryId: row.categoryId,
            price: row.price,
            specialPrice: 0,
            unit: row.unit,
            stock: row.stock,
            isActive: true,
            isHit: false,
            isNew: false,
          },
        });

        existingSlugs.add(slug);
        if (row.code) existingCodes.add(row.code);
        created++;
        details.push({ row: i + 1, name: row.name, status: "created" });
      } catch (err) {
        errors++;
        details.push({
          row: i + 1,
          name: row.name,
          status: "error",
          error: err instanceof Error ? err.message : "Ошибка создания",
        });
      }
    }

    await logAdminAction({
      userId: adminId,
      action: "IMPORT_PRODUCTS",
      entity: "Product",
      data: { created, skipped, errors, total: products.length },
      request,
    });

    return apiSuccess({ created, skipped, errors, total: products.length, details });
  } catch (error) {
    console.error("Import products error:", error);
    return apiError("Ошибка импорта товаров", 500, "INTERNAL_ERROR");
  }
}
