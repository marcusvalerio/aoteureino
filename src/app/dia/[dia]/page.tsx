import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/devotional/Reader";
import { displayTitle, getDevotional } from "@/content";
import { DAYS_IN_MONTH } from "@/lib/dates";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: DAYS_IN_MONTH }, (_, i) => ({ dia: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps<"/dia/[dia]">): Promise<Metadata> {
  const { dia } = await params;
  const d = getDevotional(Number(dia));
  const title = d ? displayTitle(d.title) : `${dia} de outubro`;
  return { title: `${title} — AO TEU REINO` };
}

export default async function Page({ params }: PageProps<"/dia/[dia]">) {
  const { dia } = await params;
  const n = Number(dia);
  if (!Number.isInteger(n) || n < 1 || n > DAYS_IN_MONTH) notFound();
  return <Reader day={n} />;
}
