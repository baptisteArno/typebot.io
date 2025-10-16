import { Flex, SlideFade, Stack, useColorModeValue } from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { useTranslate } from "@tolgee/react";
import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { CardsItem } from "@typebot.io/blocks-inputs/cards/schema";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import { useState } from "react";
import { ImageOrPlaceholder } from "@/components/ImageOrPlaceholder";
import { ImageUploadContent } from "@/components/ImageUploadContent/ImageUploadContent";
import { SettingsIcon } from "@/components/icons";
import {
  MultiLineEditable,
  type MultiLineEditableProps,
} from "@/components/MultiLineEditable";
import {
  SingleLineEditable,
  type SingleLineEditableProps,
} from "@/components/SingleLineEditable";
import {
  GhostableItem,
  StacksWithGhostableItems,
} from "@/components/StackWithGhostableItems";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { BlockSourceEndpoint } from "@/features/graph/components/endpoints/BlockSourceEndpoint";
import { PlaceholderNode } from "@/features/graph/components/nodes/PlaceholderNode";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { CardsItemSettings } from "./CardsItemSettings";

type Props = {
  item: CardsItem;
  indices: ItemIndices;
  isMouseOver: boolean;
  blockId: string;
  groupId: string;
};

export const CardsItemNode = ({
  item,
  indices,
  isMouseOver,
  blockId,
  groupId,
}: Props) => {
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const { updateItem, deleteItemPath } = useTypebot();
  const { openedNodeId, setOpenedNodeId } = useGraph();

  const updateTitle = (value: string | null | undefined) => {
    updateItem(indices, {
      title: value,
    } as Item);
  };

  const updateDescription = (value: string | null | undefined) => {
    updateItem(indices, {
      description: value,
    } as Item);
  };

  const updateItemSettings = (options: CardsItem["options"]) => {
    updateItem(indices, { ...item, options } as Item);
  };

  const updateImage = (url: string | null | undefined) => {
    updateItem(indices, { ...item, imageUrl: url } as Item);
  };

  const addPath = () => {
    updateItem(indices, {
      paths: [...(item.paths ?? []), { id: createId() }],
    } as Item);
  };

  const deletePath = (idx: number) => {
    deleteItemPath({
      ...indices,
      pathIndex: idx,
    });
  };

  const updatePathText = (idx: number, value: string) => {
    updateItem(indices, {
      paths: item.paths?.map((path, i) =>
        i === idx ? { ...path, text: value } : path,
      ),
    } as Item);
  };

  return (
    <Popover.Root
      isOpen={openedNodeId === item.id}
      onOpen={(event) => {
        if (event?.type === "click") return;
        setOpenedNodeId(item.id);
      }}
      onClose={() => setOpenedNodeId(undefined)}
    >
      <Popover.Trigger
        render={(props) => (
          <Stack {...props} gap={0} justify="center" w="full">
            <StacksWithGhostableItems gapPixel={8}>
              <GhostableItem
                ghostLabel="Add image"
                onGhostClick={() => {
                  updateImage(undefined);
                }}
              >
                {item.imageUrl !== null ? (
                  <Popover.Root
                    isOpen={
                      openedNodeId === `${item.id}-${indices.itemIndex}-image`
                    }
                    onOpen={() =>
                      setOpenedNodeId(`${item.id}-${indices.itemIndex}-image`)
                    }
                    onClose={() => setOpenedNodeId(undefined)}
                  >
                    <Popover.Trigger>
                      <ImageOrPlaceholder
                        className="w-full h-[110px] flex-shrink-0 transition-filter rounded-md hover:brightness-95 rounded-b-none"
                        src={item.imageUrl ?? undefined}
                      />
                    </Popover.Trigger>
                    <Popover.Popup side="right" className="max-w-[400px]">
                      {typebot && (
                        <ImageUploadContent
                          uploadFileProps={{
                            workspaceId: typebot?.workspaceId,
                            typebotId: typebot?.id,
                            blockId: item.id,
                            itemId: item.id,
                          }}
                          defaultUrl={item.imageUrl ?? undefined}
                          onSubmit={(url) => {
                            updateImage(url);
                          }}
                          onDelete={() => {
                            updateImage(null);
                          }}
                          additionalTabs={{
                            giphy: true,
                            unsplash: true,
                          }}
                        />
                      )}
                    </Popover.Popup>
                  </Popover.Root>
                ) : null}
              </GhostableItem>
              <GhostableItem
                ghostLabel="Add title"
                onGhostClick={() => {
                  updateTitle(undefined);
                }}
                className="mx-2"
              >
                {item.title !== null ? (
                  <SingleLineDeletableEditable
                    className={cx(
                      "flex-1 text-sm font-semibold px-2",
                      item.description !== null && "-mb-2",
                    )}
                    defaultValue={item.title ?? "Title"}
                    defaultEdit={item.title === undefined}
                    onValueCommit={updateTitle}
                    onDelete={() => updateTitle(null)}
                  />
                ) : null}
              </GhostableItem>
              <GhostableItem
                ghostLabel="Add description"
                onGhostClick={() => {
                  updateDescription(undefined);
                }}
                className="mx-2"
              >
                {item.description !== null ? (
                  <MultiLineDeletableEditable
                    className={cx("flex-1 text-xs mb-2 px-2")}
                    defaultValue={item.description ?? "Description"}
                    defaultEdit={item.description === undefined}
                    onValueCommit={updateDescription}
                    onDelete={() => updateDescription(null)}
                  />
                ) : null}
              </GhostableItem>
            </StacksWithGhostableItems>

            <Stack gap={0} px="2">
              {item.paths?.map((path, idx) => (
                <SingleLineDeletableEditable
                  onDelete={() => deletePath(idx)}
                  key={path.id}
                  onValueCommit={(value) => updatePathText(idx, value)}
                  defaultValue={path.text ?? "Button"}
                  defaultEdit={path.text === undefined}
                  className={cn("relative")}
                  common={{
                    className: cn(
                      "justify-center text-center text-sm relative border-gray-6 rounded-none",
                      idx === 0 && "rounded-t-md border-b-0",
                      idx !== 0 && "border border-b-0",
                      idx === (item.paths?.length ?? 1) - 1 &&
                        "rounded-b-md border-b",
                    ),
                  }}
                >
                  <BlockSourceEndpoint
                    source={{
                      blockId,
                      itemId: item.id,
                      pathId: path.id,
                    }}
                    groupId={groupId}
                    pos="absolute"
                    right="-57px"
                    bottom="-2px"
                    pointerEvents="all"
                  />
                </SingleLineDeletableEditable>
              ))}
              <PlaceholderNode
                hitboxYExtensionPixels={5}
                expandedHeightPixels={30}
                initialPaddingPixel={0}
                expandedPaddingPixel={0}
                roundedTop={0}
                fontSize="xs"
                fontWeight="medium"
                onClick={addPath}
              >
                Add button
              </PlaceholderNode>
            </Stack>

            <SlideFade
              offsetY="5px"
              offsetX="-5px"
              in={isMouseOver}
              style={{
                position: "absolute",
                right: "-0.25rem",
                top: "-0.25rem",
                zIndex: 3,
              }}
              unmountOnExit
            >
              <Flex
                bgColor={useColorModeValue("white", "gray.900")}
                rounded="md"
              >
                <Button
                  aria-label={t("blocks.inputs.button.openSettings.ariaLabel")}
                  variant="ghost"
                  size="icon"
                  className="shadow-md"
                  onClick={() => setOpenedNodeId(item.id)}
                >
                  <SettingsIcon />
                </Button>
              </Flex>
            </SlideFade>
          </Stack>
        )}
      />
      <Popover.Popup side="right" className="p-4">
        <CardsItemSettings
          options={item.options}
          onSettingsChange={updateItemSettings}
        />
      </Popover.Popup>
    </Popover.Root>
  );
};

const SingleLineDeletableEditable = ({
  defaultValue,
  className,
  defaultEdit,
  children,
  preview,
  input,
  common,
  onValueCommit,
  onDelete,
}: Omit<SingleLineEditableProps, "value"> & {
  defaultValue: string;
  onDelete: () => void;
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value === "") onDelete();
  };

  return (
    <SingleLineEditable
      className={className}
      value={value}
      defaultEdit={defaultEdit}
      input={{
        ...input,
        onValueChange: setValue,
        onKeyDownCapture: handleKeyPress,
      }}
      common={common}
      preview={preview}
      onValueCommit={() => onValueCommit(value)}
    >
      {children}
    </SingleLineEditable>
  );
};

const MultiLineDeletableEditable = ({
  defaultValue,
  className,
  defaultEdit,
  onValueCommit,
  onDelete,
}: Omit<MultiLineEditableProps, "value"> & {
  defaultValue: string;
  onDelete: () => void;
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && value === "") onDelete();
  };

  return (
    <MultiLineEditable
      className={className}
      value={value}
      defaultEdit={defaultEdit}
      input={{
        onValueChange: setValue,
        onKeyDownCapture: handleKeyPress,
      }}
      onValueCommit={() => onValueCommit(value)}
    />
  );
};
