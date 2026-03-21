import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();

  // Проверяем и обновляем категории
  const r1 = await client.query(
    `UPDATE categories SET image = regexp_replace(image, '\\.(png|jpe?g)$', '.webp') WHERE image ~ '\\.(png|jpe?g)$'`
  );
  console.log(`Категории: обновлено ${r1.rowCount} записей`);

  // Проверяем и обновляем товары
  const r2 = await client.query(
    `UPDATE product_images SET url = regexp_replace(url, '\\.(png|jpe?g)$', '.webp') WHERE url ~ '\\.(png|jpe?g)$'`
  );
  console.log(`Товары: обновлено ${r2.rowCount} записей`);

  // Проверяем и обновляем блог
  const r3 = await client.query(
    `UPDATE articles SET image = regexp_replace(image, '\\.(png|jpe?g)$', '.webp') WHERE image ~ '\\.(png|jpe?g)$'`
  );
  console.log(`Блог: обновлено ${r3.rowCount} записей`);

  console.log("\nГотово!");
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
