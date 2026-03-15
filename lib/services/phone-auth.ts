import { axiosInstance } from "./instance";

export const sendCode = (phone: string) =>
  axiosInstance.post("/auth/send-code", { phone });

export const verifyPhone = (phone: string, code: string) =>
  // Будет использовать NextAuth signIn, прямой API-вызов не нужен
  null;
