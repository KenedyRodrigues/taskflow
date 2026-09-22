import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "../supabase/server";
export async function requireUser() {
  const client = await serverClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  return user;
}
