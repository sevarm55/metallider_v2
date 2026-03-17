import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Введите заголовок"),
  slug: z.string().optional(),
  content: z.string().min(1, "Введите содержание"),
  excerpt: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateArticleData = z.infer<typeof createArticleSchema>;
