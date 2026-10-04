import type { Metadata } from "next";
import { Palavra } from "@/components/pages/Palavra";

export const metadata: Metadata = { title: "Palavra — AO TEU REINO" };

export default function Page() {
  return <Palavra />;
}
