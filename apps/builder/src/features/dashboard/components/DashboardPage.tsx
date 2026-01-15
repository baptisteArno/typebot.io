import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { sendRequest } from "@typebot.io/lib/utils";
import type { Plan } from "@typebot.io/prisma/enum";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Seo } from "@/components/Seo";
import {
  PreCheckoutDialog,
  type PreCheckoutDialogProps,
} from "@/features/billing/components/PreCheckoutDialog";
import { FolderContent } from "@/features/folders/components/FolderContent";
import { TypebotDndProvider } from "@/features/folders/TypebotDndProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { DashboardHeader } from "./DashboardHeader";

export const DashboardPage = () => {
  const { t } = useTranslate();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { workspace } = useWorkspace();
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutDialogProps["selectedSubscription"]>();
  const isImportingTemplateRef = useRef(false);
  const { mutate: createCustomCheckoutSession } = useMutation(
    orpc.billing.createCustomCheckoutSession.mutationOptions({
      onSuccess: (data) => {
        router.push(data.checkoutUrl);
      },
    }),
  );
  const { mutate: importTypebot } = useMutation(
    orpc.typebot.importTypebot.mutationOptions({
      onSuccess: (data) => {
        router.push(`/typebots/${data.typebot.id}/edit`);
      },
      onError: (error) => {
        toast({
          title: t("errorMessage"),
          description: error.message,
        });
        setIsLoading(false);
        isImportingTemplateRef.current = false;
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

  useEffect(() => {
    const template = router.query.template as string | undefined;
    if (!template || !workspace?.id || !user || isImportingTemplateRef.current)
      return;
    isImportingTemplateRef.current = true;
    setIsLoading(true);
    importTemplate(template, workspace.id);
  }, [router.query.template, workspace?.id, user]);

  const importTemplate = async (templateSlug: string, workspaceId: string) => {
    const { data, error } = await sendRequest<Typebot>(
      `/templates/${templateSlug}.json`,
    );
    if (error || !data) {
      toast({
        title: t("errorMessage"),
        description: error?.message ?? "Template not found",
      });
      setIsLoading(false);
      isImportingTemplateRef.current = false;
      return;
    }
    importTypebot({
      workspaceId,
      typebot: data,
      fromTemplate: templateSlug,
    });
  };

  return (
    <div className="flex flex-col gap-2 min-h-screen">
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
          <div className="flex flex-col w-full justify-center pt-10 gap-6">
            <p>{t("dashboard.redirectionMessage")}</p>
            <LoaderCircleIcon className="animate-spin" />
          </div>
        ) : (
          <FolderContent folder={null} />
        )}
      </TypebotDndProvider>
    </div>
  );
};
