import Link from "next/link";

export const metadata = {
  title: "404 — Страница не найдена | МеталлЛидер",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      {/* Large decorative 404 */}
      <span className="select-none text-[clamp(8rem,25vw,16rem)] font-black leading-none text-neutral-200 font-(family-name:--font-unbounded)">
        404
      </span>

      {/* Heading */}
      <h1 className="-mt-4 text-2xl font-extrabold text-neutral-900 md:text-3xl lg:text-4xl font-(family-name:--font-unbounded)">
        Страница не найдена
      </h1>

      {/* Subtext */}
      <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-500">
        К сожалению, запрашиваемая страница не существует или была перемещена
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-neutral-900 px-6 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
        >
          На главную
        </Link>
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-300 px-6 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Каталог
        </Link>
      </div>
    </div>
  );
}
