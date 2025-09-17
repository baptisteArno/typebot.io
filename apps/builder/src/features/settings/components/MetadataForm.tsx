import { FormLabel, HStack, Image, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Popover } from "@typebot.io/ui/components/Popover";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { Textarea, TextInput } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { useOpenControls } from "@/hooks/useOpenControls";

type Props = {
  workspaceId: string;
  typebotId: string;
  typebotName: string;
  metadata: Settings["metadata"];
  onMetadataChange: (metadata: Settings["metadata"]) => void;
};

export const MetadataForm = ({
  workspaceId,
  typebotId,
  typebotName,
  metadata,
  onMetadataChange,
}: Props) => {
  const { t } = useTranslate();
  const favIconPopoverControls = useOpenControls();
  const imagePopoverControls = useOpenControls();
  const handleTitleChange = (title: string) =>
    onMetadataChange({ ...metadata, title });
  const handleDescriptionChange = (description: string) =>
    onMetadataChange({ ...metadata, description });
  const handleFavIconSubmit = (favIconUrl: string) =>
    onMetadataChange({ ...metadata, favIconUrl });
  const handleImageSubmit = (imageUrl: string) =>
    onMetadataChange({ ...metadata, imageUrl });
  const handleGoogleTagManagerIdChange = (googleTagManagerId: string) =>
    onMetadataChange({ ...metadata, googleTagManagerId });
  const handleHeadCodeChange = (customHeadCode: string) =>
    onMetadataChange({ ...metadata, customHeadCode });
  const handleAllowIndexingChange = (allowIndexing: boolean) =>
    onMetadataChange({ ...metadata, allowIndexing });

  const favIconUrl =
    metadata?.favIconUrl ??
    defaultSettings.metadata.favIconUrl(env.NEXT_PUBLIC_VIEWER_URL[0]);

  const imageUrl =
    metadata?.imageUrl ??
    defaultSettings.metadata.imageUrl(env.NEXT_PUBLIC_VIEWER_URL[0]);

  return (
    <Stack spacing="6">
      <Stack>
        <FormLabel mb="0" htmlFor="icon">
          {t("settings.sideMenu.metadata.icon.label")}
        </FormLabel>
        <Popover.Root {...favIconPopoverControls}>
          <Popover.Trigger
            render={(props) => (
              <Image
                {...props}
                src={favIconUrl}
                w="20px"
                alt="Fav icon"
                cursor="pointer"
                _hover={{ filter: "brightness(.9)" }}
                transition="filter 200ms"
                rounded="md"
              />
            )}
          />
          <Popover.Popup className="w-[400px]" side="right">
            <ImageUploadContent
              uploadFileProps={{
                workspaceId,
                typebotId,
                fileName: "favIcon",
              }}
              defaultUrl={favIconUrl}
              onSubmit={handleFavIconSubmit}
              additionalTabs={{
                icon: true,
              }}
              imageSize="thumb"
            />
          </Popover.Popup>
        </Popover.Root>
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="image">
          {t("settings.sideMenu.metadata.image.label")}
        </FormLabel>
        <Popover.Root {...imagePopoverControls}>
          <Popover.Trigger>
            <Image
              src={imageUrl}
              alt="Website image"
              cursor="pointer"
              _hover={{ filter: "brightness(.9)" }}
              transition="filter 200ms"
              rounded="md"
            />
          </Popover.Trigger>
          <Popover.Popup className="w-[500px]" side="right">
            <ImageUploadContent
              uploadFileProps={{
                workspaceId,
                typebotId,
                fileName: "ogImage",
              }}
              defaultUrl={imageUrl}
              onSubmit={handleImageSubmit}
              additionalTabs={{
                unsplash: true,
              }}
            />
          </Popover.Popup>
        </Popover.Root>
      </Stack>
      <TextInput
        label={t("settings.sideMenu.metadata.title.label")}
        defaultValue={metadata?.title ?? typebotName}
        onChange={handleTitleChange}
      />
      <Textarea
        defaultValue={
          metadata?.description ?? defaultSettings.metadata.description
        }
        onChange={handleDescriptionChange}
        label={t("settings.sideMenu.metadata.description.label")}
      />
      <TextInput
        defaultValue={metadata?.googleTagManagerId}
        placeholder="GTM-XXXXXX"
        onChange={handleGoogleTagManagerIdChange}
        label="Google Tag Manager ID:"
        moreInfoTooltip={t("settings.sideMenu.metadata.gtm.tooltip")}
      />
      <Stack>
        <HStack as={FormLabel} mb="0" htmlFor="head">
          <Text>{t("settings.sideMenu.metadata.headCode.label")}</Text>
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.headCode.tooltip")}
          </MoreInfoTooltip>
        </HStack>
        <CodeEditor
          id="head"
          defaultValue={metadata?.customHeadCode}
          onChange={handleHeadCodeChange}
          lang="html"
          withVariableButton={false}
        />
      </Stack>
      <SwitchWithLabel
        label={t("settings.sideMenu.metadata.allowIndexing.label")}
        initialValue={metadata?.allowIndexing}
        onCheckChange={handleAllowIndexingChange}
        moreInfoContent={t("settings.sideMenu.metadata.allowIndexing.tooltip")}
      />
    </Stack>
  );
};
