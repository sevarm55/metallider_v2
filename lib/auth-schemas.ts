import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Введите email")
    .email("Некорректный email"),
  password: z
    .string()
    .min(1, "Введите пароль")
    .min(6, "Минимум 6 символов"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Введите имя")
      .min(2, "Минимум 2 символа"),
    email: z
      .string()
      .min(1, "Введите email")
      .email("Некорректный email"),
    phone: z
      .string()
      .min(1, "Введите телефон")
      .regex(/^\+?[\d\s()-]{10,}$/, "Некорректный номер телефона"),
    password: z
      .string()
      .min(1, "Введите пароль")
      .min(6, "Минимум 6 символов"),
    confirmPassword: z
      .string()
      .min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

// Server-side register schema (без confirmPassword)
export const serverRegisterSchema = z.object({
  fullName: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Некорректный email"),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{10,}$/, "Некорректный номер телефона"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, "Код должен содержать 6 цифр")
    .regex(/^\d{6}$/, "Код должен содержать только цифры"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(6, "Минимум 6 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ServerRegisterData = z.infer<typeof serverRegisterSchema>;
export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
