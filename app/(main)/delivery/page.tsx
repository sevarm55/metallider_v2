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
  description: "Условия доставки металлопроката по Москве и Московской области.",
};

const deliveryZones = [
  { zone: "Москва (в пределах МКАД)", price: "от 5 000 ₽", time: "1-2 дня" },
  { zone: "Москва (за МКАД до 30 км)", price: "от 7 000 ₽", time: "1-2 дня" },
  { zone: "Московская область (30-80 км)", price: "от 10 000 ₽", time: "2-3 дня" },
  { zone: "Московская область (80+ км)", price: "Индивидуально", time: "2-5 дней" },
];

const advantages = [
  { icon: Truck, title: "Собственный автопарк", desc: "Машины от 1.5 до 20 тонн для любого объёма" },
  { icon: Clock, title: "Точно в срок", desc: "Доставляем в согласованный день и временной интервал" },
  { icon: Package, title: "Бережная погрузка", desc: "Аккуратная погрузка и выгрузка краном-манипулятором" },
  { icon: MapPin, title: "По всей МО", desc: "Доставляем по Москве и Московской области" },
];

export default function DeliveryPage() {
  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Доставка</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Доставка</h1>
      <p className="mt-2 mb-10 text-muted-foreground max-w-2xl">
        Доставляем металлопрокат по Москве и Московской области. Собственный автопарк, точные сроки, бережная погрузка.
      </p>

      {/* Advantages */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {advantages.map((a) => (
          <div key={a.title} className="flex gap-4 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <a.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{a.title}</h3>
              <p className="mt-0.5 text-xs text-neutral-500">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery zones table */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Стоимость доставки</h2>
        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="px-5 py-3 text-left font-semibold text-neutral-900">Зона доставки</th>
                <th className="px-5 py-3 text-left font-semibold text-neutral-900">Стоимость</th>
                <th className="px-5 py-3 text-left font-semibold text-neutral-900">Сроки</th>
              </tr>
            </thead>
            <tbody>
              {deliveryZones.map((z, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-neutral-700">{z.zone}</td>
                  <td className="px-5 py-3.5 font-semibold text-neutral-900">{z.price}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{z.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          * Точная стоимость зависит от веса, объёма и адреса доставки. Уточняйте у менеджера.
        </p>
      </div>

      {/* Pickup */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Самовывоз</h2>
        <div className="rounded-2xl border bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Бесплатный самовывоз</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Забирайте заказ бесплатно с нашего склада. Помощь при погрузке включена.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {contactInfo.address}, {contactInfo.warehouse}
                </span>
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  {contactInfo.workingHours}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important info */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Важно знать</h2>
        <div className="space-y-3">
          {[
            "Минимальная сумма заказа для доставки — 10 000 ₽",
            "Разгрузка входит в стоимость при наличии подъезда для транспорта",
            "При заказе от 50 000 ₽ — доставка по Москве бесплатно",
            "Возможна срочная доставка в день заказа (при наличии на складе)",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-50/50 border border-amber-200/40 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <span className="text-sm text-neutral-700">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-neutral-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Нужна доставка?</h2>
        <p className="mt-2 text-sm text-white/70">Позвоните нам — рассчитаем стоимость за 5 минут</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
              <Phone className="h-4 w-4" />
              {contactInfo.phone}
            </a>
          </Button>
        </div>
      </div>
    </Container>
  );
}
