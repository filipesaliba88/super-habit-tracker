import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hábito+ — Rastreador de Hábitos",
  description: "Desenvolva disciplina e novos hábitos com o Hábito+.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50`}>{children}</body>
    </html>
  );
}
