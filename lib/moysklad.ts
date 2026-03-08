import { prisma } from "./prisma-client";

const MOYSKLAD_API = "https://api.moysklad.ru/api/remap/1.2";

function getToken() {
  const token = process.env.MOYSKLAD_TOKEN;
  if (!token) throw new Error("MOYSKLAD_TOKEN не указан в .env");
  return token;
}

interface MoyskladImage {
  meta: { href: string };
  miniature: { href: string };
  tiny: { href: string };
}

interface MoyskladProduct {
  id: string;
  name: string;
  article?: string;
  code?: string;
  images?: { meta: { href: string; size: number } };
  salePrices?: Array<{
    value: number;
    priceType: { name: string };
  }>;
  buyPrice?: { value: number };
  stock?: number;
}

interface MoyskladResponse {
  meta: { size: number };
  rows: MoyskladProduct[];
}

export interface SyncDetail {
  code: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  status: "updated" | "not_found" | "error" | "unchanged";
  error?: string;
}

export interface SyncResult {
  total: number;
  updated: number;
  notFound: number;
  unchanged: number;
  errors: number;
  details: SyncDetail[];
}

/**
 * Ищет товар в МойСклад по артикулу (article)
 */
export async function fetchMoyskladByArticle(
  article: string,
): Promise<MoyskladProduct | null> {
  const url = `${MOYSKLAD_API}/entity/assortment?filter=code=${encodeURIComponent(article)}&limit=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`МойСклад API error ${res.status}: ${text}`);
  }

  const data: MoyskladResponse = await res.json();

  if (data.rows.length === 0) return null;
  return data.rows[0];
}

/**
 * Получает изображения товара из МойСклад по его ID.
 * Скачивает и сохраняет в public/uploads/products/.
 */
export async function fetchMoyskladImages(productId: string): Promise<string[]> {
  const url = `${MOYSKLAD_API}/entity/product/${productId}/images`;
  const token = getToken();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  const data: { rows: MoyskladImage[] } = await res.json();
  if (!data.rows || data.rows.length === 0) return [];

  const urls: string[] = [];

  for (const image of data.rows) {
    try {
      // Скачиваем miniature (среднего размера)
      const imgRes = await fetch(image.miniature.href, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!imgRes.ok) continue;

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const fs = await import("fs/promises");
      const path = await import("path");

      const dir = path.join(process.cwd(), "public/uploads/products");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);

      urls.push(`/uploads/products/${filename}`);
    } catch {
      // Пропускаем если не удалось скачать
    }
  }

  return urls;
}

/**
 * Ищет товар по коду и возвращает его фото (если есть).
 */
export async function fetchImagesByCode(
  code: string,
): Promise<{ images: string[]; found: boolean }> {
  const product = await fetchMoyskladByArticle(code);
  if (!product) return { images: [], found: false };

  if (!product.images || product.images.meta.size === 0) {
    return { images: [], found: true };
  }

  const images = await fetchMoyskladImages(product.id);
  return { images, found: true };
}

/**
 * Извлекает цену продажи из ответа МойСклад.
 * salePrices[0].value — в копейках, делим на 100.
 */
function extractPrice(product: MoyskladProduct): number | null {
  if (product.salePrices && product.salePrices.length > 0) {
    return product.salePrices[0].value / 100;
  }
  return null;
}

/**
 * Извлекает закупочную цену из ответа МойСклад.
 */
function extractBuyPrice(product: MoyskladProduct): number | null {
  if (product.buyPrice && product.buyPrice.value > 0) {
    return product.buyPrice.value / 100;
  }
  return null;
}

/**
 * Синхронизирует цены всех товаров с непустым code из МойСклад.
 */
export async function syncAllPrices(): Promise<SyncResult> {
  const products = await prisma.product.findMany({
    where: { code: { not: null } },
    select: { id: true, code: true, name: true, price: true, specialPrice: true, moyskladId: true },
  });

  // Фильтруем товары с пустым code
  const withCode = products.filter((p) => p.code && p.code.trim() !== "");

  const result: SyncResult = {
    total: withCode.length,
    updated: 0,
    notFound: 0,
    unchanged: 0,
    errors: 0,
    details: [],
  };

  for (const product of withCode) {
    const code = product.code!.trim();

    try {
      const msProduct = await fetchMoyskladByArticle(code);

      if (!msProduct) {
        result.notFound++;
        result.details.push({
          code,
          name: product.name,
          oldPrice: product.price,
          newPrice: product.price,
          status: "not_found",
        });
        continue;
      }

      const newPrice = extractPrice(msProduct);
      const buyPrice = extractBuyPrice(msProduct);

      if (newPrice === null) {
        result.errors++;
        result.details.push({
          code,
          name: product.name,
          oldPrice: product.price,
          newPrice: product.price,
          status: "error",
          error: "Нет цены в МойСклад",
        });
        continue;
      }

      // Если цена не изменилась — пропускаем обновление
      if (newPrice === product.price && msProduct.id === product.moyskladId) {
        result.unchanged++;
        result.details.push({
          code,
          name: product.name,
          oldPrice: product.price,
          newPrice,
          status: "unchanged",
        });
        continue;
      }

      // Сбрасываем спеццену если она >= новой цены (теряет смысл)
      const shouldResetSpecialPrice =
        product.specialPrice > 0 && product.specialPrice >= newPrice;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: newPrice,
          moyskladId: msProduct.id,
          ...(buyPrice !== null ? { buyPrice } : {}),
          ...(shouldResetSpecialPrice ? { specialPrice: 0 } : {}),
        },
      });

      result.updated++;
      result.details.push({
        code,
        name: product.name,
        oldPrice: product.price,
        newPrice,
        status: "updated",
      });
    } catch (err) {
      result.errors++;
      result.details.push({
        code,
        name: product.name,
        oldPrice: product.price,
        newPrice: product.price,
        status: "error",
        error: err instanceof Error ? err.message : "Неизвестная ошибка",
      });
    }

    // Задержка 25ms между запросами (rate limit ~45 req/sec)
    await new Promise((r) => setTimeout(r, 25));
  }

  return result;
}
