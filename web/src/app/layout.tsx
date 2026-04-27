import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GigTim — Marketplace de Zilieri",
  description:
    "Platformă de gig-economy pentru piața HoReCa din România. Conectăm lucrătorii zilieri cu afacerile locale.",
  keywords: ["zilieri", "HoReCa", "România", "gig economy", "muncă temporară"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
