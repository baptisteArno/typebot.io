import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { TextInput } from "@/components/inputs/TextInput";

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
              <img
                {...props}
                className="w-5 cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90"
                src={favIconUrl}
                alt="Fav icon"
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
            <img
              className="cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90"
              src={imageUrl}
              alt="Website image"
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
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.metadata.description.label")}
        </Field.Label>
        <Field.Control
          render={(props) => (
            <DebouncedTextareaWithVariablesButton
              {...props}
              defaultValue={
                metadata?.description ?? defaultSettings.metadata.description
              }
              onValueChange={handleDescriptionChange}
            />
          )}
        />
      </Field.Root>
      <TextInput
        defaultValue={metadata?.googleTagManagerId}
        placeholder="GTM-XXXXXX"
        onChange={handleGoogleTagManagerIdChange}
        label="Google Tag Manager ID:"
        moreInfoTooltip={t("settings.sideMenu.metadata.gtm.tooltip")}
      />
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.metadata.headCode.label")}
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.headCode.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
        <CodeEditor
          defaultValue={metadata?.customHeadCode}
          onChange={handleHeadCodeChange}
          lang="html"
          withVariableButton={false}
        />
      </Field.Root>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={metadata?.allowIndexing}
          onCheckedChange={handleAllowIndexingChange}
        />
        <Field.Label>
          {t("settings.sideMenu.metadata.allowIndexing.label")}{" "}
          <MoreInfoTooltip>
            {t("settings.sideMenu.metadata.allowIndexing.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
    </Stack>
  );
};
