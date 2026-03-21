/**
 * Скрипт конвертации существующих JPG/PNG изображений в WebP.
 * Обновляет пути в базе данных (ProductImage.url).
 *
 * Запуск: npx tsx scripts/convert-to-webp.ts
 * С удалением оригиналов: npx tsx scripts/convert-to-webp.ts --delete
 */

import "dotenv/config";
import sharp from "sharp";
import { readdir, unlink } from "fs/promises";
import path from "path";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const deleteOriginals = process.argv.includes("--delete");

async function convertDir(dir: string, urlPrefix: string) {
  const fullDir = path.join(process.cwd(), "public", dir);
  let files: string[];
  try {
    files = await readdir(fullDir);
  } catch {
    console.log(`  Папка ${dir} не найдена, пропускаем`);
    return;
  }

  const toConvert = files.filter((f) =>
    /\.(jpe?g|png)$/i.test(f) && !f.includes("-nobg")
  );

  console.log(`  Найдено ${toConvert.length} файлов для конвертации в ${dir}`);

  for (const file of toConvert) {
    const srcPath = path.join(fullDir, file);
    const baseName = file.replace(/\.(jpe?g|png)$/i, "");
    const webpName = `${baseName}.webp`;
    const destPath = path.join(fullDir, webpName);

    try {
      await sharp(srcPath).webp({ quality: 80 }).toFile(destPath);

      const oldUrl = `${urlPrefix}/${file}`;
      const newUrl = `${urlPrefix}/${webpName}`;

      // Обновляем URL в БД через прямой SQL
      const result = await client.query(
        `UPDATE "product_images" SET url = $1 WHERE url = $2`,
        [newUrl, oldUrl]
      );

      if (result.rowCount && result.rowCount > 0) {
        console.log(`  ✓ ${file} → ${webpName} (обновлено ${result.rowCount} записей в БД)`);
      } else {
        console.log(`  ✓ ${file} → ${webpName} (нет записей в БД)`);
      }

      if (deleteOriginals) {
        await unlink(srcPath);
      }
    } catch (err) {
      console.error(`  ✗ Ошибка: ${file}:`, err);
    }
  }
}

async function main() {
  await client.connect();

  console.log("Конвертация изображений в WebP...");
  if (deleteOriginals) {
    console.log("⚠ Режим с удалением оригиналов\n");
  } else {
    console.log("Оригиналы будут сохранены (добавьте --delete для удаления)\n");
  }

  await convertDir("uploads/products", "/uploads/products");
  await convertDir("uploads/categories", "/uploads/categories");

  console.log("\nГотово!");
  await client.end();
}

main().catch(async (err) => {
  console.error("Ошибка:", err);
  await client.end();
  process.exit(1);
});
