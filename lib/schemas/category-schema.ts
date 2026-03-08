import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Введите название"),
  slug: z.string().optional(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CategoryData = z.infer<typeof categorySchema>;
