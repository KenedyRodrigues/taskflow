import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "TaskFlow — Um passo de cada vez",
  description: "Seu espaço para organizar tarefas e dar lugar ao que importa.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
