import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CreditCard, Building2, FileText, ShieldCheck, Phone } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Оплата — МеталлЛидер",
  description: "Способы оплаты металлопроката: наличные, карта, безналичный расчёт.",
};

const paymentMethods = [
  {
    icon: Banknote,
    title: "Наличные",
    desc: "Оплата наличными на складе при самовывозе или водителю при доставке.",
    color: "bg-emerald-50 border-emerald-200/60",
    iconColor: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Банковская карта",
    desc: "Принимаем карты Visa, Mastercard, МИР. Оплата на складе через терминал.",
    color: "bg-blue-50 border-blue-200/60",
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    icon: Building2,
    title: "Безналичный расчёт",
    desc: "Для юридических лиц и ИП. Выставляем счёт, работаем с НДС и без НДС.",
    color: "bg-violet-50 border-violet-200/60",
    iconColor: "bg-violet-100 text-violet-600",
  },
  {
    icon: FileText,
    title: "По договору",
    desc: "Заключаем договор поставки с отсрочкой платежа для постоянных клиентов.",
    color: "bg-amber-50 border-amber-200/60",
    iconColor: "bg-amber-100 text-amber-600",
  },
];

const steps = [
  { step: "1", title: "Оформите заказ", desc: "На сайте или по телефону" },
  { step: "2", title: "Получите счёт", desc: "Менеджер выставит счёт на оплату" },
  { step: "3", title: "Оплатите удобным способом", desc: "Наличные, карта или безнал" },
  { step: "4", title: "Получите товар", desc: "Самовывоз или доставка" },
];

export default function PaymentPage() {
  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Оплата</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Оплата</h1>
      <p className="mt-2 mb-10 text-muted-foreground max-w-2xl">
        Принимаем любые способы оплаты — наличные, банковские карты, безналичный расчёт для юрлиц.
      </p>

      {/* Payment methods */}
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {paymentMethods.map((m) => (
          <div key={m.title} className={`rounded-2xl border ${m.color} p-6 transition-shadow hover:shadow-md`}>
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${m.iconColor}`}>
              <m.icon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">{m.title}</h3>
            <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Как оформить заказ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={i} className="relative rounded-2xl border bg-white p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {s.step}
              </span>
              <h3 className="text-sm font-bold text-neutral-900">{s.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-neutral-300 lg:block">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* For companies */}
      <div className="mb-12 rounded-2xl border bg-gradient-to-r from-violet-50 to-blue-50 p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <ShieldCheck className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Для юридических лиц</h3>
            <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed max-w-2xl">
              Работаем с юрлицами и ИП по безналичному расчёту. Предоставляем полный пакет документов:
              счёт, счёт-фактура, товарная накладная (ТОРГ-12), УПД. Возможна отсрочка платежа для постоянных клиентов.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Счёт", "Счёт-фактура", "ТОРГ-12", "УПД", "Договор"].map((doc) => (
                <span key={doc} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-100">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-neutral-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Остались вопросы по оплате?</h2>
        <p className="mt-2 text-sm text-white/70">Менеджер подберёт удобный вариант оплаты</p>
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
