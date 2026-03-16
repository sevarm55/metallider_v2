import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, MapPin, Package, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Доставка — МеталлЛидер",
  description: "Условия доставки металлопроката по Москве и Московской области. Собственный автопарк, точные сроки.",
};

const deliveryZones = [
  { zone: "Москва (в пределах МКАД)", price: "от 5 000 ₽", time: "1-2 дня", gradient: "from-primary to-orange-600" },
  { zone: "Москва (за МКАД до 30 км)", price: "от 7 000 ₽", time: "1-2 дня", gradient: "from-blue-500 to-indigo-600" },
  { zone: "Московская область (30-80 км)", price: "от 10 000 ₽", time: "2-3 дня", gradient: "from-violet-500 to-purple-600" },
  { zone: "Московская область (80+ км)", price: "Индивидуально", time: "2-5 дней", gradient: "from-emerald-500 to-teal-600" },
];

const advantages = [
  { icon: Truck, title: "Собственный автопарк", desc: "Машины от 1.5 до 20 тонн для любого объёма", gradient: "from-primary to-orange-600" },
  { icon: Clock, title: "Точно в срок", desc: "Доставляем в согласованный день и временной интервал", gradient: "from-blue-500 to-indigo-600" },
  { icon: Package, title: "Бережная погрузка", desc: "Аккуратная погрузка и выгрузка краном-манипулятором", gradient: "from-violet-500 to-purple-600" },
  { icon: MapPin, title: "По всей МО", desc: "Доставляем по Москве и Московской области", gradient: "from-emerald-500 to-teal-600" },
];

const importantInfo = [
  "Минимальная сумма заказа для доставки — 10 000 ₽",
  "Разгрузка входит в стоимость при наличии подъезда для транспорта",
  "При заказе от 50 000 ₽ — доставка по Москве бесплатно",
  "Возможна срочная доставка в день заказа (при наличии на складе)",
];

export default function DeliveryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-neutral-50">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          ДОСТАВКА
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />

        <Container className="relative py-10 lg:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">Доставка</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Логистика</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            Доставка
          </h1>
          <p className="mt-3 text-neutral-400 max-w-xl">
            Доставляем металлопрокат по Москве и Московской области. Собственный автопарк, точные сроки, бережная погрузка.
          </p>
        </Container>
      </section>

      {/* ── Advantages ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a, idx) => (
              <div key={a.title} className="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-2xl">
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${a.gradient} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${a.gradient} shadow-lg`}>
                    <a.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Delivery zones ── */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ЗОНЫ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Тарифы</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Стоимость доставки
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {deliveryZones.map((z, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-neutral-100 transition-all hover:shadow-lg hover:ring-primary/20">
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br ${z.gradient} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{z.zone}</p>
                      <p className="mt-1 text-xs text-neutral-500">Срок: {z.time}</p>
                    </div>
                    <span className={`shrink-0 rounded-xl bg-linear-to-br ${z.gradient} px-4 py-2 text-base font-extrabold text-white shadow-lg`}>
                      {z.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            * Точная стоимость зависит от веса, объёма и адреса доставки. Уточняйте у менеджера.
          </p>
        </Container>
      </section>

      {/* ── Pickup ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 lg:p-10">
            <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[8rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              FREE
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1),transparent_50%)]" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded)">
                  Бесплатный самовывоз
                </h2>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Забирайте заказ бесплатно с нашего склада. Помощь при погрузке включена.
                </p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <span className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2 text-sm text-neutral-300">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    {contactInfo.address}
                  </span>
                  <span className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2 text-sm text-neutral-300">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    {contactInfo.workingHours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Important info ── */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ВАЖНО
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-amber-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-amber-500">Информация</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Важно знать
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {importantInfo.map((text, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-neutral-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm text-neutral-700 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-neutral-50 py-16 lg:py-20">
        <span className="pointer-events-none absolute top-4 right-0 select-none text-[clamp(4rem,10vw,10rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          ЗВОНИТЕ
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />

        <Container className="relative">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
              Нужна доставка?
            </h2>
            <p className="mt-3 text-neutral-400 max-w-md">
              Позвоните нам — рассчитаем стоимость за 5 минут и подберём оптимальный вариант
            </p>
            <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
              <Button asChild size="lg" className="h-13 px-8 text-base font-bold bg-primary text-white hover:bg-primary/90 rounded-xl">
                <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
                  <Phone className="h-5 w-5" />
                  {contactInfo.phone}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 px-8 text-base font-bold border-neutral-200 bg-transparent text-neutral-900 hover:bg-neutral-100 rounded-xl">
                <Link href="/contacts">Контакты</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
