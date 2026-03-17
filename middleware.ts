import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET!);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin panel routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      if (payload.role !== "ADMIN" && payload.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Protect admin API routes
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/login")
  ) {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Не авторизован", code: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      if (payload.role !== "ADMIN" && payload.role !== "MANAGER") {
        return NextResponse.json(
          { success: false, error: "Доступ запрещён", code: "FORBIDDEN" },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Невалидный токен", code: "INVALID_TOKEN" },
        { status: 401 },
      );
    }
  }

  // Request size limit for API POST/PUT/PATCH
  if (
    pathname.startsWith("/api") &&
    ["POST", "PUT", "PATCH"].includes(request.method)
  ) {
    const contentLength = request.headers.get("content-length");
    const maxSize = pathname.includes("/upload") ? 10 * 1024 * 1024 : 1024 * 1024;
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      return NextResponse.json(
        { success: false, error: "Размер запроса слишком большой" },
        { status: 413 },
      );
    }
  }

  const response = NextResponse.next();

  // Cache headers
  if (pathname.match(/\.(js|css|png|jpg|webp|svg|ico|woff2?)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/:path*",
  ],
};
