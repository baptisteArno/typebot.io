import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TextLink } from "@/components/TextLink";
import { CloudOffIcon, LockedIcon, UnlockedIcon } from "@/components/icons";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useTimeSince } from "@/hooks/useTimeSince";
import {
  queryClient,
  showHttpRequestErrorToast,
  trpc,
} from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import {
  Alert,
  AlertIcon,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { T, useTranslate } from "@tolgee/react";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import { useState } from "react";
import { parseDefaultPublicId } from "../helpers/parseDefaultPublicId";

type Props = {
  isMoreMenuDisabled?: boolean;
} & ButtonProps;

export const PublishButton = ({
  isMoreMenuDisabled = false,
  className,
  ...props
}: Props) => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { push, query, pathname } = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isNewEngineWarningOpen,
    onOpen: onNewEngineWarningOpen,
    onClose: onNewEngineWarningClose,
  } = useDisclosure();
  const {
    isOpen: isTrademarkInfringementOpen,
    onOpen: onTrademarkInfringementOpen,
    onClose: onTrademarkInfringementClose,
  } = useDisclosure();
  const [trademarkPotentialInfringement, setTrademarkPotentialInfringement] =
    useState<string | undefined>(undefined);
  const {
    isPublished,
    publishedTypebot,
    restorePublishedTypebot,
    typebot,
    isSavingLoading,
    updateTypebot,
    save,
    publishedTypebotVersion,
    currentUserMode,
  } = useTypebot();
  const timeSinceLastPublish = useTimeSince(
    publishedTypebot?.updatedAt.toString(),
  );

  const { mutate: publishTypebotMutate, status: publishTypebotStatus } =
    useMutation(
      trpc.typebot.publishTypebot.mutationOptions({
        onError: (error) => {
          showHttpRequestErrorToast(error, {
            context: t("publish.error.label"),
          });
          if (error.data?.httpStatus === 403) {
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        },
        onSuccess: (data) => {
          if (!typebot?.id || currentUserMode === "guest") return;
          queryClient.invalidateQueries({
            queryKey: trpc.typebot.getPublishedTypebot.queryKey(),
          });
          if (data.warnings) {
            setTrademarkPotentialInfringement(data.warnings[0].trademark);
            onTrademarkInfringementOpen();
          } else if (!publishedTypebot && !pathname.endsWith("share"))
            push(`/typebots/${query.typebotId}/share`);
        },
      }),
    );

  const { mutate: unpublishTypebotMutate, status: unpublishTypebotStatus } =
    useMutation(
      trpc.typebot.unpublishTypebot.mutationOptions({
        onError: (error) =>
          toast({
            title: t("editor.header.unpublishTypebot.error.label"),
            description: error.message,
          }),
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.typebot.getPublishedTypebot.queryKey(),
          });
        },
      }),
    );

  const hasInputFile = typebot?.groups
    .flatMap((g) => g.blocks)
    .some((b) => b.type === InputBlockType.FILE);

  const handlePublishClick = async () => {
    if (!typebot?.id) return;
    if (isFreePlan(workspace) && hasInputFile) return onOpen();
    await save(
      !typebot.publicId
        ? { publicId: parseDefaultPublicId(typebot.name, typebot.id) }
        : undefined,
      true,
    );
    publishTypebotMutate({
      typebotId: typebot.id,
    });
  };

  const unpublishTypebot = async () => {
    if (!typebot?.id) return;
    if (typebot.isClosed)
      await updateTypebot({ updates: { isClosed: false }, save: true });
    unpublishTypebotMutate({
      typebotId: typebot?.id,
    });
  };

  const closeTypebot = async () => {
    await updateTypebot({ updates: { isClosed: true }, save: true });
  };

  const openTypebot = async () => {
    await updateTypebot({ updates: { isClosed: false }, save: true });
  };

  return (
    <HStack spacing="1px">
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.fileInput")}
      />
      <ConfirmDialog
        isOpen={isTrademarkInfringementOpen}
        onConfirm={onTrademarkInfringementClose}
        onClose={() => {
          setTimeout(() => {
            setTrademarkPotentialInfringement(undefined);
          }, 200);
          onTrademarkInfringementClose();
        }}
        title="Potential trademark infringement detected"
        confirmButtonLabel="Publish anyway"
      >
        <div className="flex flex-col gap-4">
          <span>
            We noticed you’re using{" "}
            <span className="font-bold">{trademarkPotentialInfringement}</span>{" "}
            brand or logo in your bot’s metadata. Please be careful: using{" "}
            {trademarkPotentialInfringement}’s brand assets in your bot misleads
            visitors and most likely violates {trademarkPotentialInfringement}’s
            trademark guidelines.
            <br />
            Consider rephrasing with your own branding.
          </span>
          <Alert status="warning">
            <AlertIcon />
            Your workspace is at risk of being suspended if we detect a
            trademark infringement down the line.
          </Alert>
        </div>
      </ConfirmDialog>

      {publishedTypebot && publishedTypebotVersion !== typebot?.version && (
        <ConfirmDialog
          isOpen={isNewEngineWarningOpen}
          onConfirm={handlePublishClick}
          onClose={onNewEngineWarningClose}
          actionType="informative"
          title={t("publish.versionWarning.title.label")}
          confirmButtonLabel={t("publishButton.label")}
        >
          <Text>{t("publish.versionWarning.message.aboutToDeploy.label")}</Text>
          <Text fontWeight="bold">
            <T
              keyName="publish.versionWarning.checkBreakingChanges"
              params={{
                link: (
                  <TextLink
                    href="https://docs.typebot.io/breaking-changes#typebot-v6"
                    isExternal
                  />
                ),
              }}
            />
          </Text>
          <Text>
            {t("publish.versionWarning.message.testInPreviewMode.label")}
          </Text>
        </ConfirmDialog>
      )}
      <Tooltip.Root disabled={isNotDefined(publishedTypebot) || isPublished}>
        <Tooltip.Trigger
          render={
            <Button
              disabled={
                isPublished ||
                isSavingLoading ||
                publishTypebotStatus === "pending" ||
                unpublishTypebotStatus === "pending"
              }
              onClick={() => {
                publishedTypebot && publishedTypebotVersion !== typebot?.version
                  ? onNewEngineWarningOpen()
                  : handlePublishClick();
              }}
              className={cn(
                publishedTypebot && !isMoreMenuDisabled && "rounded-r-none",
                className,
              )}
              {...props}
            >
              {isPublished
                ? typebot?.isClosed
                  ? t("publishButton.closed.label")
                  : t("publishButton.published.label")
                : t("publishButton.label")}
            </Button>
          }
        />
        <Tooltip.Popup>
          <Stack>
            <Text>{t("publishButton.tooltip.nonPublishedChanges.label")}</Text>
            {timeSinceLastPublish ? (
              <Text fontStyle="italic">
                <T
                  keyName="publishButton.tooltip.publishedVersion.from.label"
                  params={{
                    timeSince: timeSinceLastPublish,
                  }}
                />
              </Text>
            ) : null}
          </Stack>
        </Tooltip.Popup>
      </Tooltip.Root>
      {!isMoreMenuDisabled && publishedTypebot && (
        <Menu.Root>
          <Menu.TriggerButton
            size="icon"
            className="rounded-l-none size-8"
            aria-label={t("publishButton.dropdown.showMenu.label")}
            disabled={publishTypebotStatus === "pending" || isSavingLoading}
          >
            <ChevronDownIcon />
          </Menu.TriggerButton>
          <Menu.Popup align="end">
            {!isPublished && (
              <Menu.Item onClick={restorePublishedTypebot}>
                {t("publishButton.dropdown.restoreVersion.label")}
              </Menu.Item>
            )}
            {!typebot?.isClosed ? (
              <Menu.Item onClick={closeTypebot}>
                <LockedIcon />
                {t("publishButton.dropdown.close.label")}
              </Menu.Item>
            ) : (
              <Menu.Item onClick={openTypebot}>
                <UnlockedIcon />
                {t("publishButton.dropdown.reopen.label")}
              </Menu.Item>
            )}
            <Menu.Item onClick={unpublishTypebot}>
              <CloudOffIcon />
              {t("publishButton.dropdown.unpublish.label")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      )}
    </HStack>
  );
};
