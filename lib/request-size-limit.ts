import { type NextRequest } from "next/server";
import { apiError } from "./types/api-response";

export const REQUEST_SIZE_LIMITS = {
  JSON: 1 * 1024 * 1024,
  FILE_UPLOAD: 10 * 1024 * 1024,
  FORM_DATA: 10 * 1024 * 1024,
} as const;

export function checkRequestSize(
  request: NextRequest,
  maxSize: number = REQUEST_SIZE_LIMITS.JSON,
) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return apiError("Размер запроса превышает допустимый лимит", 413, "PAYLOAD_TOO_LARGE");
  }
  return null;
}
