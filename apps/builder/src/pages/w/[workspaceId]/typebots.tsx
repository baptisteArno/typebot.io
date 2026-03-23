import { useRouter } from "next/router";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";

export default function Page() {
  const router = useRouter();
  const workspaceId = router.query.workspaceId?.toString();

  if (!workspaceId) return null;

  return <DashboardPage />;
}
