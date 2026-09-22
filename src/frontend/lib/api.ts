export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("Sessão encerrada.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Não foi possível concluir a operação.");
  return data as T;
}
