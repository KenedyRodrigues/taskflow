import { apiUser, apiError } from "@/backend/auth/api";
import { attachmentInput, fileTypes } from "@/backend/validation/attachments";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const { client } = await apiUser(request);
    const { id } = await params;
    const { data, error } = await client
      .from("task_attachments")
      .select("*")
      .eq("task_id", id)
      .order("created_at");
    if (error)
      throw new Error("Anexos indisponíveis. Verifique a migração do banco.");
    return Response.json(data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    const { client, user } = await apiUser(request);
    const { id } = await params;
    const values = attachmentInput(await request.json());
    const { data: task, error: taskError } = await client
      .from("tasks")
      .select("id")
      .eq("id", id)
      .single();
    if (taskError || !task) throw new Error("Tarefa não encontrada.");
    const path = [
      user.id,
      id,
      crypto.randomUUID() + "." + fileTypes[values.mime_type].ext,
    ].join("/");
    const { data, error } = await client
      .from("task_attachments")
      .insert({ ...values, task_id: id, path })
      .select()
      .single();
    if (error)
      throw new Error(
        "Não foi possível reservar o anexo. Limite: 5 arquivos por tarefa.",
      );
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
