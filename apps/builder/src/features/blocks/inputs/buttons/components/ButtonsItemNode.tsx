import { SettingsIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import {
  Editable,
  EditablePreview,
  EditableTextarea,
  Flex,
  IconButton,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  SlideFade,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { convertStrToList } from "@typebot.io/lib/convertStrToList";
import { isEmpty } from "@typebot.io/lib/utils";
import { useRef, useState } from "react";
import { ButtonsItemSettings } from "./ButtonsItemSettings";

type Props = {
  item: ButtonItem;
  indices: ItemIndices;
  isMouseOver: boolean;
};

export const ButtonsItemNode = ({ item, indices, isMouseOver }: Props) => {
  const { t } = useTranslate();
  const { deleteItem, updateItem, createItem } = useTypebot();
  const { openedNodeId, setOpenedNodeId } = useGraph();
  const [itemValue, setItemValue] = useState(
    item.content ??
      (indices.itemIndex === 0
        ? t("blocks.inputs.button.clickToEdit.label")
        : ""),
  );
  const editableRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const arrowColor = useColorModeValue("white", "gray.900");

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation();

  const handleInputSubmit = () => {
    if (itemValue === "") deleteItem(indices);
    else
      updateItem(indices, {
        content: itemValue === "" ? undefined : itemValue,
      } as Item);
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Escape" &&
      (itemValue === t("blocks.inputs.button.clickToEdit.label") ||
        itemValue === "")
    )
      deleteItem(indices);
    if (
      e.key === "Enter" &&
      itemValue !== "" &&
      itemValue !== t("blocks.inputs.button.clickToEdit.label")
    )
      appendButton();
  };

  const handleEditableChange = (val: string) => {
    if (
      itemValue !== "" &&
      itemValue !== t("blocks.inputs.button.clickToEdit.label")
    )
      return setItemValue(val);
    const values = convertStrToList(val);
    if (values.length === 1) {
      setItemValue(values[0]);
    } else {
      setItemValue(values[0]);
      values.slice(1).forEach((v, i) => {
        createItem(
          { content: v },
          { ...indices, itemIndex: indices.itemIndex + i + 1 },
        );
      });
    }
  };

  const appendButton = () => {
    const itemIndex = indices.itemIndex + 1;
    createItem({}, { ...indices, itemIndex });
  };

  const updateItemSettings = (settings: Omit<ButtonItem, "content">) => {
    updateItem(indices, { ...item, ...settings });
  };

  return (
    <Popover
      placement="right"
      isLazy
      isOpen={openedNodeId === item.id}
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Flex px={4} py={2} justify="center" w="90%">
          <Editable
            ref={editableRef}
            flex="1"
            startWithEditView={
              isEmpty(item.content) ||
              item.content === t("blocks.inputs.button.clickToEdit.label")
            }
            value={itemValue}
            onChange={handleEditableChange}
            onSubmit={handleInputSubmit}
            onKeyDownCapture={handleKeyPress}
            maxW="180px"
          >
            <EditablePreview
              w="full"
              color={
                item.content !== t("blocks.inputs.button.clickToEdit.label")
                  ? "inherit"
                  : "gray.500"
              }
              cursor="pointer"
            />
            <EditableTextarea
              onMouseDownCapture={(e) => e.stopPropagation()}
              resize="none"
              onWheelCapture={(e) => e.stopPropagation()}
            />
          </Editable>
          <SlideFade
            offsetY="0px"
            offsetX="-10px"
            in={isMouseOver}
            style={{
              position: "absolute",
              left: "-40px",
              zIndex: 3,
            }}
            unmountOnExit
          >
            <Flex bgColor={useColorModeValue("white", "gray.900")} rounded="md">
              <IconButton
                aria-label={t("blocks.inputs.button.openSettings.ariaLabel")}
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                shadow="md"
                onClick={() => setOpenedNodeId(item.id)}
              />
            </Flex>
          </SlideFade>
        </Flex>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow bgColor={arrowColor} />
          <PopoverBody
            py="6"
            overflowY="auto"
            maxH="400px"
            shadow="md"
            ref={ref}
          >
            <ButtonsItemSettings
              item={item}
              onSettingsChange={updateItemSettings}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
