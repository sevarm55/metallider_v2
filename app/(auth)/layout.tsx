import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left — hero panel */}
      <div className="relative hidden w-1/2 lg:flex flex-col items-center justify-center overflow-hidden bg-neutral-950">
        {/* Subtle radial glow behind logo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]" />

        {/* 3D Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/images/auth.png"
            alt="МеталлЛидер"
            width={320}
            height={320}
            className="w-72 h-72 object-contain drop-shadow-[0_0_60px_rgba(249,115,22,0.15)]"
            priority
          />

          {/* Brand name */}
          <div className="mt-2 text-center">
            <h1 className="text-4xl font-black tracking-tight">
              <span className="text-white">МЕТАЛ</span>
              <span className="text-orange-500">ЛИДЕР</span>
            </h1>
            <p className="mt-2 text-sm tracking-widest uppercase text-neutral-500">
              Металлическое превосходство
            </p>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-xs text-neutral-600">
          <span>Доставка по Москве и МО</span>
          <span className="text-neutral-700">|</span>
          <span>Сертификаты ГОСТ</span>
          <span className="text-neutral-700">|</span>
          <span>Оптовые цены</span>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
