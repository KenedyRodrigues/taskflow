export function taskInput(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Tarefa inválida.");
  const data = input as Record<string, unknown>;
  if (
    typeof data.title !== "string" ||
    !data.title.trim() ||
    data.title.trim().length > 160
  )
    throw new Error("O título deve ter entre 1 e 160 caracteres.");
  if (
    data.description !== null &&
    data.description !== undefined &&
    (typeof data.description !== "string" || data.description.length > 2000)
  )
    throw new Error("A descrição deve ter até 2.000 caracteres.");
  if (!["todo", "doing", "done"].includes(String(data.status)))
    throw new Error("Status inválido.");
  return {
    title: data.title.trim(),
    description:
      typeof data.description === "string"
        ? data.description.trim() || null
        : null,
    status: String(data.status),
  };
}
