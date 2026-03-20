import { Clock, Mail, MapPin, Phone, Send, MessageCircle } from "lucide-react";
import { Container } from "./container";
import { contactInfo } from "@/lib/mock-data";

export function TopBar() {
  return (
    <div className="bg-neutral-900 text-white/90 text-xs">
      <Container className="flex items-center justify-between py-1.5">
        <div className="hidden items-center gap-4 md:flex divide-x divide-white/20">
          <a
            href={`tel:${contactInfo.phoneRaw}`}
            className="flex items-center gap-1.5 pr-4 hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3" />
            {contactInfo.phone}
          </a>
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-1.5 pl-4 hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3" />
            {contactInfo.email}
          </a>
        </div>
        <div className="flex items-center gap-4 divide-x divide-white/20">
          <span className="flex items-center gap-1.5 pr-4">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="hidden lg:inline">{contactInfo.address},</span> {contactInfo.warehouse}
          </span>
          <span className="flex items-center gap-1.5 pl-4">
            <Clock className="h-3 w-3 text-primary" />
            {contactInfo.workingHours}
          </span>
          <div className="hidden items-center gap-2 pl-4 sm:flex">
            <a href="https://t.me/+74957605549" target="_blank" className="hover:text-primary transition-colors" aria-label="Telegram">
              <Send className="h-3 w-3" />
            </a>
            <a href="https://wa.me/74957605549" target="_blank" className="hover:text-primary transition-colors" aria-label="WhatsApp">
              <MessageCircle className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
