export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/container";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — МеталлЛидер",
  description: "Политика конфиденциальности и обработки персональных данных ООО «МеталлЛидер».",
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-50">
        <span className="pointer-events-none absolute top-4 left-0 select-none text-[clamp(4rem,12vw,10rem)] font-black uppercase leading-none text-neutral-100 font-(family-name:--font-unbounded)">
          PRIVACY
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(var(--color-primary),0.08),transparent_60%)]" />
        <Container className="relative py-10 lg:py-14">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/" className="text-neutral-400 hover:text-neutral-900">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-neutral-600" />
              <BreadcrumbItem><BreadcrumbPage className="text-neutral-900">Политика конфиденциальности</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-orange-600 shadow-lg">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
                Политика конфиденциальности
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
              Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки
              и защиты персональных данных пользователей сайта metallider.ru (далее — «Сайт»),
              принадлежащего ООО «МеталлЛидер» (далее — «Оператор»).
            </p>
            <p>
              Используя Сайт, вы соглашаетесь с условиями данной Политики. Если вы не согласны
              с условиями, пожалуйста, не используйте Сайт.
            </p>

            <h2>2. Какие данные мы собираем</h2>
            <p>Мы можем собирать следующие персональные данные:</p>
            <ul>
              <li>Имя, фамилия</li>
              <li>Номер телефона</li>
              <li>Адрес электронной почты</li>
              <li>Адрес доставки</li>
              <li>Данные о заказах и покупках</li>
              <li>IP-адрес, данные о браузере и устройстве (cookies, аналитика)</li>
            </ul>

            <h2>3. Цели обработки данных</h2>
            <p>Персональные данные обрабатываются в следующих целях:</p>
            <ul>
              <li>Оформление и выполнение заказов</li>
              <li>Обратная связь и консультации</li>
              <li>Информирование об акциях и специальных предложениях (с согласия пользователя)</li>
              <li>Улучшение качества обслуживания и работы Сайта</li>
              <li>Выполнение требований законодательства РФ</li>
            </ul>

            <h2>4. Правовые основания</h2>
            <p>
              Обработка персональных данных осуществляется в соответствии с Федеральным законом
              от 27.07.2006 № 152-ФЗ «О персональных данных» на основании:
            </p>
            <ul>
              <li>Согласия субъекта персональных данных</li>
              <li>Необходимости исполнения договора</li>
              <li>Необходимости выполнения юридических обязательств Оператора</li>
            </ul>

            <h2>5. Хранение и защита данных</h2>
            <p>
              Оператор принимает необходимые организационные и технические меры для защиты
              персональных данных от неправомерного доступа, уничтожения, изменения, блокирования,
              копирования, распространения.
            </p>
            <p>
              Персональные данные хранятся не дольше, чем этого требуют цели обработки,
              если иное не предусмотрено законодательством.
            </p>

            <h2>6. Передача данных третьим лицам</h2>
            <p>Оператор может передавать персональные данные третьим лицам только в случаях:</p>
            <ul>
              <li>С согласия пользователя</li>
              <li>Для доставки заказа (транспортные компании)</li>
              <li>Для обработки платежей (платёжные системы)</li>
              <li>По требованию законодательства РФ</li>
            </ul>

            <h2>7. Файлы cookie</h2>
            <p>
              Сайт использует файлы cookie для обеспечения корректной работы, аналитики
              и улучшения пользовательского опыта. Вы можете отключить cookies в настройках
              браузера, однако это может повлиять на функциональность Сайта.
            </p>

            <h2>8. Права пользователя</h2>
            <p>Вы имеете право:</p>
            <ul>
              <li>Запросить информацию об обрабатываемых персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>Обратиться в Роскомнадзор в случае нарушения ваших прав</li>
            </ul>

            <h2>9. Контактная информация</h2>
            <p>
              По вопросам, связанным с обработкой персональных данных, обращайтесь:
            </p>
            <ul>
              <li>ООО «МеталлЛидер»</li>
              <li>Адрес: Реутов, ш. Автомагистраль Москва — Нижний Новгород, 1</li>
              <li>Телефон: +7 (495) 760-55-39</li>
              <li>Email: info@metallider.ru</li>
            </ul>

            <h2>10. Изменения</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная версия
              размещена на данной странице. Продолжая пользоваться Сайтом после внесения
              изменений, вы соглашаетесь с обновлённой Политикой.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
