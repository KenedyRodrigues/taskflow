export type Status = "todo" | "doing" | "done";
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  created_at: string;
};
export type Attachment = {
  id: string;
  task_id: string;
  name: string;
  mime_type: string;
  size: number;
  path: string;
  created_at: string;
};
export const labels: Record<Status, string> = {
  todo: "A fazer",
  doing: "Em andamento",
  done: "Concluída",
};
export function errorMessage(error: unknown): string {
  const text =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : "";
  if (/Invalid login credentials/i.test(text))
    return "E-mail ou senha incorretos.";
  if (/Email not confirmed/i.test(text))
    return "Confirme seu e-mail antes de entrar.";
  if (/rate limit/i.test(text)) return "Muitas tentativas. Aguarde um momento.";
  return text || "Não foi possível concluir. Tente novamente.";
}
