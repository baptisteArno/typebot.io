import { Seo } from "@/components/Seo";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import { Flex, Spinner, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { useRouter } from "next/router";
import { TypebotDndProvider } from "../TypebotDndProvider";
import { FolderContent } from "./FolderContent";

export const FolderPage = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const { workspace } = useWorkspace();

  const { showToast } = useToast();

  const {
    data: { folder } = {},
  } = trpc.folders.getFolder.useQuery(
    {
      folderId: router.query.id as string,
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace && !!router.query.id,
      retry: 0,
      onError: (error) => {
        if (error.data?.httpStatus === 404) router.replace("/typebots");
        showToast({
          title: "Folder not found",
        });
      },
    },
  );

  return (
    <Stack minH="100vh">
      <Seo title={t("dashboard.title")} />
      <DashboardHeader />
      <TypebotDndProvider>
        {!folder ? (
          <Flex flex="1">
            <Spinner mx="auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </TypebotDndProvider>
    </Stack>
  );
};
