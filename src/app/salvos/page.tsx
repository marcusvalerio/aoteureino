import type { Metadata } from "next";
import { Salvos } from "@/components/pages/Salvos";

export const metadata: Metadata = { title: "Salvos — AO TEU REINO" };

export default function Page() {
  return <Salvos />;
}
