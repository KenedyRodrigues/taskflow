import { requireUser } from "@/backend/auth/session";
import Statistics from "@/frontend/features/statistics/Statistics";
export default async function Page() {
  await requireUser();
  return <Statistics />;
}
