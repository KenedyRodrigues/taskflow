import { requireUser } from "@/backend/auth/session";
import Shell from "@/frontend/components/Shell";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <Shell email={user.email ?? ""}>{children}</Shell>;
}
