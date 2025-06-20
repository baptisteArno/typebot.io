import { Seo } from "@/components/Seo";
import { TrashIcon } from "@/components/icons";
import { LockTag } from "@/features/billing/components/LockTag";
import { UpgradeButton } from "@/features/billing/components/UpgradeButton";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { CustomDomainsDropdown } from "@/features/customDomains/components/CustomDomainsDropdown";
import DomainStatusIcon from "@/features/customDomains/components/DomainStatusIcon";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { isCloudProdInstance } from "@/helpers/isCloudProdInstance";
import { toast } from "@/lib/toast";
import {
  Flex,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
  Wrap,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { isDefined, isNotDefined } from "@typebot.io/lib/utils";
import { Plan } from "@typebot.io/prisma/enum";
import { parseDefaultPublicId } from "../helpers/parseDefaultPublicId";
import { isPublicDomainAvailableQuery } from "../queries/isPublicDomainAvailableQuery";
import { EditableUrl } from "./EditableUrl";
import { integrationsList } from "./embeds/EmbedButton";

export const SharePage = () => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { typebot, updateTypebot, publishedTypebot, currentUserMode } =
    useTypebot();

  const handlePublicIdChange = async (publicId: string) => {
    updateTypebot({ updates: { publicId }, save: true });
  };

  const publicId = typebot
    ? (typebot?.publicId ?? parseDefaultPublicId(typebot.name, typebot.id))
    : "";
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
    <Flex flexDir="column" pb="40">
      <Seo title={typebot?.name ? `${typebot.name} | Share` : "Share"} />
      <TypebotHeader />
      <Flex h="full" w="full" justifyContent="center" align="flex-start">
        <Stack maxW="970px" w="full" pt="10" spacing={10}>
          <Stack spacing={4} align="flex-start">
            <Heading fontSize="2xl" as="h1">
              {t("sharePage.links.heading")}
            </Heading>
            <Stack
              bg={useColorModeValue("white", "gray.900")}
              spacing={4}
              p={4}
              rounded="lg"
              align="flex-start"
              borderWidth={1}
            >
              {typebot && (
                <EditableUrl
                  hostname={env.NEXT_PUBLIC_VIEWER_URL[0]}
                  pathname={publicId}
                  isValid={checkIfPublicIdIsValid}
                  onPathnameChange={handlePublicIdChange}
                />
              )}
              {typebot?.customDomain && (
                <HStack>
                  <EditableUrl
                    hostname={"https://" + typebot.customDomain.split("/")[0]}
                    pathname={typebot.customDomain.split("/")[1]}
                    isValid={checkIfPathnameIsValid}
                    onPathnameChange={handlePathnameChange}
                  />
                  <IconButton
                    icon={<TrashIcon />}
                    aria-label="Remove custom URL"
                    size="xs"
                    onClick={() => handleCustomDomainChange(null)}
                  />
                  {workspace?.id && (
                    <DomainStatusIcon
                      domain={typebot.customDomain.split("/")[0]}
                      workspaceId={workspace.id}
                    />
                  )}
                </HStack>
              )}
              {currentUserMode === "write" &&
              isNotDefined(typebot?.customDomain) &&
              env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME ? (
                <>
                  {hasProPerks(workspace) ? (
                    <CustomDomainsDropdown
                      onCustomDomainSelect={handleCustomDomainChange}
                    />
                  ) : (
                    <UpgradeButton
                      colorScheme="gray"
                      limitReachedType={t("billing.limitMessage.customDomain")}
                      excludedPlans={[Plan.STARTER]}
                    >
                      <Text mr="2">{t("customDomain.add")}</Text>{" "}
                      <LockTag plan={Plan.PRO} />
                    </UpgradeButton>
                  )}
                </>
              ) : null}
            </Stack>
          </Stack>

          <Stack spacing={4}>
            <Heading fontSize="2xl" as="h1">
              {t("sharePage.embed.heading")}
            </Heading>
            <Wrap spacing={4}>
              {integrationsList.map((IntegrationButton, idx) => (
                <IntegrationButton
                  key={idx}
                  publicId={publicId}
                  isPublished={isPublished}
                />
              ))}
            </Wrap>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  );
};
