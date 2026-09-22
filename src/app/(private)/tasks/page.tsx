import { requireUser } from "@/backend/auth/session";
import Tasks from "@/frontend/features/tasks/Tasks";
export default async function Page() {
  await requireUser();
  return <Tasks />;
}
