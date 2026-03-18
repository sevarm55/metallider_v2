import { Suspense } from "react";
import { HeaderSwitcher } from "@/components/shared/header-switcher";
import { Footer } from "@/components/shared/footer";
import { FloatingCallback } from "@/components/shared/floating-callback";
import { ReviewsWidget } from "@/components/shared/reviews-widget";
import { AiChat } from "@/components/shared/ai-chat";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { RouteLoader } from "@/components/shared/route-loader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteLoader />
      </Suspense>
      <HeaderSwitcher />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingCallback />
      <ReviewsWidget />
      <AiChat />
      <CookieConsent />
    </>
  );
}
