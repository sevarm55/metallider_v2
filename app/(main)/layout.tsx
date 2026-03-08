import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { FloatingCallback } from "@/components/shared/floating-callback";

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
    </>
  );
}
