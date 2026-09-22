import { redirect } from "next/navigation";
import { serverClient } from "@/backend/supabase/server";
import Login from "@/frontend/features/auth/Login";
export default async function Page() {
  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) redirect("/tasks");
  return <Login />;
}
