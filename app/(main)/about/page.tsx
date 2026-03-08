import type { Metadata } from "next";
import Link from "next/link";
import { Award, Users, Truck, ShieldCheck, Target, TrendingUp, Phone } from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { contactInfo } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "О компании — МеталлЛидер",
  description: "МеталлЛидер — надёжный поставщик металлопроката в Москве и МО.",
};

const stats = [
  { value: "10+", label: "лет на рынке" },
  { value: "336+", label: "наименований" },
  { value: "5 000+", label: "довольных клиентов" },
  { value: "24ч", label: "срочная доставка" },
];

const values = [
  { icon: ShieldCheck, title: "Качество", desc: "Работаем только с проверенными производителями: Северсталь, ММК, НЛМК. Вся продукция сертифицирована." },
  { icon: Target, title: "Надёжность", desc: "Точные сроки поставки. Свой склад с постоянным наличием ходовых позиций." },
  { icon: Users, title: "Клиентоориентированность", desc: "Индивидуальный подход к каждому клиенту. Персональный менеджер для постоянных покупателей." },
  { icon: TrendingUp, title: "Лучшие цены", desc: "Прямые поставки от производителей. Конкурентные цены для опта и розницы." },
];

export default function AboutPage() {
  return (
    <Container className="py-6 lg:py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>О компании</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          О компании <span className="text-primary">МеталлЛидер</span>
        </h1>
        <div className="mt-6 max-w-3xl space-y-4 text-neutral-600 leading-relaxed">
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
      </div>

      {/* Stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-white p-6 text-center transition-shadow hover:shadow-md">
            <div className="text-3xl font-extrabold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Our values */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Наши принципы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">{v.title}</h3>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Producers */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Наши поставщики</h2>
        <div className="rounded-2xl border bg-gradient-to-r from-neutral-50 to-neutral-100/50 p-6">
          <p className="text-sm text-neutral-600 leading-relaxed">
            Мы работаем напрямую с крупнейшими металлургическими предприятиями России. Это позволяет
            гарантировать подлинность и качество каждой единицы продукции.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Северсталь", "ММК", "НЛМК", "ЕВРАЗ", "Мечел", "ТМК", "ОМК", "ЧТПЗ"].map((name) => (
              <span key={name} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm ring-1 ring-neutral-100">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Why us */}
      <div className="mb-12 rounded-2xl bg-primary/5 border border-primary/10 p-6 lg:p-8">
        <h2 className="text-xl font-bold mb-4">Почему выбирают нас</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Более 336 наименований в наличии на складе",
            "Сертифицированная продукция с паспортами качества",
            "Резка металла в размер по вашим чертежам",
            "Собственный автопарк — доставка в день заказа",
            "Работаем с физ. и юр. лицами, НДС/без НДС",
            "Персональный менеджер для каждого клиента",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Award className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span className="text-sm text-neutral-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-neutral-900 p-8 text-center text-white">
        <h2 className="text-xl font-bold">Готовы к сотрудничеству?</h2>
        <p className="mt-2 text-sm text-white/70">Свяжитесь с нами — обсудим условия и подберём металлопрокат</p>
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="lg">
            <a href={`tel:${contactInfo.phoneRaw}`} className="gap-2">
              <Phone className="h-4 w-4" />
              {contactInfo.phone}
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            <Link href="/contacts">Контакты</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
