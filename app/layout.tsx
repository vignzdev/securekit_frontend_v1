import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore: side-effect import for global CSS without module declaration
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Securekit",
  description: "Securekit.dev - Email and IP validation tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
