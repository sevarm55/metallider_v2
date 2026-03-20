export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Link from "next/link";

import { Phone, Mail, MapPin, Clock, Send, Navigation, MessageCircle } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Контакты — МеталлЛидер",
  description: "Контакты МеталлЛидер: адрес склада, телефон, email, график работы. Приезжайте на склад в Реутов.",
};

const contactCards = [
  {
    icon: Phone,
    title: "Телефон",
    value: contactInfo.phone,
    href: `tel:${contactInfo.phoneRaw}`,
    desc: "Звоните в рабочее время",
    gradient: "from-primary to-orange-600",
  },
  {
    icon: Mail,
    title: "Email",
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    desc: "Ответим в течение часа",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: MapPin,
    title: "Адрес",
    value: contactInfo.address,
    href: contactInfo.mapUrl,
    desc: contactInfo.warehouse,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Clock,
    title: "График работы",
    value: contactInfo.workingHours,
    href: null,
    desc: "Воскресенье — выходной",
    gradient: "from-violet-500 to-purple-600",
  },
];


export default function ContactsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-neutral-50">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          КОНТАКТЫ
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />

        <Container className="relative py-10 lg:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">Контакты</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Связь</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            Контакты
          </h1>
          <p className="mt-3 text-neutral-400 max-w-xl">
            Свяжитесь с нами удобным способом — по телефону, email или приезжайте на склад
          </p>
        </Container>
      </section>

      {/* ── Contact cards ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((c, idx) => {
              const Wrapper = c.href ? "a" : "div";
              const wrapperProps = c.href ? { href: c.href, target: c.href.startsWith("http") ? "_blank" : undefined } : {};
              return (
                <Wrapper
                  key={c.title}
                  {...(wrapperProps as any)}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-2xl"
                >
                  <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${c.gradient} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                  <div className="relative z-10">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${c.gradient} shadow-lg`}>
                      <c.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">{c.title}</p>
                    <p className="mt-1 text-base font-bold text-neutral-900">{c.value}</p>
                    <p className="mt-1 text-xs text-neutral-500">{c.desc}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Map + side panel ── */}
      <section className="bg-neutral-50">
        <div className="relative flex flex-col lg:block">
          {/* Map — full on desktop, fixed height on mobile */}
          <div className="relative h-[400px] lg:h-[650px] lg:min-h-[650px]">
            <iframe
              src="https://yandex.ru/map-widget/v1/?text=Металлидер+Реутов+Автомагистраль+Москва+Нижний+Новгород+1&z=15&l=map"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />

            {/* Gradient overlays — only on desktop */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block bg-linear-to-r from-neutral-50/95 via-neutral-50/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 hidden lg:block bg-linear-to-b from-neutral-50/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 hidden lg:block bg-linear-to-t from-neutral-50/60 to-transparent" />

            {/* Floating side panel — desktop only */}
            <div className="pointer-events-none absolute inset-0 z-10 hidden lg:flex items-center">
              <Container>
                <div className="max-w-md">
                  <div className="pointer-events-auto rounded-3xl bg-white/80 backdrop-blur-2xl p-9 ring-1 ring-neutral-200 shadow-2xl shadow-neutral-200/40">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

                    <div className="relative mb-6 inline-flex">
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-orange-600 shadow-lg shadow-primary/30">
                        <MapPin className="h-7 w-7 text-white" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded)">
                      Приезжайте к нам
                    </h2>
                    <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                      {contactInfo.warehouse} — удобный подъезд и бесплатная парковка
                    </p>

                    <div className="mt-6 space-y-3">
                      <a href={contactInfo.mapUrl} target="_blank" className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100 hover:ring-primary/20 transition-all group">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                          <MapPin className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Адрес</p>
                          <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-primary transition-colors">{contactInfo.address}</p>
                        </div>
                      </a>
                      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                          <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Режим работы</p>
                          <p className="text-sm font-semibold text-neutral-900">{contactInfo.workingHours}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                          <Navigation className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">На автомобиле</p>
                          <p className="text-sm font-semibold text-neutral-900">Бесплатная парковка</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <a href="https://t.me/+74957605549" target="_blank" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 py-2.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors">
                        <Send className="h-3.5 w-3.5" />
                        Telegram
                      </a>
                      <a href="https://wa.me/74957605549" target="_blank" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>

                    <Button asChild size="lg" className="mt-5 w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold text-base">
                      <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
                        <Phone className="h-5 w-5" />
                        {contactInfo.phone}
                      </a>
                    </Button>
                  </div>
                </div>
              </Container>
            </div>
          </div>

          {/* Info panel — mobile only, below map */}
          <div className="lg:hidden">
            <Container className="py-6">
              <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200 shadow-lg">
                <div className="relative mb-4 inline-flex">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-orange-600 shadow-lg shadow-primary/30">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded)">
                  Приезжайте к нам
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {contactInfo.warehouse} — удобный подъезд и бесплатная парковка
                </p>

                <div className="mt-4 space-y-2.5">
                  <a href={contactInfo.mapUrl} target="_blank" className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100 group">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Адрес</p>
                      <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary transition-colors">{contactInfo.address}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Режим работы</p>
                      <p className="text-sm font-semibold text-neutral-900">{contactInfo.workingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-100">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <Navigation className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wide">На автомобиле</p>
                      <p className="text-sm font-semibold text-neutral-900">Бесплатная парковка</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a href="https://t.me/+74957605549" target="_blank" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 py-2.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-colors">
                    <Send className="h-3.5 w-3.5" />
                    Telegram
                  </a>
                  <a href="https://wa.me/74957605549" target="_blank" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </div>

                <Button asChild size="lg" className="mt-4 w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-xl font-bold text-base">
                  <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
                    <Phone className="h-5 w-5" />
                    {contactInfo.phone}
                  </a>
                </Button>
              </div>
            </Container>
          </div>
        </div>
      </section>

    </>
  );
}
