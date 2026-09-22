import type { Metadata } from "next";
import "@/frontend/styles/globals.css";
export const metadata: Metadata = {
  title: "TaskFlow — Tarefas pessoais",
  description: "Organize suas tarefas pessoais com segurança.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
