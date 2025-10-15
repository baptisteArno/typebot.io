import { Flex, Stack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useRouter } from "next/router";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Seo } from "@/components/Seo";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { TypebotDndProvider } from "../TypebotDndProvider";
import { FolderContent } from "./FolderContent";

export const FolderPage = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const { workspace, currentUserMode } = useWorkspace();

  const { data: { folder } = {}, error } = useQuery(
    trpc.folders.getFolder.queryOptions(
      {
        folderId: router.query.id as string,
        workspaceId: workspace?.id as string,
      },
      {
        enabled:
          !!workspace && !!router.query.id && currentUserMode !== "guest",
        retry: 0,
      },
    ),
  );

  if (error?.data?.httpStatus === 404)
    return <NotFoundPage resourceName="Folder" />;

  return (
    <Stack minH="100vh">
      <Seo title={t("dashboard.title")} />
      <DashboardHeader />
      <TypebotDndProvider>
        {!folder ? (
          <Flex flex="1">
            <LoaderCircleIcon className="animate-spin mx-auto" />
          </Flex>
        ) : (
          <FolderContent folder={folder} />
        )}
      </TypebotDndProvider>
    </Stack>
  );
};
