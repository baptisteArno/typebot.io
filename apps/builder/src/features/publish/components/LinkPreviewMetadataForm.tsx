import { env } from "@typebot.io/env";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ImageUploadContent } from "@/components/ImageUploadContent";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";

type Props = {
  workspaceId: string;
  typebotId: string;
  typebotName: string;
  metadata: Settings["metadata"];
  onMetadataChange: (metadata: Settings["metadata"]) => void;
};

export const LinkPreviewMetadataForm = ({
  workspaceId,
  typebotId,
  typebotName,
  metadata,
  onMetadataChange,
}: Props) => {
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

  const favIconUrl =
    metadata?.favIconUrl ??
    defaultSettings.metadata.favIconUrl(env.NEXT_PUBLIC_VIEWER_URL[0]);

  const imageUrl =
    metadata?.imageUrl ??
    defaultSettings.metadata.imageUrl(env.NEXT_PUBLIC_VIEWER_URL[0]);

  return (
    <div className="flex flex-col gap-2 bg-gray-1 p-4 rounded-lg border">
      <Field.Root>
        <Popover.Root {...imagePopoverControls}>
          <Popover.Trigger>
            <img
              className="cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90 border border-input"
              src={imageUrl}
              alt="Website preview"
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
      </Field.Root>
      <div className="flex gap-2">
        <Field.Root>
          <Popover.Root {...favIconPopoverControls}>
            <Popover.Trigger
              render={(props) => (
                <img
                  {...props}
                  className="w-10 border border-input cursor-pointer transition-filter duration-200 rounded-md hover:brightness-90"
                  src={favIconUrl}
                  alt="Fav icon"
                />
              )}
            />
            <Popover.Popup className="w-[400px]">
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
        </Field.Root>
        <Field.Root className="flex-1">
          <DebouncedTextInputWithVariablesButton
            defaultValue={metadata?.title ?? typebotName}
            onValueChange={handleTitleChange}
          />
        </Field.Root>
      </div>
      <Field.Root>
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
    </div>
  );
};
