import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { CreateWhatsAppCampaignForm } from "@typebot.io/campaigns/react/CreateWhatsAppCampaignForm";
import { Seo } from "@/components/Seo";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { orpc } from "@/lib/queryClient";

export default function Page() {
  const { t } = useTranslate();
  const { typebot } = useTypebot();

  const { data } = useQuery(
    orpc.segments.list.queryOptions({
      input: {
        workspaceId: typebot?.workspaceId ?? "",
      },
      enabled: !!typebot?.workspaceId,
    }),
  );

  return (
    <div className="flex overflow-hidden h-screen flex-col">
      <Seo
        title={
          typebot?.name
            ? `${typebot.name} | ${t("campaigns.page.title")}`
            : t("campaigns.page.title")
        }
      />
      <TypebotHeader />
      <div className="flex h-full w-full bg-gray-1 justify-center pt-12">
        <CreateWhatsAppCampaignForm
          segments={data?.segments ?? []}
          onValidSubmit={async () => {}}
          className="max-w-2xl"
        />
      </div>
    </div>
  );
}
