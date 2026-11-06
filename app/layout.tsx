import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { ToastProvider } from "@/components/ui/Toast";
import BackToTop from "@/components/BackToTop";
import WhatsNewModal from "@/components/WhatsNewModal";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#110f0b",
};

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  applicationName: "Oryz",
  title: { default: "Oryz — movies, shows and anime", template: "%s · Oryz" },
  description: "Oryz is a fast, clean place to discover movies, TV shows and anime, save favorites and pick up where you left off.",
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
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <ServiceWorkerRegistration />
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
          <BackToTop />
          <WhatsNewModal />
        </ToastProvider>
      </body>
    </html>
  );
}
