import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { withBasePath } from "@/lib/basePath";
import { SwRegister } from "@/components/SwRegister";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], display: "swap" });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Chess Club Kit", template: "%s · Chess Club Kit" },
  applicationName: "Chess Club Kit",
  description: "Ready-to-run chess club lessons for teachers, with an iPad student mode and printable worksheets.",
  manifest: withBasePath("/manifest.webmanifest"),
  icons: { icon: withBasePath("/icon.svg"), apple: withBasePath("/icon.svg") },
  appleWebApp: { capable: true, title: "Chess Club", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2f6b4f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SwRegister />
        <div className="min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">{children}</div>
      </body>
    </html>
  );
}
