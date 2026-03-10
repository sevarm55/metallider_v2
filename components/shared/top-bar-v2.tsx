import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Container } from "./container";
import { contactInfo } from "@/lib/mock-data";

export function TopBar() {
  return (
    <div className="bg-neutral-950 text-white/70 text-[11px] border-b border-white/5">
      <Container className="flex items-center justify-between py-2">
        <div className="hidden items-center gap-5 md:flex">
          <a
            href={`tel:${contactInfo.phoneRaw}`}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Phone className="h-3 w-3 text-primary/60" />
            {contactInfo.phone}
          </a>
          <span className="h-3 w-px bg-white/10" />
          <a
            href={`mailto:${contactInfo.email}`}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3 text-primary/60" />
            {contactInfo.email}
          </a>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary/60" />
            <span className="hidden lg:inline">{contactInfo.address},</span> {contactInfo.warehouse}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-primary/60" />
            {contactInfo.workingHours}
          </span>
          <span className="hidden sm:flex h-3 w-px bg-white/10" />
          <div className="hidden items-center gap-3 sm:flex">
            <a href="#" className="hover:text-primary transition-colors" aria-label="Telegram">
              <Send className="h-3 w-3" />
            </a>
            <a href="#" className="hover:text-primary transition-colors text-[10px] font-bold" aria-label="VK">
              VK
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
