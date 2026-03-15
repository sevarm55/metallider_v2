import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma-client";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("MISSING_FIELDS");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_DISABLED");
        }

        if (!user.verified) {
          throw new Error("NOT_VERIFIED");
        }

        if (!user.password || !user.password.startsWith("$2")) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          phone: user.phone ?? undefined,
        };
      },
    }),
    CredentialsProvider({
      id: "phone-credentials",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) return null;

        // Нормализация телефона (убираем пробелы, дефисы, скобки; 8→+7)
        let phone = credentials.phone.replace(/[\s\-()]/g, "");
        if (phone.startsWith("8")) phone = "+7" + phone.slice(1);
        if (!phone.startsWith("+")) phone = "+" + phone;

        // Поиск пользователя по телефону
        const user = await prisma.user.findFirst({ where: { phone } });
        if (!user) return null;
        if (!user.isActive) throw new Error("ACCOUNT_DISABLED");

        // Поиск и валидация кода подтверждения
        const record = await prisma.verificationCode.findFirst({
          where: { userId: user.id, code: credentials.code },
        });
        if (!record) throw new Error("INVALID_CODE");

        // Проверка TTL — 5 минут
        const elapsed = Date.now() - record.createdAt.getTime();
        if (elapsed > 5 * 60 * 1000) {
          await prisma.verificationCode.delete({ where: { id: record.id } });
          throw new Error("CODE_EXPIRED");
        }

        // Удаление использованного кода
        await prisma.verificationCode.delete({ where: { id: record.id } });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          phone: user.phone ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
};
