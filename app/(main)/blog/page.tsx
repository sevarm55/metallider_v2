import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma-client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

export const metadata: Metadata = {
  title: "Блог — полезные статьи о металлопрокате | МеталлЛидер",
  description: "Статьи, руководства и советы по выбору металлопроката. Как выбрать трубу, лист, арматуру. Полезная информация от специалистов МеталлЛидер.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Блог — МеталлЛидер",
    description: "Полезные статьи о металлопрокате",
    url: `${SITE_URL}/blog`,
  },
};

export default async function BlogPage() {
  const articles = await prisma.article.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      <Container className="py-6 lg:py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Блог</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl font-(family-name:--font-unbounded) mb-8">
          Блог
        </h1>

        {articles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-neutral-200 py-16 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-neutral-200 mb-3" />
            <p className="text-neutral-400">Статьи скоро появятся</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group rounded-2xl bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {article.image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-neutral-100 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-neutral-200" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h2 className="text-base font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{article.excerpt}</p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Читать <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
