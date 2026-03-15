import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Публичная оферта — МеталлЛидер",
  description: "Договор публичной оферты интернет-магазина металлопроката ООО «МеталлЛидер».",
};

export default function OfferPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-800">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(4rem,12vw,10rem)] font-black uppercase leading-none text-white/3 font-(family-name:--font-unbounded)">
          ОФЕРТА
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />
        <Container className="relative py-10 lg:py-14">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-white">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-white">Публичная оферта</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
                Публичная оферта
              </h1>
              <p className="mt-1 text-sm text-neutral-400">Дата обновления: 10 марта 2026 г.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-3xl prose prose-neutral prose-sm prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600">
            <h2>1. Общие положения</h2>
            <p>
              Настоящий документ является официальным предложением (публичной офертой) ООО «МеталлЛидер»
              (далее — «Продавец») для любого физического или юридического лица (далее — «Покупатель»)
              заключить договор купли-продажи товаров на условиях, изложенных ниже.
            </p>
            <p>
              В соответствии со ст. 437 Гражданского кодекса РФ данный документ является публичной офертой.
              Оформление заказа на сайте metallider.ru означает полное и безоговорочное принятие (акцепт)
              условий настоящей оферты.
            </p>

            <h2>2. Предмет договора</h2>
            <p>
              Продавец обязуется передать Покупателю металлопрокат и сопутствующие товары (далее — «Товар»)
              в ассортименте, количестве и по ценам, указанным в оформленном Покупателем заказе,
              а Покупатель обязуется принять и оплатить Товар.
            </p>

            <h2>3. Оформление заказа</h2>
            <ul>
              <li>Покупатель оформляет заказ через сайт metallider.ru или по телефону +7 (495) 760-55-39</li>
              <li>После оформления заказа менеджер Продавца связывается с Покупателем для подтверждения</li>
              <li>Заказ считается подтверждённым после согласования ассортимента, количества, стоимости и сроков</li>
              <li>Продавец вправе отказать в выполнении заказа при отсутствии Товара на складе</li>
            </ul>

            <h2>4. Цены и оплата</h2>
            <ul>
              <li>Цены на Товар указаны на сайте в российских рублях и включают НДС (при наличии)</li>
              <li>Продавец вправе изменять цены в одностороннем порядке до момента подтверждения заказа</li>
              <li>Оплата производится: наличными, банковской картой, безналичным расчётом</li>
              <li>Для юридических лиц возможна оплата по выставленному счёту</li>
            </ul>

            <h2>5. Доставка</h2>
            <ul>
              <li>Доставка осуществляется по Москве и Московской области</li>
              <li>Стоимость и сроки доставки согласуются при подтверждении заказа</li>
              <li>Самовывоз со склада: Реутов, ш. Автомагистраль Москва — Нижний Новгород, 1</li>
              <li>При получении Покупатель обязан проверить Товар на соответствие заказу и отсутствие повреждений</li>
            </ul>

            <h2>6. Качество товара</h2>
            <p>
              Продавец гарантирует, что Товар соответствует действующим стандартам качества (ГОСТ, ТУ)
              и сопровождается необходимой документацией (сертификаты, паспорта качества).
            </p>

            <h2>7. Возврат и обмен</h2>
            <ul>
              <li>Возврат и обмен Товара надлежащего качества — в течение 14 дней с момента получения</li>
              <li>Товар должен сохранить товарный вид, потребительские свойства и заводскую маркировку</li>
              <li>Товар, изготовленный по индивидуальным размерам (резка в размер), возврату не подлежит</li>
              <li>Возврат Товара ненадлежащего качества — в соответствии с законодательством РФ</li>
            </ul>

            <h2>8. Ответственность сторон</h2>
            <p>
              Стороны несут ответственность за неисполнение или ненадлежащее исполнение своих обязательств
              в соответствии с действующим законодательством Российской Федерации.
            </p>
            <p>
              Продавец не несёт ответственности за ущерб, причинённый Покупателю вследствие ненадлежащего
              использования Товара.
            </p>

            <h2>9. Форс-мажор</h2>
            <p>
              Стороны освобождаются от ответственности за неисполнение обязательств, если оно
              вызвано обстоятельствами непреодолимой силы (форс-мажор): стихийные бедствия,
              военные действия, запретительные акты государственных органов и иные обстоятельства,
              не зависящие от воли сторон.
            </p>

            <h2>10. Разрешение споров</h2>
            <p>
              Все споры разрешаются путём переговоров. При невозможности достижения соглашения
              спор передаётся на рассмотрение в суд по месту нахождения Продавца в соответствии
              с законодательством РФ.
            </p>

            <h2>11. Реквизиты Продавца</h2>
            <ul>
              <li>ООО «МеталлЛидер»</li>
              <li>ИНН: 7712345678</li>
              <li>ОГРН: 1177746123456</li>
              <li>Адрес: Реутов, ш. Автомагистраль Москва — Нижний Новгород, 1</li>
              <li>Телефон: +7 (495) 760-55-39</li>
              <li>Email: info@metallider.ru</li>
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
