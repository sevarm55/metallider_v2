import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  const r1 = await client.query(
    `SELECT id, image FROM categories WHERE image LIKE '%.png' OR image LIKE '%.jpg' LIMIT 10`
  );
  console.log("Категории с PNG/JPG:", r1.rows.length > 0 ? r1.rows : "нет — всё WebP ✓");

  const r2 = await client.query(
    `SELECT id, url FROM product_images WHERE url LIKE '%.png' OR url LIKE '%.jpg' LIMIT 10`
  );
  console.log("Товары с PNG/JPG:", r2.rows.length > 0 ? r2.rows : "нет — всё WebP ✓");

  // Обновляем категории если остались старые пути
  if (r1.rows.length > 0) {
    const updated = await client.query(
      `UPDATE categories SET image = regexp_replace(image, '\\.(png|jpe?g)$', '.webp') WHERE image ~ '\\.(png|jpe?g)$'`
    );
    console.log(`\nОбновлено ${updated.rowCount} категорий на WebP`);
  }

  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
