import { type NextRequest } from "next/server";
import { prisma } from "./prisma-client";
import { getClientIP } from "./get-client-ip";

export type AdminAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_PRODUCT"
  | "UPDATE_PRODUCT"
  | "DELETE_PRODUCT"
  | "CREATE_CATEGORY"
  | "UPDATE_CATEGORY"
  | "DELETE_CATEGORY"
  | "UPDATE_ORDER"
  | "CHANGE_PASSWORD"
  | "UPDATE_SETTINGS"
  | "SYNC_MOYSKLAD"
  | "IMPORT_PRODUCTS"
  | "CREATE_ATTRIBUTE"
  | "UPDATE_ATTRIBUTE"
  | "DELETE_ATTRIBUTE"
  | "CREATE_ATTRIBUTE_GROUP"
  | "UPDATE_ATTRIBUTE_GROUP"
  | "DELETE_ATTRIBUTE_GROUP"
  | "SYNC_MOYSKLAD_STOCK"
  | "BULK_ADD_IMAGE";

interface LogAdminActionParams {
  userId: string;
  action: AdminAction;
  entity?: string;
  entityId?: string;
  data?: Record<string, unknown>;
  request?: NextRequest;
}

export async function logAdminAction({
  userId,
  action,
  entity,
  entityId,
  data,
  request,
}: LogAdminActionParams) {
  try {
    const logData: Record<string, unknown> = { ...data };
    if (request) {
      logData.ipAddress = getClientIP(request);
      logData.userAgent = request.headers.get("user-agent") || undefined;
    }

    await prisma.adminLog.create({
      data: {
        userId,
        action,
        entity: entity || action,
        entityId,
        data: Object.keys(logData).length > 0 ? (logData as Record<string, string>) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
