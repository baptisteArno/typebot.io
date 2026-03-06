import { useRouter } from "next/router";
import { ContactsPageContent } from "@/features/contacts/ContactsPageContent";

export default function Page() {
  const router = useRouter();
  const workspaceId = router.query.workspaceId?.toString();

  if (!workspaceId) return null;

  return <ContactsPageContent workspaceId={workspaceId} />;
}
