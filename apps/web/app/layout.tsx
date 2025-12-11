import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marketplace - Buy & Sell Locally",
  description: "Modern marketplace inspired by Facebook Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body className={`${inter.className} w-full min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
