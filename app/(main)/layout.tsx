import { HeaderSwitcher } from "@/components/shared/header-switcher";
import { Footer } from "@/components/shared/footer";
import { FloatingCallback } from "@/components/shared/floating-callback";
import { AiChat } from "@/components/shared/ai-chat";
import { CookieConsent } from "@/components/shared/cookie-consent";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderSwitcher />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingCallback />
      <AiChat />
      <CookieConsent />
    </>
  );
}
