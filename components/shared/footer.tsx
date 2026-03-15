import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Container } from "./container";
import { contactInfo } from "@/lib/mock-data";

const catalogLinks = [
  { label: "Трубы профильные", href: "/catalog/truby-profilnye-kvadrat" },
  { label: "Арматура", href: "/catalog/armatura" },
  { label: "Листы стальные", href: "/catalog/listy" },
  { label: "Уголок", href: "/catalog/ugolok" },
  { label: "Швеллер", href: "/catalog/shveller" },
  { label: "Профнастил", href: "/catalog/profnastil" },
  { label: "Метизы", href: "/catalog/samorezy" },
  { label: "Все категории", href: "/catalog" },
];

const infoLinks = [
  { label: "Доставка", href: "/delivery" },
  { label: "Оплата", href: "/payment" },
  { label: "О компании", href: "/about" },
  { label: "Контакты", href: "/contacts" },
  { label: "Акции", href: "/promotions" },
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Публичная оферта", href: "/offer" },
];

export function Footer() {
  return (
    <footer className="border-t bg-neutral-900 text-gray-300">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Catalog */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Каталог
          </h3>
          <ul className="space-y-2.5">
            {catalogLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Информация
          </h3>
          <ul className="space-y-2.5">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Контакты
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href={`tel:${contactInfo.phoneRaw}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {contactInfo.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {contactInfo.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {contactInfo.address}, {contactInfo.warehouse}
              </span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0" />
              {contactInfo.workingHours}
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
            Мы в соцсетях
          </h3>
          <div className="flex gap-3">
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-primary hover:text-white transition-colors text-sm font-bold"
              aria-label="ВКонтакте"
            >
              VK
            </a>
          </div>
          <div className="mt-6">
            <p className="text-sm font-black text-white">
              <span>МЕТАЛЛ</span>
              <span className="text-primary">ЛИДЕР</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Металлопрокат оптом и в розницу
            </p>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-xs text-gray-400 sm:flex-row">
          <p>&copy; 2026 МеталлЛидер. Все права защищены.</p>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Политика конфиденциальности
          </Link>
        </Container>
      </div>
    </footer>
  );
}
