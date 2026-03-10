import Link from "next/link";
import { Container } from "@/components/shared/container";

export const metadata = {
  title: "Страница не найдена — МеталлЛидер",
  description: "Запрашиваемая страница не найдена. Вернитесь на главную или перейдите в каталог товаров.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-[8rem] font-black leading-none text-neutral-100 font-(family-name:--font-unbounded)">
        404
      </span>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900 font-(family-name:--font-unbounded)">
        Страница не найдена
      </h1>
      <p className="mt-3 max-w-md text-neutral-500">
        Возможно, страница была удалена или вы перешли по неверной ссылке.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-primary transition-colors"
        >
          На главную
        </Link>
        <Link
          href="/catalog"
          className="rounded-xl border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Каталог товаров
        </Link>
      </div>
    </Container>
  );
}
