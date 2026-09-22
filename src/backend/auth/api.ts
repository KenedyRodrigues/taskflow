import "server-only";
import { serverClient } from "../supabase/server";
export async function apiUser(request: Request) {
  if (!["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new Error("FORBIDDEN");
  }
  const client = await serverClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error("UNAUTHORIZED");
  return { client, user };
}
export function apiError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Operação indisponível.";
  const status =
    message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
  return Response.json(
    { error: status === 401 ? "Entre novamente para continuar." : message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
