"use client";

import { Header } from "./header-v2";
import { HeaderClassic } from "./header-classic";

const useNewHeader = process.env.NEXT_PUBLIC_NEW_HEADER === "true";

export function HeaderSwitcher() {
  return useNewHeader ? <Header /> : <HeaderClassic />;
}
