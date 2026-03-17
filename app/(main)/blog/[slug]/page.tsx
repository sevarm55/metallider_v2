import { notFound } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { Calendar, ChevronRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma-client";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, image: true },
  });
  if (!article) return { title: "Статья не найдена" };

  return {
    title: `${article.title} — МеталлЛидер`,
    description: article.excerpt || `${article.title}. Читайте на сайте МеталлЛидер.`,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      images: article.image ? [{ url: article.image, width: 1200, height: 630, alt: article.title }] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.isActive) notFound();

  const relatedArticles = await prisma.article.findMany({
    where: { isActive: true, id: { not: article.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { title: true, slug: true, image: true, excerpt: true, createdAt: true },
  });

  const sanitizedContent = sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
    },
  });

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt || article.title,
            image: article.image || undefined,
            datePublished: article.createdAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            publisher: {
              "@type": "Organization",
              name: "МеталлЛидер",
              url: SITE_URL,
            },
          }),
        }}
      />

      <Container className="py-6 lg:py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link href="/blog">Блог</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{article.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <article className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-1.5 text-sm text-neutral-400 mb-3">
              <Calendar className="h-4 w-4" />
              {article.createdAt.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 lg:text-4xl font-(family-name:--font-unbounded) leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-3 text-lg text-neutral-500">{article.excerpt}</p>
            )}
          </div>

          {/* Cover */}
          {article.image && (
            <div className="rounded-2xl overflow-hidden mb-8">
              <img src={article.image} alt={article.title} className="w-full aspect-video object-cover" />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none text-neutral-700 prose-headings:text-neutral-900 prose-headings:font-(family-name:--font-unbounded) prose-a:text-primary prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-900 font-(family-name:--font-unbounded) mb-6">
              Другие статьи
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.slug}
                  href={`/blog/${ra.slug}`}
                  className="group rounded-xl bg-white border border-neutral-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {ra.image ? (
                    <img src={ra.image} alt={ra.title} className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="aspect-video bg-neutral-100" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors line-clamp-2">
                      {ra.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
