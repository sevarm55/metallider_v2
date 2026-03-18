import { NextRequest } from "next/server";
import { apiError } from "./types/api-response";

export function checkMobileApiKey(request: NextRequest) {
  const key = request.headers.get("X-API-Key");
  const validKey = process.env.MOBILE_API_KEY;

  if (!validKey) return null; // If not configured, skip check
  if (key === validKey) return null; // Valid key

  return apiError("Недействительный API ключ", 401, "INVALID_API_KEY");
}
