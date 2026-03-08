import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

interface FalImageResult {
  image: {
    url: string;
    width: number;
    height: number;
    content_type: string;
  };
}

/**
 * Загружает локальный файл в fal storage и возвращает публичный URL.
 * Нужно потому что fal.ai не может скачать с localhost.
 */
async function uploadToFal(localPath: string): Promise<string> {
  const fs = await import("fs");
  const path = await import("path");

  const fullPath = path.join(process.cwd(), "public", localPath);
  const ext = path.extname(fullPath).slice(1) || "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";

  const url = await fal.storage.upload(
    new File(
      [fs.readFileSync(fullPath)],
      path.basename(fullPath),
      { type: contentType },
    ),
  );

  return url;
}

/**
 * Подготавливает URL для fal.ai — если локальный путь, загружает в fal storage.
 */
async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("/")) {
    return uploadToFal(imageUrl);
  }
  return imageUrl;
}

/**
 * Удаляет фон с изображения через fal.ai BiRefNet.
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  const url = await resolveImageUrl(imageUrl);

  const result = await fal.subscribe("fal-ai/birefnet", {
    input: {
      image_url: url,
      model: "General Use (Light)",
      operating_resolution: "1024x1024",
      output_format: "png",
    },
  });

  return (result.data as FalImageResult).image.url;
}

interface FalImagesResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
}

/**
 * Генерирует фото товара по названию через Flux Schnell (~$0.003, ~1 сек).
 * Размер 1:1 (square) — идеально для карточки товара.
 */
export async function generateProductImage(
  productName: string,
  categoryName?: string,
  attributes?: string,
  withDimensions?: boolean,
): Promise<string> {
  // Контекст: металлопрокат
  let description = productName;
  if (categoryName) {
    description += `, category: ${categoryName}`;
  }
  if (attributes) {
    description += `, specs: ${attributes}`;
  }

  const dimensionsText = withDimensions && attributes
    ? ". Include precise dimension lines with measurement annotations showing exact sizes in mm, technical drawing style dimension arrows"
    : "";

  const result = await fal.subscribe("fal-ai/nano-banana-pro", {
    input: {
      prompt: `Professional e-commerce product photo of steel/metal product: ${description}. Metal products store, industrial steel product. Clean white background, studio lighting, centered, high detail, photorealistic, no watermarks, no people${dimensionsText}`,
      aspect_ratio: "1:1",
      num_images: 1,
    },
  });

  return (result.data as FalImagesResult).images[0].url;
}

/**
 * Накладывает водяной знак «МеталлЛидер» в правый нижний угол.
 */
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;

  const meta = await sharp(imageBuffer).metadata();
  const w = meta.width || 1024;
  const h = meta.height || 1024;

  const fontSize = Math.round(w * 0.035);
  const paddingX = Math.round(w * 0.03);
  const paddingY = Math.round(h * 0.03);

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .brand { font-family: Arial, Helvetica, sans-serif; font-weight: 900; letter-spacing: 1px; }
    </style>
    <text x="${w - paddingX}" y="${h - paddingY}" text-anchor="end" class="brand">
      <tspan fill="rgba(26,26,26,0.25)" font-size="${fontSize}">МЕТАЛЛ</tspan><tspan fill="rgba(255,105,0,0.35)" font-size="${fontSize}">ЛИДЕР</tspan>
    </text>
  </svg>`;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();
}

/**
 * Скачивает изображение по URL и сохраняет в public/uploads/products/.
 * Для сгенерированных фото накладывает водяной знак.
 */
export async function downloadAndSave(
  remoteUrl: string,
  suffix: string,
): Promise<string> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);

  let buffer: Buffer = Buffer.from(await res.arrayBuffer());

  // Водяной знак только для сгенерированных фото
  if (suffix === "generated") {
    buffer = Buffer.from(await addWatermark(buffer));
  }

  const ext = remoteUrl.includes(".png") || suffix === "nobg" ? "png" : "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${suffix}.${ext}`;

  const fs = await import("fs/promises");
  const path = await import("path");

  const dir = path.join(process.cwd(), "public/uploads/products");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  return `/uploads/products/${filename}`;
}
