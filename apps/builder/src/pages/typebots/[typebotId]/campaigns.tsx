import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { EmptyCampaigns } from "@typebot.io/campaigns/react/EmptyCampaigns";
import { InputGroup } from "@typebot.io/ui/components/InputGroup";
import { Select } from "@typebot.io/ui/components/Select";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";
import { Search01Icon } from "@typebot.io/ui/icons/Search01Icon";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ButtonLink";
import { Seo } from "@/components/Seo";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { orpc } from "@/lib/queryClient";

const statuses = [
  { value: null, label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
] as const;

const audiences = [{ value: null, label: "All Contacts" }] as const;

export default function Page() {
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statuses)[number]["value"]>(null);

  const { data } = useQuery(
    orpc.campaigns.list.queryOptions({
      input: {
        typebotId: typebot?.id ?? "",
      },
      enabled: !!typebot?.id,
    }),
  );
  const campaigns = data?.campaigns ?? [];

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        campaign.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [campaigns, search],
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
      <div className="flex h-full w-full bg-gray-1 justify-center">
        <div className="flex w-full max-w-5xl flex-col gap-4 pt-6">
          {filteredCampaigns.length > 0 && (
            <div className="flex items-center justify-end gap-3">
              <ButtonLink href={`/typebots/${typebot?.id}/campaigns/create`}>
                <PlusSignIcon />
                Create campaign
              </ButtonLink>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {filteredCampaigns.length > 0 && (
              <div className="flex items-center gap-2">
                <InputGroup.Root>
                  <InputGroup.Addon>
                    <Search01Icon />
                  </InputGroup.Addon>
                  <InputGroup.Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                  />
                </InputGroup.Root>

                <Select.Root
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  items={statuses}
                >
                  <Select.Trigger className="min-w-52">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {statuses.map((status) => (
                        <Select.Item key={status.value} value={status.value}>
                          {status.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>

                <Select.Root items={audiences}>
                  <Select.Trigger className="min-w-52">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {audiences.map((audience) => (
                        <Select.Item
                          key={audience.value}
                          value={audience.value}
                        >
                          {audience.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
            )}

            {filteredCampaigns.length === 0 ? (
              <EmptyCampaigns
                onCreateClick={() => {
                  router.push(`/typebots/${typebot?.id}/campaigns/create`);
                }}
                className="py-12"
              />
            ) : (
              <div className="flex w-full max-w-3xl flex-col gap-2">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="rounded-md border border-gray-5 bg-gray-2 px-4 py-3"
                  >
                    <p className="font-medium text-gray-12">{campaign.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
