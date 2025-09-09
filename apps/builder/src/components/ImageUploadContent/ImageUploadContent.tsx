import { Flex, HStack, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { useState } from "react";
import type { FilePathUploadProps } from "@/features/upload/api/generateUploadUrl";
import { TextInput } from "../inputs/TextInput";
import { EmojiSearchableList } from "./emoji/EmojiSearchableList";
import { GiphyPicker } from "./GiphyPicker";
import { IconPicker } from "./IconPicker";
import { UnsplashPicker } from "./UnsplashPicker";
import { UploadButton } from "./UploadButton";

type PermanentTabs = "link" | "upload";
type AdditionalTabs = "giphy" | "emoji" | "unsplash" | "icon";
type Tabs = PermanentTabs | AdditionalTabs;

type Props = {
  uploadFileProps: FilePathUploadProps | undefined;
  defaultUrl?: string;
  imageSize?: "small" | "regular" | "thumb";
  initialTab?: Tabs;
  linkWithVariableButton?: boolean;
  additionalTabs?: Partial<Record<AdditionalTabs, boolean>>;
  onDelete?: () => void;
  onSubmit: (url: string) => void;
  onClose?: () => void;
};

export const ImageUploadContent = ({
  uploadFileProps,
  defaultUrl,
  onSubmit,
  imageSize = "regular",
  onClose,
  initialTab,
  linkWithVariableButton,
  additionalTabs,
  onDelete,
}: Props) => {
  const displayedTabs = [
    "link",
    "upload",
    ...Object.keys(additionalTabs ?? {}).filter(
      (tab) => additionalTabs?.[tab as AdditionalTabs],
    ),
  ];

  const [currentTab, setCurrentTab] = useState<Tabs>(
    initialTab ?? (displayedTabs[0] as Tabs),
  );

  const handleSubmit = (url: string) => {
    onSubmit(url);
    onClose && onClose();
  };

  return (
    <Stack>
      <HStack>
        {displayedTabs.includes("link") && (
          <Button
            variant={currentTab === "link" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("link")}
            size="sm"
          >
            Link
          </Button>
        )}
        {displayedTabs.includes("upload") && (
          <Button
            variant={currentTab === "upload" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("upload")}
            size="sm"
          >
            Upload
          </Button>
        )}
        {displayedTabs.includes("emoji") && (
          <Button
            variant={currentTab === "emoji" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("emoji")}
            size="sm"
          >
            Emoji
          </Button>
        )}
        {displayedTabs.includes("giphy") && (
          <Button
            variant={currentTab === "giphy" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("giphy")}
            size="sm"
          >
            Giphy
          </Button>
        )}
        {displayedTabs.includes("unsplash") && (
          <Button
            variant={currentTab === "unsplash" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("unsplash")}
            size="sm"
          >
            Unsplash
          </Button>
        )}
        {displayedTabs.includes("icon") && (
          <Button
            variant={currentTab === "icon" ? "outline" : "ghost"}
            onClick={() => setCurrentTab("icon")}
            size="sm"
          >
            Icon
          </Button>
        )}
      </HStack>

      <BodyContent
        uploadFileProps={uploadFileProps}
        tab={currentTab}
        imageSize={imageSize}
        onSubmit={handleSubmit}
        defaultUrl={defaultUrl}
        linkWithVariableButton={linkWithVariableButton}
        onDelete={onDelete}
      />
    </Stack>
  );
};

const BodyContent = ({
  uploadFileProps,
  tab,
  defaultUrl,
  imageSize,
  linkWithVariableButton,
  onSubmit,
  onDelete,
}: {
  uploadFileProps?: FilePathUploadProps;
  tab: Tabs;
  defaultUrl?: string;
  imageSize: "small" | "regular" | "thumb";
  linkWithVariableButton?: boolean;
  onSubmit: (url: string) => void;
  onDelete?: () => void;
}) => {
  switch (tab) {
    case "upload": {
      if (!uploadFileProps) return null;
      return (
        <UploadFileContent
          uploadFileProps={uploadFileProps}
          onNewUrl={onSubmit}
        />
      );
    }
    case "link":
      return (
        <EmbedLinkContent
          defaultUrl={defaultUrl}
          onNewUrl={onSubmit}
          withVariableButton={linkWithVariableButton}
          onDelete={onDelete}
        />
      );
    case "giphy":
      return <GiphyContent onNewUrl={onSubmit} />;
    case "emoji":
      return <EmojiSearchableList onEmojiSelected={onSubmit} />;
    case "unsplash":
      return <UnsplashPicker imageSize={imageSize} onImageSelect={onSubmit} />;
    case "icon":
      return <IconPicker onIconSelected={onSubmit} />;
  }
};

type ContentProps = { onNewUrl: (url: string) => void };

const UploadFileContent = ({
  uploadFileProps,
  onNewUrl,
}: ContentProps & { uploadFileProps: FilePathUploadProps }) => {
  const { t } = useTranslate();

  return (
    <Flex justify="center" py="2">
      <UploadButton
        fileType="image"
        filePathProps={uploadFileProps}
        onFileUploaded={onNewUrl}
      >
        {t("editor.header.uploadTab.uploadButton.label")}
      </UploadButton>
    </Flex>
  );
};

const EmbedLinkContent = ({
  defaultUrl,
  onNewUrl,
  withVariableButton,
  onDelete,
}: ContentProps & {
  defaultUrl?: string;
  withVariableButton?: boolean;
  onDelete?: () => void;
}) => {
  const { t } = useTranslate();

  return (
    <Stack py="2">
      <TextInput
        placeholder={t("editor.header.linkTab.searchInputPlaceholder.label")}
        onChange={onNewUrl}
        defaultValue={defaultUrl ?? ""}
        withVariableButton={withVariableButton}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && e.currentTarget.value === "") {
            onDelete?.();
          }
        }}
      />
    </Stack>
  );
};

const GiphyContent = ({ onNewUrl }: ContentProps) => (
  <GiphyPicker onSubmit={onNewUrl} />
);
