import type { Metadata } from "next";
import { Jornada } from "@/components/pages/Jornada";

export const metadata: Metadata = { title: "Jornada — AO TEU REINO" };

export default function Page() {
  return <Jornada />;
}
