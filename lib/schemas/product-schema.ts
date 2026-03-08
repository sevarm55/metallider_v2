import { z } from "zod";

export const productAttributeSchema = z.object({
  attributeId: z.string().min(1),
  value: z.string().min(1, "Введите значение"),
  numericValue: z.coerce.number().optional().nullable(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Введите название"),
  slug: z.string().optional(),
  code: z.string().optional().default(""),
  description: z.string().optional().default(""),
  categoryId: z.string().min(1, "Выберите категорию"),
  brandId: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Цена не может быть отрицательной"),
  specialPrice: z.coerce.number().optional().nullable(),
  unit: z.enum(["PCS", "METER", "M2", "KG", "PACK", "SET"]).default("PCS"),
  stock: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isHit: z.boolean().default(false),
  isNew: z.boolean().default(false),
  images: z.array(z.string()).optional().default([]),
  attributes: z.array(productAttributeSchema).optional().default([]),
});

export type CreateProductData = z.infer<typeof createProductSchema>;
export type ProductAttributeData = z.infer<typeof productAttributeSchema>;

export const unitLabels: Record<string, string> = {
  PCS: "Штука",
  METER: "Метр",
  M2: "м²",
  KG: "Килограмм",
  PACK: "Упаковка",
  SET: "Комплект",
};
