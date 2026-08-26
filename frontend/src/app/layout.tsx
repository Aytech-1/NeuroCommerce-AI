import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProvider } from "@/providers/app-provider";

export const metadata: Metadata = {
  title: "NeuroCommerce AI — Next-Gen Intelligent E-Commerce",
  description: "Enterprise e-commerce platform powered by autonomous AI engines, real-time analytics, and modular monolith backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
