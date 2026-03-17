import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const workspaceId = router.query.workspaceId?.toString();

  if (!workspaceId) return null;

  return null;
}
