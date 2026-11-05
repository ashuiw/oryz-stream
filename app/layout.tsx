import type { Metadata, Viewport } from "next";
import { Archivo, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import BackToTop from "@/components/BackToTop";
import WhatsNewModal from "@/components/WhatsNewModal";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  axes: ["wdth"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#110f0b",
};

export const metadata: Metadata = {
  title: { default: "Oryz — movies, shows and anime", template: "%s · Oryz" },
  description: "Discover movies, shows and anime with Oryz.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Oryz",
    description: "Discover movies, shows and anime with Oryz.",
    images: [{ url: "/brand/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/brand/og.jpg"] },
  appleWebApp: {
    capable: true,
    title: "Oryz",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${hanken.variable}`}>
      <body>
        <ServiceWorkerRegistration />
        <AuthProvider>{children}</AuthProvider>
        <BackToTop />
        <WhatsNewModal />
      </body>
    </html>
  );
}
