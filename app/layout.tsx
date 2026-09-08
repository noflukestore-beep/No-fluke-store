import type { Metadata, Viewport } from "next";
import { Geist, Syne } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "No Fluke Store",
    template: "%s · No Fluke Store",
  },
  description:
    "El estilo no es suerte. Perfumes, ropa, t-shirts y zapatos que hablan por ti. Pide por WhatsApp, entrega en toda República Dominicana.",
};

export const viewport: Viewport = {
  themeColor: "#0a1310",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
