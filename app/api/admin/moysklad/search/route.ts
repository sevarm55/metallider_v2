import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";

const MOYSKLAD_API = "https://api.moysklad.ru/api/remap/1.2";

export const dynamic = "force-dynamic";

// Cache all products in memory for fast search (refreshes every 5 min)
let cachedProducts: { name: string; code: string; article: string; price: number; weight: number }[] = [];
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function loadAllProducts(token: string) {
  if (Date.now() - cacheTime < CACHE_TTL && cachedProducts.length > 0) {
    return cachedProducts;
  }

  const all: { name: string; code: string; article: string; price: number; weight: number }[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const url = `${MOYSKLAD_API}/entity/assortment?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) break;
    const data = await res.json();
    const rows = data.rows || [];

    for (const row of rows) {
      all.push({
        name: row.name || "",
        code: row.code || "",
        article: row.article || "",
        price: row.salePrices?.[0]?.value ? row.salePrices[0].value / 100 : 0,
        weight: row.weight || 0,
      });
    }

    if (rows.length < limit) break;
    offset += limit;
  }

  cachedProducts = all;
  cacheTime = Date.now();
  return all;
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const token = process.env.MOYSKLAD_TOKEN;
    if (!token) return apiError("МойСклад не настроен", 500, "CONFIG_ERROR");

    const q = request.nextUrl.searchParams.get("q")?.trim()?.toLowerCase();
    if (!q || q.length < 2) return apiSuccess([]);

    const all = await loadAllProducts(token);

    // Search by code or name locally
    const results = all.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.article.toLowerCase().includes(q)
    );

    return apiSuccess(results.slice(0, 30));
  } catch (error) {
    console.error("MoySklad search error:", error);
    return apiError("Ошибка поиска", 500, "INTERNAL_ERROR");
  }
}
