import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: "myBaZi",
  title: {
    default: "myBaZi — ดวงจีนครบวงจร",
    template: "%s | myBaZi",
  },
  description: "แอปพลิเคชันทำนายดวงจีนครบวงจร ปาจื้อ ปฏิทินมงคล ฉีเหมือน และ AI ผู้ช่วยทำนาย",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "myBaZi",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/assets/pwa/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/pwa/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/pwa/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "myBaZi — ดวงจีนครบวงจร",
    description: "ปาจื้อ ปฏิทินมงคล ฉีเหมือน และเทียนจี AI ใน PWA เดียว",
    siteName: "myBaZi",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/assets/pwa/og-image.png",
        width: 1200,
        height: 630,
        alt: "myBaZi porcelain jade PWA dashboard",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f0df" },
    { media: "(prefers-color-scheme: dark)", color: "#14352f" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
