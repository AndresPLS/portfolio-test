import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/**
 * Fuentes cargadas con `next/font/google`: Next las descarga en build y las
 * auto-aloja (no hay petición en runtime a Google → mejor rendimiento y privacidad).
 * Cada una expone una variable CSS que luego mapeamos a Tailwind en globals.css.
 */

// Cuerpo de texto — sustituta libre de "Akkurat Pro" (neo-grotesca).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Titulares / display — sustituta libre de "Px Grotesk".
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
