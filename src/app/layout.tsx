import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CRM",
  description: "AI-powered CRM for luxury real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, outfit.variable)}>
      <body className="font-sans">
        <Sidebar />
        <div className="pl-72 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-8 bg-[#f8fafc]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
