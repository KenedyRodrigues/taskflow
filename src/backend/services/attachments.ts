import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
export const bucket = "task-attachments";
export async function removeAttachment(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("task_attachments")
    .select("id,path")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Anexo não encontrado.");
  const removed = await client.storage.from(bucket).remove([data.path]);
  if (removed.error)
    throw new Error("Não foi possível excluir o arquivo. Tente novamente.");
  const deleted = await client
    .from("task_attachments")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (deleted.error)
    throw new Error(
      "Arquivo removido, mas o registro permanece. Tente excluir novamente.",
    );
}
