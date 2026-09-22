import { redirect } from "next/navigation";
import { serverClient } from "@/backend/supabase/server";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (code) redirect("/auth/callback?code=" + encodeURIComponent(code));
  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  redirect(user ? "/tasks" : "/login");
}
