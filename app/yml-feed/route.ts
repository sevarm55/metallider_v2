import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";
const COMPANY_NAME = "МеталлЛидер";

const unitLabels: Record<string, string> = {
  PCS: "шт",
  METER: "м",
  M2: "м²",
  KG: "кг",
  PACK: "уп",
  SET: "компл",
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, parentId: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        description: true,
        price: true,
        specialPrice: true,
        unit: true,
        stock: true,
        categoryId: true,
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        attributes: {
          include: { attribute: true },
          orderBy: { attribute: { sortOrder: "asc" } },
        },
      },
    }),
  ]);

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const categoriesXml = categories
    .map((c) => {
      const parentAttr = c.parentId ? ` parentId="${escapeXml(c.parentId)}"` : "";
      return `      <category id="${escapeXml(c.id)}"${parentAttr}>${escapeXml(c.name)}</category>`;
    })
    .join("\n");

  const offersXml = products
    .map((p) => {
      const hasDiscount = p.specialPrice > 0 && p.specialPrice < p.price;
      const effectivePrice = hasDiscount ? p.specialPrice : p.price;
      const available = p.stock > 0 ? "true" : "false";
      const unit = unitLabels[p.unit] || "шт";
      const imageUrl = p.images[0]?.url;
      const imageTag = imageUrl
        ? `        <picture>${escapeXml(imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`)}</picture>`
        : "";

      const oldPriceTag = hasDiscount ? `        <oldprice>${p.price}</oldprice>` : "";

      const paramsXml = p.attributes
        .map((a) => {
          const unitAttr = a.attribute.unit ? ` unit="${escapeXml(a.attribute.unit)}"` : "";
          return `        <param name="${escapeXml(a.attribute.name)}"${unitAttr}>${escapeXml(a.value)}</param>`;
        })
        .join("\n");

      const descriptionText = p.description
        ? escapeXml(p.description.replace(/<[^>]*>/g, "").slice(0, 3000))
        : escapeXml(`${p.name} — купить в ${COMPANY_NAME} с доставкой по Москве и МО.`);

      return `      <offer id="${escapeXml(p.id)}" available="${available}">
        <url>${SITE_URL}/product/${escapeXml(p.slug)}</url>
        <price>${effectivePrice}</price>
${oldPriceTag}
        <currencyId>RUR</currencyId>
        <categoryId>${escapeXml(p.categoryId || "")}</categoryId>
${imageTag}
        <name>${escapeXml(p.name)}</name>
        <description>${descriptionText}</description>
${p.code ? `        <vendorCode>${escapeXml(p.code)}</vendorCode>` : ""}
        <param name="Единица измерения">${escapeXml(unit)}</param>
${paramsXml}
      </offer>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${now}">
  <shop>
    <name>${escapeXml(COMPANY_NAME)}</name>
    <company>${escapeXml(COMPANY_NAME)}</company>
    <url>${SITE_URL}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
