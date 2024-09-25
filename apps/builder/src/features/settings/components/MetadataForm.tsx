import { ImageUploadContent } from "@/components/ImageUploadContent";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { TextInput, Textarea } from "@/components/inputs";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import {
  FormLabel,
  HStack,
  Image,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import React from "react";

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
          Icon:
        </FormLabel>
        <Popover isLazy placement="top">
          <PopoverTrigger>
            <Image
              src={favIconUrl}
              w="20px"
              alt="Fav icon"
              cursor="pointer"
              _hover={{ filter: "brightness(.9)" }}
              transition="filter 200ms"
              rounded="md"
            />
          </PopoverTrigger>
          <PopoverContent p="4" w="400px">
            <ImageUploadContent
              uploadFileProps={{
                workspaceId,
                typebotId,
                fileName: "favIcon",
              }}
              defaultUrl={favIconUrl}
              onSubmit={handleFavIconSubmit}
              excludedTabs={["giphy", "unsplash", "emoji"]}
              imageSize="thumb"
            />
          </PopoverContent>
        </Popover>
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="image">
          Image:
        </FormLabel>
        <Popover isLazy placement="top">
          <PopoverTrigger>
            <Image
              src={imageUrl}
              alt="Website image"
              cursor="pointer"
              _hover={{ filter: "brightness(.9)" }}
              transition="filter 200ms"
              rounded="md"
            />
          </PopoverTrigger>
          <PopoverContent p="4" w="500px">
            <ImageUploadContent
              uploadFileProps={{
                workspaceId,
                typebotId,
                fileName: "ogImage",
              }}
              defaultUrl={imageUrl}
              onSubmit={handleImageSubmit}
              excludedTabs={["giphy", "icon", "emoji"]}
            />
          </PopoverContent>
        </Popover>
      </Stack>
      <TextInput
        label="Title:"
        defaultValue={metadata?.title ?? typebotName}
        onChange={handleTitleChange}
      />
      <Textarea
        defaultValue={
          metadata?.description ?? defaultSettings.metadata.description
        }
        onChange={handleDescriptionChange}
        label="Description:"
      />
      <TextInput
        defaultValue={metadata?.googleTagManagerId}
        placeholder="GTM-XXXXXX"
        onChange={handleGoogleTagManagerIdChange}
        label="Google Tag Manager ID:"
        moreInfoTooltip="Do not include it if you are embedding your typebot in an existing website. GTM should be installed in the parent website instead."
      />
      <Stack>
        <HStack as={FormLabel} mb="0" htmlFor="head">
          <Text>Custom head code:</Text>
          <MoreInfoTooltip>
            Will be pasted at the bottom of the header section, just above the
            closing head tag. Only `meta` and `script` tags are allowed.
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
    </Stack>
  );
};
