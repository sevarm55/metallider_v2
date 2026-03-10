// import { Header } from "@/components/shared/header";
import {Header} from '@/components/shared/header-v2'
import { Footer } from "@/components/shared/footer";
import { FloatingCallback } from "@/components/shared/floating-callback";
import { AiChat } from "@/components/shared/ai-chat";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingCallback />
      <AiChat />
    </>
  );
}
