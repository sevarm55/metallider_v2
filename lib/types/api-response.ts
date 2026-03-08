import { NextResponse } from "next/server";

export type ApiSuccessResponse<T = void> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type ApiResponse<T = void> = ApiSuccessResponse<T> | ApiErrorResponse;

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message } satisfies ApiSuccessResponse<T>,
    { status },
  );
}

export function apiError(
  error: string,
  status = 400,
  code?: string,
  details?: Record<string, string[]>,
) {
  return NextResponse.json(
    { success: false, error, code, details } satisfies ApiErrorResponse,
    { status },
  );
}
