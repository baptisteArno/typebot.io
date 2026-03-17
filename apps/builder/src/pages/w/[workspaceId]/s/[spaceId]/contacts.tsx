import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const workspaceId = router.query.workspaceId?.toString();
  const spaceId = router.query.spaceId?.toString();

  if (!workspaceId || !spaceId) return null;

  return null;
}
