import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import type { Settings } from "@typebot.io/settings/schemas";
import { getPublicId } from "@typebot.io/typebot/helpers/getPublicId";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { Seo } from "@/components/Seo";
import { UpgradeButton } from "@/features/billing/components/UpgradeButton";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { CustomDomainsDropdown } from "@/features/customDomains/components/CustomDomainsDropdown";
import DomainStatusIcon from "@/features/customDomains/components/DomainStatusIcon";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { orpcClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { IntegrationButtons } from "./deploy/DeployButton";
import { EditableUrl } from "./EditableUrl";
import { LinkPreviewMetadataForm } from "./LinkPreviewMetadataForm";

export const SharePage = () => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { typebot, updateTypebot, publishedTypebot, currentUserMode } =
    useTypebot();

  const handlePublicIdChange = async (publicId: string) => {
    updateTypebot({ updates: { publicId }, save: true });
  };

  const publicId = getPublicId(typebot);
  const isPublished = isDefined(publishedTypebot);

  const handlePathnameChange = (pathname: string) => {
    if (!typebot?.customDomain) return;
    const existingHost = typebot.customDomain?.split("/")[0];
    const newDomain =
      pathname === "" ? existingHost : existingHost + "/" + pathname;
    handleCustomDomainChange(newDomain);
  };

  const handleCustomDomainChange = (customDomain: string | null) =>
    updateTypebot({ updates: { customDomain }, save: true });

  const checkIfPathnameIsValid = (pathname: string) => {
    const isCorrectlyFormatted =
      /^([a-z0-9]+-[a-z0-9]*)*$/.test(pathname) || /^[a-z0-9]*$/.test(pathname);

    if (!isCorrectlyFormatted) {
      toast({
        description: "Can only contain lowercase letters, numbers and dashes.",
      });
      return false;
    }
    return true;
  };

  const checkIfPublicIdIsValid = async (publicId: string) => {
    const isLongerThanAllowed = publicId.length >= 4;
    if (!isLongerThanAllowed && isCloudProdInstance()) {
      toast({
        description: "Should be longer than 4 characters",
      });
      return false;
    }

    if (!checkIfPathnameIsValid(publicId)) return false;

    const { isAvailable } = await orpcClient.typebot.isPublicIdAvailable({
      publicId,
    });
    if (!isAvailable) {
      toast({ description: "ID is already taken" });
      return false;
    }

    return true;
  };

  const updateTypebotPreviewMetadata = (metadata: Settings["metadata"]) =>
    updateTypebot({
      updates: { settings: { ...typebot?.settings, metadata } },
    });

  return (
    <div className="flex flex-col pb-40">
      <Seo title={typebot?.name ? `${typebot.name} | Share` : "Share"} />
      <TypebotHeader />
      <div className="flex h-full w-full justify-center">
        <div className="flex flex-col max-w-5xl w-full pt-10 gap-10">
          <div className="flex gap-4">
            <div className="flex flex-col gap-4 flex-1/2">
              <h2>{t("sharePage.links.heading")}</h2>
              <div className="flex flex-col gap-4 p-4 rounded-lg border bg-gray-1">
                {typebot && env.NEXT_PUBLIC_VIEWER_URL?.[0] && (
                  <EditableUrl
                    hostname={env.NEXT_PUBLIC_VIEWER_URL[0]}
                    pathname={publicId}
                    isValid={checkIfPublicIdIsValid}
                    onPathnameChange={handlePublicIdChange}
                  />
                )}
                {typebot?.customDomain && (
                  <div className="flex items-center gap-2">
                    <EditableUrl
                      hostname={"https://" + typebot.customDomain.split("/")[0]}
                      pathname={typebot.customDomain.split("/")[1]}
                      isValid={checkIfPathnameIsValid}
                      onPathnameChange={handlePathnameChange}
                    />
                    <Button
                      className="size-7 [&_svg]:size-3"
                      aria-label="Remove custom URL"
                      size="icon"
                      onClick={() => handleCustomDomainChange(null)}
                    >
                      <TrashIcon />
                    </Button>
                    {workspace?.id && (
                      <DomainStatusIcon
                        domain={typebot.customDomain.split("/")[0]}
                        workspaceId={workspace.id}
                      />
                    )}
                  </div>
                )}
                {currentUserMode === "write" &&
                isNotDefined(typebot?.customDomain) &&
                env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME ? (
                  hasProPerks(workspace) ? (
                    <CustomDomainsDropdown
                      onCustomDomainSelect={handleCustomDomainChange}
                    />
                  ) : (
                    <UpgradeButton
                      limitReachedType={t("billing.limitMessage.customDomain")}
                      excludedPlans={[Plan.STARTER]}
                    >
                      {t("customDomain.add")}
                      <Badge colorScheme="purple">
                        <SquareLock01Icon />
                      </Badge>
                    </UpgradeButton>
                  )
                ) : null}
              </div>
            </div>

            {typebot && (
              <div className="flex flex-col gap-4 flex-1/2">
                <h2>Site preview metadata</h2>
                <LinkPreviewMetadataForm
                  workspaceId={typebot.workspaceId}
                  typebotId={typebot.id}
                  typebotName={typebot.name}
                  metadata={typebot.settings.metadata}
                  onMetadataChange={updateTypebotPreviewMetadata}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h2>{t("sharePage.embed.heading")}</h2>
            <div className="grid grid-cols-4 gap-4">
              <IntegrationButtons
                publicId={publicId}
                isPublished={isPublished}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
