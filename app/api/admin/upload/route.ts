import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("Файл не найден", 400, "NO_FILE");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("Допустимые форматы: JPEG, PNG, WebP", 400, "INVALID_TYPE");
    }

    if (file.size > MAX_SIZE) {
      return apiError("Максимальный размер файла 5MB", 400, "FILE_TOO_LARGE");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    await mkdir(uploadDir, { recursive: true });

    // Конвертируем в WebP через Sharp (качество 80 — оптимальный баланс)
    const sharp = (await import("sharp")).default;
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();

    await writeFile(path.join(uploadDir, filename), webpBuffer);

    return apiSuccess({ url: `/uploads/products/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Ошибка загрузки файла", 500, "UPLOAD_ERROR");
  }
}
