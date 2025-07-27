import { TypebotProvider } from "@/features/editor/providers/TypebotProvider";
import { TranslationManagementPage } from "@/features/localization/components/TranslationManagementPage";
import { LocalizationProvider } from "@/features/localization/providers/LocalizationProvider";
import { WorkspaceProvider } from "@/features/workspace/WorkspaceProvider";
import { useRouter } from "next/router";

export default function TranslationsPage() {
  const router = useRouter();
  const typebotId = router.query.typebotId as string;

  return (
    <WorkspaceProvider>
      <TypebotProvider typebotId={typebotId}>
        <LocalizationProvider>
          <TranslationManagementPage />
        </LocalizationProvider>
      </TypebotProvider>
    </WorkspaceProvider>
  );
}
