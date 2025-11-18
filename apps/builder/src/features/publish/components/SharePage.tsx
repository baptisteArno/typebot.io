import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
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
import { toast } from "@/lib/toast";
import { isPublicDomainAvailableQuery } from "../queries/isPublicDomainAvailableQuery";
import { integrationsList } from "./deploy/DeployButton";
import { EditableUrl } from "./EditableUrl";

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

    const { data } = await isPublicDomainAvailableQuery(publicId);
    if (!data?.isAvailable) {
      toast({ description: "ID is already taken" });
      return false;
    }

    return true;
  };

  return (
    <div className="flex flex-col pb-40">
      <Seo title={typebot?.name ? `${typebot.name} | Share` : "Share"} />
      <TypebotHeader />
      <div className="flex h-full w-full justify-center items-start">
        <div className="flex flex-col max-w-[970px] w-full pt-10 gap-10">
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-2xl">{t("sharePage.links.heading")}</h1>
            <div className="flex flex-col gap-4 p-4 rounded-lg items-start border bg-gray-1">
              {typebot && (
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

          <div className="flex flex-col gap-4">
            <h1 className="text-2xl">{t("sharePage.embed.heading")}</h1>
            <div className="flex flex-wrap gap-4">
              {integrationsList.map((IntegrationButton, idx) => (
                <IntegrationButton
                  key={idx}
                  publicId={publicId}
                  isPublished={isPublished}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
