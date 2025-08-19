import { Seo } from "@/components/Seo";
import {
  PreCheckoutDialog,
  type PreCheckoutDialogProps,
} from "@/features/billing/components/PreCheckoutDialog";
import { TypebotDndProvider } from "@/features/folders/TypebotDndProvider";
import { FolderContent } from "@/features/folders/components/FolderContent";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
import { Spinner, Stack, Text, VStack } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import type { Plan } from "@typebot.io/prisma/enum";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DashboardHeader } from "./DashboardHeader";

export const DashboardPage = () => {
  const { t } = useTranslate();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutDialogProps["selectedSubscription"]>();
  const { mutate: createCustomCheckoutSession } = useMutation(
    trpc.billing.createCustomCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        router.push(data.checkoutUrl);
      },
    }),
  );

  useEffect(() => {
    const { subscribePlan, claimCustomPlan } = router.query as {
      subscribePlan: Plan | undefined;
      chats: string | undefined;
      claimCustomPlan: string | undefined;
    };
    if (claimCustomPlan && user?.email && workspace) {
      setIsLoading(true);
      createCustomCheckoutSession({
        email: user.email,
        workspaceId: workspace.id,
        returnUrl: `${window.location.origin}/typebots`,
      });
    }
    if (workspace && subscribePlan && user && workspace.plan === "FREE") {
      setIsLoading(true);
      setPreCheckoutPlan({
        plan: subscribePlan as "PRO" | "STARTER",
        workspaceId: workspace.id,
      });
    }
  }, [createCustomCheckoutSession, router.query, user, workspace]);

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? t("dashboard.title")} />
      <DashboardHeader />
      {!workspace?.stripeId && (
        <PreCheckoutDialog
          selectedSubscription={preCheckoutPlan}
          existingEmail={user?.email ?? undefined}
          existingCompany={workspace?.name ?? undefined}
          onClose={() => setPreCheckoutPlan(undefined)}
        />
      )}
      <TypebotDndProvider>
        {isLoading ? (
          <VStack w="full" justifyContent="center" pt="10" spacing={6}>
            <Text>{t("dashboard.redirectionMessage")}</Text>
            <Spinner />
          </VStack>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndProvider>
    </Stack>
  );
};
