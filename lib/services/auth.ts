import { axiosInstance } from "./instance";
import type { ApiResponse } from "@/lib/types/api-response";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export const getMe = async () => {
  const { data } = await axiosInstance.get<ApiResponse<UserProfile>>(
    "/auth/me",
  );
  return data;
};

export const registerUser = async (body: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const { data } = await axiosInstance.post<
    ApiResponse<{ userId: string }>
  >("/auth/register", body);
  return data;
};

export const verifyCode = async (code: string) => {
  const { data } = await axiosInstance.post<ApiResponse>("/auth/verify", {
    code,
  });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await axiosInstance.post<ApiResponse>("/auth/forgot-password", {
    email,
  });
  return data;
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const { data } = await axiosInstance.post<ApiResponse>("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return data;
};
