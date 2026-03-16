export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CreditCard, Building2, FileText, ShieldCheck, Phone, ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Оплата — МеталлЛидер",
  description: "Способы оплаты металлопроката: наличные, карта, безналичный расчёт для юрлиц.",
};

const paymentMethods = [
  {
    icon: Banknote,
    title: "Наличные",
    desc: "Оплата наличными на складе при самовывозе или водителю при доставке.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: CreditCard,
    title: "Банковская карта",
    desc: "Принимаем карты Visa, Mastercard, МИР. Оплата на складе через терминал.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Building2,
    title: "Безналичный расчёт",
    desc: "Для юридических лиц и ИП. Выставляем счёт, работаем с НДС и без НДС.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "По договору",
    desc: "Заключаем договор поставки с отсрочкой платежа для постоянных клиентов.",
    gradient: "from-amber-500 to-orange-600",
  },
];

const steps = [
  { step: "01", title: "Оформите заказ", desc: "На сайте или по телефону", gradient: "from-primary to-orange-600" },
  { step: "02", title: "Получите счёт", desc: "Менеджер выставит счёт на оплату", gradient: "from-blue-500 to-indigo-600" },
  { step: "03", title: "Оплатите", desc: "Наличные, карта или безнал", gradient: "from-violet-500 to-purple-600" },
  { step: "04", title: "Получите товар", desc: "Самовывоз или доставка", gradient: "from-emerald-500 to-teal-600" },
];

export default function PaymentPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-neutral-50">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          ОПЛАТА
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />

        <Container className="relative py-10 lg:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">Оплата</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Финансы</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            Оплата
          </h1>
          <p className="mt-3 text-neutral-400 max-w-xl">
            Принимаем любые способы оплаты — наличные, банковские карты, безналичный расчёт для юрлиц.
          </p>
        </Container>
      </section>

      {/* ── Payment methods ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              СПОСОБЫ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Варианты</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Способы оплаты
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {paymentMethods.map((m, idx) => (
              <div key={m.title} className="group relative overflow-hidden rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-2xl">
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${m.gradient} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${m.gradient} shadow-lg`}>
                    <m.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── How it works ── */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ШАГИ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Процесс</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Как оформить заказ
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="relative rounded-2xl bg-white p-6 ring-1 ring-neutral-100 hover:shadow-lg transition-shadow">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${s.gradient} text-lg font-extrabold text-white shadow-lg font-(family-name:--font-unbounded)`}>
                  {s.step}
                </span>
                <h3 className="mt-4 text-base font-bold text-neutral-900">{s.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 z-10 lg:block">
                    <ArrowRight className="h-5 w-5 text-neutral-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── For companies ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 lg:p-10">
            <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[8rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              B2B
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded)">
                  Для юридических лиц
                </h2>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Работаем с юрлицами и ИП по безналичному расчёту. Предоставляем полный пакет документов.
                  Возможна отсрочка платежа для постоянных клиентов.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Счёт", "Счёт-фактура", "ТОРГ-12", "УПД", "Договор"].map((doc) => (
                    <span key={doc} className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-300">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
              Остались вопросы по оплате?
            </h2>
            <p className="mt-3 text-neutral-400 max-w-md">
              Менеджер подберёт удобный вариант оплаты и ответит на все вопросы
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
