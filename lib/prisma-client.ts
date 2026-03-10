import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  const client = new PrismaClient({ adapter });

  // Auto-hide products when stock reaches 0, auto-show when stock > 0
  const extended = client.$extends({
    query: {
      product: {
        async update({ args, query }) {
          const data = args.data;
          if (data && typeof data.stock === "number") {
            if (data.stock <= 0) {
              data.isActive = false;
            }
          }
          return query(args);
        },
      },
    },
  });

  return extended;
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
