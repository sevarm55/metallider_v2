import { cookies } from "next/headers";
import { jwtVerify } from "jose";

function getSecretKey() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function getAdminUserId(): Promise<string | null> {
  try {
    const token = (await cookies()).get("admin-token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "ADMIN") return null;

    return payload.userId as string;
  } catch {
    return null;
  }
}
