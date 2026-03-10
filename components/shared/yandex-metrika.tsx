"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!METRIKA_ID) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    // @ts-expect-error - ym is injected by Yandex Metrika script
    if (typeof window.ym === "function") {
      // @ts-expect-error
      window.ym(Number(METRIKA_ID), "hit", url);
    }
  }, [pathname, searchParams]);

  if (!METRIKA_ID) return null;

  return (
    <Script
      id="yandex-metrika"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r)return;}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          ym(${METRIKA_ID}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer"
          });
        `,
      }}
    />
  );
}
