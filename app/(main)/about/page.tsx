import type { Metadata } from "next";
import Link from "next/link";
import { Award, Users, ShieldCheck, Target, TrendingUp, Phone, CheckCircle2, Factory } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "О компании — МеталлЛидер",
  description: "МеталлЛидер — надёжный поставщик металлопроката в Москве и МО. Более 336 наименований, 10+ лет на рынке.",
};

const stats = [
  { value: "10+", label: "лет на рынке", gradient: "from-primary to-orange-600" },
  { value: "336+", label: "наименований", gradient: "from-blue-500 to-indigo-600" },
  { value: "5 000+", label: "довольных клиентов", gradient: "from-emerald-500 to-teal-600" },
  { value: "24ч", label: "срочная доставка", gradient: "from-violet-500 to-purple-600" },
];

const values = [
  { icon: ShieldCheck, title: "Качество", desc: "Работаем только с проверенными производителями: Северсталь, ММК, НЛМК. Вся продукция сертифицирована.", gradient: "from-primary to-orange-600" },
  { icon: Target, title: "Надёжность", desc: "Точные сроки поставки. Свой склад с постоянным наличием ходовых позиций.", gradient: "from-blue-500 to-indigo-600" },
  { icon: Users, title: "Клиентоориентированность", desc: "Индивидуальный подход к каждому клиенту. Персональный менеджер для постоянных покупателей.", gradient: "from-emerald-500 to-teal-600" },
  { icon: TrendingUp, title: "Лучшие цены", desc: "Прямые поставки от производителей. Конкурентные цены для опта и розницы.", gradient: "from-violet-500 to-purple-600" },
];

const suppliers = ["Северсталь", "ММК", "НЛМК", "ЕВРАЗ", "Мечел", "ТМК", "ОМК", "ЧТПЗ"];

const whyUs = [
  "Более 336 наименований в наличии на складе",
  "Сертифицированная продукция с паспортами качества",
  "Резка металла в размер по вашим чертежам",
  "Собственный автопарк — доставка в день заказа",
  "Работаем с физ. и юр. лицами, НДС/без НДС",
  "Персональный менеджер для каждого клиента",
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-neutral-50">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          О НАС
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--color-primary),0.05),transparent_40%)]" />

        <Container className="relative py-10 lg:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">О компании</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2.5 mb-3">
            <span className="block h-7 w-1 rounded-full bg-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">О компании</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 md:text-4xl lg:text-5xl font-(family-name:--font-unbounded)">
            Металл<span className="text-primary">Лидер</span>
          </h1>

          <div className="mt-6 max-w-2xl space-y-4 text-neutral-400 leading-relaxed">
            <p>
              <strong className="text-neutral-900">МеталлЛидер</strong> — ваш надёжный поставщик металлопроката
              в Москве и Московской области. Мы специализируемся на продаже трубного проката, сортового металла,
              листовой стали, кровельных и фасадных материалов, а также метизов и фурнитуры.
            </p>
            <p>
              Компания работает как с розничными покупателями, так и с крупными строительными организациями,
              производственными предприятиями и оптовыми базами. Наш ассортимент включает более 336 наименований
              продукции от ведущих российских производителей.
            </p>
            <p>
              Мы гарантируем конкурентные цены благодаря прямым контрактам с заводами-изготовителями,
              собственному складу с постоянным наличием востребованных позиций и отлаженной логистике.
            </p>
          </div>
        </Container>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, idx) => (
              <div key={s.label} className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center transition-all duration-300 hover:shadow-2xl">
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[5rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br ${s.gradient} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
                <div className="relative z-10">
                  <div className={`text-4xl font-extrabold bg-linear-to-br ${s.gradient} bg-clip-text text-transparent font-(family-name:--font-unbounded)`}>
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm text-neutral-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Our values ── */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ЦЕННОСТИ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Философия</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Наши принципы
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-neutral-100 transition-all hover:shadow-lg hover:ring-primary/20">
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br ${v.gradient} opacity-5 blur-xl group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10 flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${v.gradient} shadow-lg`}>
                    <v.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">{v.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Suppliers ── */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 lg:p-10">
            <span className="pointer-events-none absolute -right-4 -top-6 select-none text-[8rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
              ПАРТН
            </span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(var(--color-primary),0.08),transparent_50%)]" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-orange-600 shadow-lg">
                <Factory className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900 font-(family-name:--font-unbounded)">
                  Наши поставщики
                </h2>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Мы работаем напрямую с крупнейшими металлургическими предприятиями России. Это позволяет
                  гарантировать подлинность и качество каждой единицы продукции.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {suppliers.map((name) => (
                    <span key={name} className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-300">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why us ── */}
      <section className="bg-neutral-50 py-12 lg:py-16">
        <Container>
          <div className="relative mb-10 overflow-hidden">
            <span className="pointer-events-none absolute top-0 left-0 select-none text-[clamp(4rem,10vw,8rem)] font-extrabold uppercase leading-none text-neutral-200/60 font-(family-name:--font-unbounded)">
              ПОЧЕМУ
            </span>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="block h-7 w-1 rounded-full bg-orange-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-orange-500">Преимущества</span>
              </div>
              <h2 className="text-3xl font-extrabold text-neutral-900 md:text-4xl font-(family-name:--font-unbounded)">
                Почему выбирают нас
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {whyUs.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-neutral-100 hover:shadow-lg transition-shadow">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-neutral-700 leading-relaxed">{item}</span>
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
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
              Готовы к сотрудничеству?
            </h2>
            <p className="mt-3 text-neutral-400 max-w-md">
              Свяжитесь с нами — обсудим условия и подберём металлопрокат для вашего проекта
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
