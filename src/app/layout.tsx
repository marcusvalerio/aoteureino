import type { Metadata, Viewport } from "next";
import { Faculty_Glyphic, Geist } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { BOOT_SCRIPT } from "@/lib/boot";
import "./globals.css";

const faculty = Faculty_Glyphic({
  variable: "--font-faculty",
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AO TEU REINO — Devocional Evangélico",
  description: "Um devocional diário. Palavra, silêncio e caminho.",
  applicationName: "AO TEU REINO",
  appleWebApp: { capable: true, title: "Ao Teu Reino", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ebe5da",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${faculty.variable} ${geist.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
