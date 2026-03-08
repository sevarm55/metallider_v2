import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { apiSuccess, apiError } from "@/lib/types/api-response";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
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
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public/uploads/products");
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);

    return apiSuccess({ url: `/uploads/products/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return apiError("Ошибка загрузки файла", 500, "UPLOAD_ERROR");
  }
}
