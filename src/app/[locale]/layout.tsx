import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DateProvider } from "@/lib/stores/DateContext";
import { Toaster } from "sonner";
import { ReactNode } from "react";
import initTranslations from "../i18n";
import TranslationsProvider from "@/lib/stores/TranslationsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budget Hero",
  description: "Gamifiy your economy",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const i18nNamespaces = ["common", "auth"];
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary`}
      >
        <TranslationsProvider
          resources={resources}
          locale={locale}
          namespaces={i18nNamespaces}
        >
          <DateProvider>
            <Toaster />
            {children}
          </DateProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
