import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "No Fluke Store",
    template: "%s · No Fluke Store",
  },
  description:
    "Perfumes, ropa, t-shirts y zapatos. Pide por WhatsApp, entrega en toda República Dominicana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="bg-neutral-50 text-neutral-900 min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
