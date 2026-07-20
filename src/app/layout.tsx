import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HomeNest — Smart Home Solutions",
    template: "%s | HomeNest",
  },
  description:
    "We help people solve everyday household problems with smart, affordable, and beautifully designed products. We don't sell products — we sell solutions.",
  keywords: ["smart home solutions", "household problems", "kitchen organization", "bathroom storage", "home organization"],
  openGraph: {
    title: "HomeNest — Smart Home Solutions",
    description:
      "We help people solve everyday household problems with smart, affordable, and beautifully designed products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8]">
        <TooltipProvider>
          <Navbar />
          {/* No top padding here — pages that need it (non-hero) apply their own */}
          <main className="flex-1">{children}</main>
          <Footer />
        </TooltipProvider>
      </body>
    </html>
  );
}
