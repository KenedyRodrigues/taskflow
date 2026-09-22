import { apiUser, apiError } from "@/backend/auth/api";
import { taskInput } from "@/backend/validation/tasks";
export async function GET(request: Request) {
  try {
    const { client } = await apiUser(request);
    const tasks = [];
    for (let start = 0; ; start += 1000) {
      const { data, error } = await client
        .from("tasks")
        .select("id,title,description,status,created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(start, start + 999);
      if (error) throw new Error("Não foi possível carregar as tarefas.");
      tasks.push(...data);
      if (data.length < 1000) break;
    }
    return Response.json(tasks, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    const { client } = await apiUser(request);
    const values = taskInput(await request.json());
    const { data, error } = await client
      .from("tasks")
      .insert(values)
      .select()
      .single();
    if (error) throw new Error("Não foi possível criar a tarefa.");
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
