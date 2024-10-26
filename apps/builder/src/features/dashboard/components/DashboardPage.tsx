import { Seo } from "@/components/Seo";
import { useUser } from "@/features/account/hooks/useUser";
import { TypebotDndProvider } from "@/features/folders/TypebotDndProvider";
import { FolderContent } from "@/features/folders/components/FolderContent";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import { Spinner, Stack, Text, VStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { guessIfUserIsEuropean } from "@typebot.io/billing/helpers/guessIfUserIsEuropean";
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
  const { showToast } = useToast();

  const { mutate: createCustomCheckoutSession } =
    trpc.billing.createCustomCheckoutSession.useMutation({
      onSuccess: (data) => {
        router.push(data.checkoutUrl);
      },
    });

  const { mutate: createCheckoutSession, isLoading: isCreatingCheckout } =
    trpc.billing.createCheckoutSession.useMutation({
      onError: (error) => {
        showToast({
          description: error.message,
        });
      },
      onSuccess: ({ checkoutUrl }) => {
        router.push(checkoutUrl);
      },
    });

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
      createCheckoutSession({
        plan: subscribePlan as "PRO" | "STARTER",
        workspaceId: workspace.id,
        currency: guessIfUserIsEuropean() ? "eur" : "usd",
        returnUrl: window.location.href,
      });
    }
  }, [createCustomCheckoutSession, router.query, user, workspace]);

  return (
    <Stack minH="100vh">
      <Seo title={workspace?.name ?? t("dashboard.title")} />
      <DashboardHeader />
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
