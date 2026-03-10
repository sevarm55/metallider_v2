import { contactInfo } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

interface ProductJsonLdProps {
  name: string;
  slug: string;
  description: string;
  price: number;
  specialPrice?: number;
  code?: string;
  image?: string;
  inStock?: boolean;
  category?: string;
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "МеталлЛидер",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "Интернет-магазин металлопроката и трубной продукции. Широкий ассортимент труб, арматуры, профиля и металлоизделий.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contactInfo.phoneRaw,
      contactType: "sales",
      areaServed: "RU",
      availableLanguage: "Russian",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address,
      addressLocality: "Реутов",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "МеталлЛидер",
    image: `${SITE_URL}/images/logo.png`,
    url: SITE_URL,
    telephone: contactInfo.phoneRaw,
    email: contactInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address,
      addressLocality: "Реутов",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 55.759,
      longitude: 37.856,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
    priceRange: "₽₽",
    paymentAccepted: "Наличные, Банковская карта, Безналичный расчёт",
    currenciesAccepted: "RUB",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({
  name,
  slug,
  description,
  price,
  specialPrice,
  code,
  image,
  inStock = true,
  category,
}: ProductJsonLdProps) {
  const hasDiscount = specialPrice && specialPrice > 0 && specialPrice < price;
  const effectivePrice = hasDiscount ? specialPrice : price;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: `${SITE_URL}/product/${slug}`,
    image: image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/images/logo.png`,
    brand: {
      "@type": "Brand",
      name: "МеталлЛидер",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: "RUB",
      price: effectivePrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "МеталлЛидер",
      },
    },
  };

  if (code) {
    schema.sku = code;
  }

  if (category) {
    schema.category = category;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface CatalogProduct {
  name: string;
  slug: string;
  price: number;
  image?: string;
}

export function ItemListJsonLd({ items, categoryName }: { items: CatalogProduct[]; categoryName: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: categoryName,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/product/${item.slug}`,
      name: item.name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "МеталлЛидер",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
