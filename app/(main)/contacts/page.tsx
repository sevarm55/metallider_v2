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
  description: "Контакты МеталлЛидер: адрес склада, телефон, email, график работы.",
};

const contactCards = [
  {
    icon: Phone,
    title: "Телефон",
    value: contactInfo.phone,
    href: `tel:${contactInfo.phoneRaw}`,
    desc: "Звоните в рабочее время",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Mail,
    title: "Email",
    value: contactInfo.email,
    href: `mailto:${contactInfo.email}`,
    desc: "Ответим в течение часа",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: MapPin,
    title: "Адрес",
    value: `${contactInfo.address}, ${contactInfo.warehouse}`,
    href: contactInfo.mapUrl,
    desc: "Показать на карте",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Clock,
    title: "График работы",
    value: contactInfo.workingHours,
    href: null,
    desc: "Воскресенье — выходной",
    color: "bg-amber-100 text-amber-600",
  },
];

export default function ContactsPage() {
  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Контакты</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Контакты</h1>
      <p className="mt-2 mb-10 text-muted-foreground max-w-2xl">
        Свяжитесь с нами удобным способом — по телефону, email или приезжайте на склад
      </p>

      {/* Contact cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {contactCards.map((c) => {
          const Wrapper = c.href ? "a" : "div";
          const wrapperProps = c.href ? { href: c.href, target: c.href.startsWith("http") ? "_blank" : undefined } : {};
          return (
            <Wrapper
              key={c.title}
              {...(wrapperProps as any)}
              className="group rounded-2xl border bg-white p-5 transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{c.title}</p>
              <p className="mt-1 text-sm font-bold text-neutral-900">{c.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{c.desc}</p>
            </Wrapper>
          );
        })}
      </div>

      {/* Map + details */}
      <div className="grid gap-6 lg:grid-cols-5 mb-12">
        {/* Map placeholder */}
        <div className="lg:col-span-3 overflow-hidden rounded-2xl border bg-neutral-100 min-h-[400px]">
          <iframe
            src="https://yandex.ru/map-widget/v1/?text=Металлидер+Реутов+Автомагистраль+Москва+Нижний+Новгород+1&z=15&l=map"
            width="100%"
            height="100%"
            style={{ border: 0, display: "block", minHeight: 400 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-4">Как добраться</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Navigation className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">На автомобиле</p>
                  <p className="text-xs text-neutral-500">Удобный подъезд, бесплатная парковка для клиентов</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Ориентир</p>
                  <p className="text-xs text-neutral-500">{contactInfo.warehouse}, территория металлобазы</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h3 className="text-base font-bold text-neutral-900 mb-4">Мессенджеры</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Send className="h-4 w-4" />
                Telegram
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-primary p-6 text-white">
            <h3 className="text-base font-bold">Получить консультацию</h3>
            <p className="mt-1 text-xs text-white/70">Поможем подобрать металлопрокат для вашего проекта</p>
            <Button asChild size="sm" variant="secondary" className="mt-4 w-full">
              <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
                <Phone className="h-4 w-4" />
                Позвонить
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Requisites */}
      <div className="rounded-2xl border bg-white p-6 lg:p-8">
        <h2 className="text-xl font-bold mb-4">Реквизиты</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            { label: "Название", value: "ООО «МеталлЛидер»" },
            { label: "ИНН", value: "7712345678" },
            { label: "КПП", value: "771201001" },
            { label: "ОГРН", value: "1177746123456" },
            { label: "Юридический адрес", value: "г. Москва, ул. Примерная, д. 1" },
            { label: "Расчётный счёт", value: "40702810123450001234" },
          ].map((r) => (
            <div key={r.label}>
              <p className="text-xs text-neutral-400 mb-0.5">{r.label}</p>
              <p className="font-medium text-neutral-900">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
