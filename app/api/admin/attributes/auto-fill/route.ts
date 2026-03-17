import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

// Parse dimensions from product name
function parseDimensions(name: string, categorySlug: string | null): Record<string, number> {
  const result: Record<string, number> = {};

  // Extract length like "д 6м", "д 12м", "6м" at end
  const lengthMatch = name.match(/(?:д\s*)?(\d+(?:[.,]\d+)?)\s*м(?:\s|$)/i);

  // Extract diameter for round products: "ф 12", "ф12", "ду 15х2.8"
  const diaMatch = name.match(/(?:ф|ду)\s*(\d+(?:[.,]\d+)?)/i);

  // Extract dimensions pattern: "80х80х3", "100x50x2", "25х3.2"
  const dimMatch = name.match(/(\d+(?:[.,]\d+)?)\s*[хxХX×]\s*(\d+(?:[.,]\d+)?)(?:\s*[хxХX×]\s*(\d+(?:[.,]\d+)?))?/);

  const slug = categorySlug || "";

  // Profile tubes: AxBxT
  if (slug.includes("truba-profiln") || slug.includes("truba-kvadrat") || slug.includes("truba-pryamoug")) {
    if (dimMatch) {
      result["prof_height"] = parseFloat(dimMatch[1].replace(",", "."));
      result["prof_width"] = parseFloat(dimMatch[2].replace(",", "."));
      if (dimMatch[3]) result["thickness"] = parseFloat(dimMatch[3].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Round tubes (VGP, electrowelded, galvanized): DxT
  else if (slug.includes("truba-vgp") || slug.includes("truba-elektro") || slug.includes("truba-ocinkov") || slug.includes("truba-krugl") || name.toLowerCase().includes("водогазопровод")) {
    if (diaMatch) {
      result["diameter"] = parseFloat(diaMatch[1].replace(",", "."));
    }
    if (dimMatch && !diaMatch) {
      result["diameter"] = parseFloat(dimMatch[1].replace(",", "."));
      result["thickness"] = parseFloat(dimMatch[2].replace(",", "."));
    } else if (dimMatch && diaMatch) {
      // "ду 15х2.8" — diameter already set, second is thickness
      result["thickness"] = parseFloat(dimMatch[2].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Rebar: ф N
  else if (slug.includes("armatur") || name.toLowerCase().includes("арматура")) {
    if (diaMatch) {
      result["diameter"] = parseFloat(diaMatch[1].replace(",", "."));
    } else {
      // "Арматура 12 мм"
      const simpleMatch = name.match(/арматура.*?(\d+(?:[.,]\d+)?)\s*мм/i);
      if (simpleMatch) result["diameter"] = parseFloat(simpleMatch[1].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Angle: AxBxT
  else if (slug.includes("ugolok") || name.toLowerCase().includes("уголок")) {
    if (dimMatch) {
      result["ugol_a"] = parseFloat(dimMatch[1].replace(",", "."));
      result["ugol_b"] = parseFloat(dimMatch[2].replace(",", "."));
      if (dimMatch[3]) result["thickness"] = parseFloat(dimMatch[3].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Channel/Beam: №N
  else if (slug.includes("shveller") || name.toLowerCase().includes("швеллер")) {
    const numMatch = name.match(/№\s*(\d+(?:[.,]\d+)?)/);
    if (numMatch) result["beam_number"] = parseFloat(numMatch[1].replace(",", "."));
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  else if (slug.includes("balka") || name.toLowerCase().includes("балка") || name.toLowerCase().includes("двутавр")) {
    const numMatch = name.match(/(?:б1?\s+)?(\d+)\s*(?:северсталь|$)/i);
    if (numMatch) result["beam_number"] = parseFloat(numMatch[1]);
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Sheet: thickness x width x length or "TммxWxL"
  else if (slug.includes("list") || name.toLowerCase().includes("лист")) {
    const sheetMatch = name.match(/(\d+(?:[.,]\d+)?)\s*мм\s*(?:[хxХX×]|размер)\s*(\d+(?:[.,]\d+)?)\s*[хxХX×]\s*(\d+(?:[.,]\d+)?)/i);
    if (sheetMatch) {
      result["thickness"] = parseFloat(sheetMatch[1].replace(",", "."));
      result["width"] = parseFloat(sheetMatch[2].replace(",", ".")) > 100
        ? parseFloat(sheetMatch[2].replace(",", "."))
        : parseFloat(sheetMatch[2].replace(",", ".")) * 1000;
      result["length"] = parseFloat(sheetMatch[3].replace(",", ".")) > 100
        ? parseFloat(sheetMatch[3].replace(",", "."))
        : parseFloat(sheetMatch[3].replace(",", ".")) * 1000;
    } else {
      // "3мм размер 1.25x2.5"
      const altMatch = name.match(/(\d+(?:[.,]\d+)?)\s*мм.*?размер\s*(\d+(?:[.,]\d+)?)\s*[хxХX×]\s*(\d+(?:[.,]\d+)?)/i);
      if (altMatch) {
        result["thickness"] = parseFloat(altMatch[1].replace(",", "."));
        const w = parseFloat(altMatch[2].replace(",", "."));
        const l = parseFloat(altMatch[3].replace(",", "."));
        result["width"] = w < 10 ? w * 1000 : w;
        result["length"] = l < 10 ? l * 1000 : l;
      }
    }
  }
  // Strip: WxT мм
  else if (slug.includes("polosa") || name.toLowerCase().includes("полоса")) {
    if (dimMatch) {
      result["width"] = parseFloat(dimMatch[1].replace(",", "."));
      result["thickness"] = parseFloat(dimMatch[2].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Square bar: size
  else if (slug.includes("kvadrat") || name.toLowerCase().includes("квадрат стальной")) {
    const sizeMatch = name.match(/квадрат\s+стальной\s+(\d+)/i);
    if (sizeMatch) result["width"] = parseFloat(sizeMatch[1]);
  }
  // Wire
  else if (slug.includes("provoloka") || name.toLowerCase().includes("проволока")) {
    const wireMatch = name.match(/(\d+(?:[.,]\d+)?)\s*мм/);
    if (wireMatch) result["diameter"] = parseFloat(wireMatch[1].replace(",", "."));
  }
  // Rods: ф N
  else if (slug.includes("prut") || name.toLowerCase().includes("прут")) {
    if (diaMatch) result["diameter"] = parseFloat(diaMatch[1].replace(",", "."));
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }
  // Electrowelded tube: DxT
  else if (name.toLowerCase().includes("электросварная")) {
    if (dimMatch) {
      result["diameter"] = parseFloat(dimMatch[1].replace(",", "."));
      result["thickness"] = parseFloat(dimMatch[2].replace(",", "."));
    }
    if (lengthMatch) result["length"] = parseFloat(lengthMatch[1].replace(",", "."));
  }

  return result;
}

// GET — preview parsed data
export async function GET() {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { slug: true, name: true } },
        attributes: { include: { attribute: { select: { key: true, name: true } } } },
      },
      orderBy: { name: "asc" },
    });

    const attributes = await prisma.attribute.findMany();
    const attrByKey = new Map(attributes.map((a) => [a.key, a]));

    const preview = products.map((p) => {
      const parsed = parseDimensions(p.name, p.category?.slug || null);
      const existingKeys = new Set(p.attributes.map((a) => a.attribute.key));

      // Only show new attributes (not already set)
      const newAttrs: { key: string; name: string; value: number }[] = [];
      for (const [key, value] of Object.entries(parsed)) {
        if (!existingKeys.has(key) && attrByKey.has(key)) {
          newAttrs.push({ key, name: attrByKey.get(key)!.name, value });
        }
      }

      return {
        id: p.id,
        name: p.name,
        category: p.category?.name || "—",
        existingAttrs: p.attributes.map((a) => `${a.attribute.name}: ${a.value}`),
        newAttrs,
      };
    }).filter((p) => p.newAttrs.length > 0); // Only show products with new attrs to add

    return apiSuccess(preview);
  } catch (error) {
    console.error("Auto-fill preview error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}

// POST — apply parsed attributes
export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const body = await request.json();
    const { items } = body as { items: { productId: string; attrs: { key: string; value: number }[] }[] };

    if (!items?.length) return apiError("Нет данных", 400, "VALIDATION_ERROR");

    const attributes = await prisma.attribute.findMany();
    const attrByKey = new Map(attributes.map((a) => [a.key, a]));

    let created = 0;

    for (const item of items) {
      for (const attr of item.attrs) {
        const attrDef = attrByKey.get(attr.key);
        if (!attrDef) continue;

        // Check if already exists
        const existing = await prisma.productAttribute.findUnique({
          where: { productId_attributeId: { productId: item.productId, attributeId: attrDef.id } },
        });
        if (existing) continue;

        await prisma.productAttribute.create({
          data: {
            productId: item.productId,
            attributeId: attrDef.id,
            value: String(attr.value),
            numericValue: attr.value,
          },
        });
        created++;
      }
    }

    return apiSuccess({ created });
  } catch (error) {
    console.error("Auto-fill apply error:", error);
    return apiError("Ошибка применения", 500, "INTERNAL_ERROR");
  }
}
