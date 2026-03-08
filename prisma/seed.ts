import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashSync } from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Родительские категории ──────────────────────────
const parentCategories = [
  { name: "Труба профильная", slug: "truba-profilnaya", sortOrder: 1 },
  { name: "Труба круглая", slug: "truba-kruglaya", sortOrder: 2 },
  { name: "Листы", slug: "listy", sortOrder: 3 },
  { name: "Сортовой прокат", slug: "sortovoj-prokat", sortOrder: 4 },
  { name: "Кровля и фасад", slug: "krovlya-i-fasad", sortOrder: 5 },
  { name: "Метизы и фурнитура", slug: "metizy-i-furnitura", sortOrder: 6 },
];

// ─── Подкатегории ────────────────────────────────────
const subCategories: Record<string, { name: string; slug: string; sortOrder: number }[]> = {
  "truba-profilnaya": [
    { name: "Труба профильная квадратная", slug: "truba-profilnaya-kvadratnaya", sortOrder: 1 },
    { name: "Труба профильная прямоугольная", slug: "truba-profilnaya-pryamougolnaya", sortOrder: 2 },
  ],
  "truba-kruglaya": [
    { name: "Труба ВГП", slug: "truba-vgp", sortOrder: 1 },
    { name: "Труба оцинкованная", slug: "truba-ocinkovannaya", sortOrder: 2 },
    { name: "Труба электросварная", slug: "truba-elektrosvarnaya", sortOrder: 3 },
  ],
  listy: [
    { name: "Лист х/к и г/к", slug: "list-xk-gk", sortOrder: 1 },
    { name: "Лист горячекатаный", slug: "list-goryachekatanyj", sortOrder: 2 },
    { name: "Лист оцинкованный", slug: "list-ocinkovannyj", sortOrder: 3 },
    { name: "Лист ПВЛ", slug: "list-pvl", sortOrder: 4 },
    { name: "Лист рифлёный", slug: "list-riflenyj", sortOrder: 5 },
  ],
  "sortovoj-prokat": [
    { name: "Арматура", slug: "armatura", sortOrder: 1 },
    { name: "Балка", slug: "balka", sortOrder: 2 },
    { name: "Швеллер", slug: "shveller", sortOrder: 3 },
    { name: "Уголок", slug: "ugolok", sortOrder: 4 },
    { name: "Квадрат", slug: "kvadrat", sortOrder: 5 },
    { name: "Полоса", slug: "polosa", sortOrder: 6 },
    { name: "Прут", slug: "prut", sortOrder: 7 },
    { name: "Проволока", slug: "provoloka", sortOrder: 8 },
  ],
  "krovlya-i-fasad": [
    { name: "Профнастил", slug: "profnastil", sortOrder: 1 },
  ],
  "metizy-i-furnitura": [
    { name: "Заглушки", slug: "zaglushki", sortOrder: 1 },
    { name: "Задвижки", slug: "zadvizhki", sortOrder: 2 },
    { name: "Отводы", slug: "otvody", sortOrder: 3 },
    { name: "Петли", slug: "petli", sortOrder: 4 },
    { name: "Саморезы", slug: "samorezy", sortOrder: 5 },
    { name: "Электроды и диски", slug: "elektrody-i-diski", sortOrder: 6 },
    { name: "Без категории", slug: "bez-kategorii", sortOrder: 99 },
  ],
};

// ─── Атрибуты ────────────────────────────────────────
const attributesDef = [
  { name: "Диаметр", key: "diameter", type: "NUMBER" as const, unit: "мм" },
  { name: "Толщина стенки", key: "wall_thickness", type: "NUMBER" as const, unit: "мм" },
  { name: "Ширина профиля", key: "profile_width", type: "NUMBER" as const, unit: "мм" },
  { name: "Высота профиля", key: "profile_height", type: "NUMBER" as const, unit: "мм" },
  { name: "Толщина", key: "thickness", type: "NUMBER" as const, unit: "мм" },
  { name: "Размер листа", key: "sheet_size", type: "STRING" as const, unit: null },
  { name: "Номер профиля", key: "profile_number", type: "NUMBER" as const, unit: null },
  { name: "Цвет RAL", key: "ral_color", type: "COLOR" as const, unit: null },
  { name: "Производитель", key: "manufacturer", type: "STRING" as const, unit: null },
  { name: "Размер", key: "size", type: "STRING" as const, unit: null },
  { name: "Длина", key: "length", type: "NUMBER" as const, unit: "м" },
];

async function main() {
  console.log("Seeding МеталлЛидер...");

  // ─── Admin ─────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@metallider.ru" },
  });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        fullName: "Администратор",
        email: "admin@metallider.ru",
        password: hashSync("admin123", 10),
        role: "ADMIN",
        verified: new Date(),
        isActive: true,
      },
    });
    console.log("Admin: admin@metallider.ru / admin123");
  }

  // ─── Brand ─────────────────────────────────────────
  let brand = await prisma.brand.findUnique({ where: { slug: "severstal" } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: { name: "Северсталь", slug: "severstal" },
    });
  }
  console.log("Brand: Северсталь");

  // ─── Parent categories ─────────────────────────────
  const parentMap: Record<string, string> = {};
  for (const pc of parentCategories) {
    let cat = await prisma.category.findUnique({ where: { slug: pc.slug } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: pc.name, slug: pc.slug, sortOrder: pc.sortOrder, isActive: true },
      });
    }
    parentMap[pc.slug] = cat.id;
  }
  console.log(`Parent categories: ${parentCategories.length}`);

  // ─── Sub categories ────────────────────────────────
  let subCount = 0;
  for (const [parentSlug, subs] of Object.entries(subCategories)) {
    for (const sub of subs) {
      const existing = await prisma.category.findUnique({ where: { slug: sub.slug } });
      if (!existing) {
        await prisma.category.create({
          data: {
            name: sub.name,
            slug: sub.slug,
            sortOrder: sub.sortOrder,
            isActive: true,
            parentId: parentMap[parentSlug],
          },
        });
        subCount++;
      }
    }
  }
  console.log(`Sub categories: ${subCount} created`);

  // ─── Attributes ────────────────────────────────────
  let attrCount = 0;
  for (const attr of attributesDef) {
    const existing = await prisma.attribute.findUnique({ where: { key: attr.key } });
    if (!existing) {
      await prisma.attribute.create({
        data: {
          name: attr.name,
          key: attr.key,
          type: attr.type,
          unit: attr.unit,
          isFilter: true,
        },
      });
      attrCount++;
    }
  }
  console.log(`Attributes: ${attrCount} created`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
