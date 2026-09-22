import { apiUser, apiError } from "@/backend/auth/api";
import { taskInput } from "@/backend/validation/tasks";
import { removeAttachment } from "@/backend/services/attachments";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { client } = await apiUser(request);
    const { id } = await params;
    const values = taskInput(await request.json());
    const { data, error } = await client
      .from("tasks")
      .update(values)
      .eq("id", id)
      .select()
      .single();
    if (error)
      throw new Error("Tarefa não encontrada ou alteração indisponível.");
    return Response.json(data);
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { client } = await apiUser(request);
    const { id } = await params;
    const { data: task, error: taskError } = await client
      .from("tasks")
      .select("id")
      .eq("id", id)
      .single();
    if (taskError || !task) throw new Error("Tarefa não encontrada.");
    const { data, error } = await client
      .from("task_attachments")
      .select("id")
      .eq("task_id", id);
    if (error)
      throw new Error(
        "Não foi possível conferir os anexos. Verifique a migração do banco.",
      );
    for (const attachment of data)
      await removeAttachment(client, attachment.id);
    const removed = await client
      .from("tasks")
      .delete()
      .eq("id", id)
      .select("id")
      .single();
    if (removed.error)
      throw new Error("Não foi possível excluir. Tente novamente.");
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
