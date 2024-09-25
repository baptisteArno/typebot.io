import {
  CheckIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import {
  CloseButton,
  Editable,
  EditableInput,
  EditablePreview,
  Fade,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SlideFade,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { sessionOnlySetVariableOptions } from "@typebot.io/blocks-logic/setVariable/constants";
import type { SetVariableBlock } from "@typebot.io/blocks-logic/setVariable/schema";
import { isNotEmpty } from "@typebot.io/lib/utils";
import type { Variable } from "@typebot.io/variables/schemas";
import { useDrag } from "@use-gesture/react";
import { type FormEvent, useState } from "react";
import { headerHeight } from "../../editor/constants";
import { useTypebot } from "../../editor/providers/TypebotProvider";
import { ResizeHandle } from "./ResizeHandle";

type Props = {
  onClose: () => void;
};
export const VariablesDrawer = ({ onClose }: Props) => {
  const { typebot, createVariable, updateVariable, deleteVariable } =
    useTypebot();
  const [width, setWidth] = useState(500);
  const [isResizeHandleVisible, setIsResizeHandleVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const filteredVariables = typebot?.variables.filter((v) =>
    isNotEmpty(searchValue)
      ? v.name.toLowerCase().includes(searchValue.toLowerCase())
      : true,
  );
  const [isVariableCreated, setIsVariableCreated] = useState(false);

  const useResizeHandleDrag = useDrag(
    (state) => {
      setWidth(-state.offset[0]);
    },
    {
      from: () => [-width, 0],
    },
  );

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsVariableCreated(true);
    setTimeout(() => setIsVariableCreated(false), 500);
    setSearchValue("");
    createVariable({
      id: createId(),
      isSessionVariable: true,
      name: searchValue,
    });
  };

  const setVariableAndInputBlocks =
    typebot?.groups.flatMap(
      (g) =>
        g.blocks.filter(
          (b) => b.type === LogicBlockType.SET_VARIABLE || isInputBlock(b),
        ) as (InputBlock | SetVariableBlock)[],
    ) ?? [];

  return (
    <Flex
      pos="absolute"
      right="0"
      top={`0`}
      h={`100%`}
      bgColor={useColorModeValue("white", "gray.900")}
      borderLeftWidth={"1px"}
      shadow="lg"
      borderLeftRadius={"lg"}
      onMouseOver={() => setIsResizeHandleVisible(true)}
      onMouseLeave={() => setIsResizeHandleVisible(false)}
      p="6"
      zIndex={10}
      style={{ width: `${width}px` }}
    >
      <Fade in={isResizeHandleVisible}>
        <ResizeHandle
          {...useResizeHandleDrag()}
          pos="absolute"
          left="-7.5px"
          top={`calc(50% - ${headerHeight}px)`}
        />
      </Fade>

      <Stack w="full" spacing="4">
        <CloseButton pos="absolute" right="1rem" top="1rem" onClick={onClose} />
        <Heading fontSize="md">Variables</Heading>
        <HStack as="form" onSubmit={handleCreateSubmit}>
          <Input
            width="full"
            placeholder="Search or create..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <SlideFade
            in={
              isVariableCreated ||
              (filteredVariables &&
                !filteredVariables.some((v) => v.name === searchValue))
            }
            unmountOnExit
            offsetY={0}
            offsetX={10}
          >
            <IconButton
              isDisabled={isVariableCreated}
              icon={isVariableCreated ? <CheckIcon /> : <PlusIcon />}
              aria-label="Create"
              type="submit"
              colorScheme={isVariableCreated ? "green" : "blue"}
              flexShrink={0}
            />
          </SlideFade>
        </HStack>

        <Stack overflowY="auto" py="1">
          {filteredVariables?.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              onChange={(changes) => updateVariable(variable.id, changes)}
              onDelete={() => deleteVariable(variable.id)}
              setVariableAndInputBlocks={setVariableAndInputBlocks}
            />
          ))}
        </Stack>
      </Stack>
    </Flex>
  );
};

const VariableItem = ({
  variable,
  onChange,
  onDelete,
  setVariableAndInputBlocks,
}: {
  variable: Variable;
  onChange: (variable: Partial<Variable>) => void;
  onDelete: () => void;
  setVariableAndInputBlocks: (InputBlock | SetVariableBlock)[];
}) => {
  const isSessionOnly = setVariableAndInputBlocks.some(
    (b) =>
      b.type === LogicBlockType.SET_VARIABLE &&
      sessionOnlySetVariableOptions.includes(
        b.options?.type as (typeof sessionOnlySetVariableOptions)[number],
      ) &&
      b.options?.variableId === variable.id,
  );

  const isLinkedToAnswer = setVariableAndInputBlocks.some(
    (b) => isInputBlock(b) && b.options?.variableId === variable.id,
  );

  return (
    <HStack justifyContent="space-between">
      <Editable
        defaultValue={variable.name}
        onSubmit={(name) => onChange({ name })}
        minWidth={0}
      >
        <EditablePreview
          px="2"
          noOfLines={1}
          cursor="text"
          _hover={{
            bg: useColorModeValue("gray.100", "gray.700"),
          }}
        />
        <EditableInput ml="1" pl="1" />
      </Editable>

      <HStack>
        {!isSessionOnly && !isLinkedToAnswer && (
          <Popover>
            <PopoverTrigger>
              <IconButton
                icon={<MoreHorizontalIcon />}
                aria-label={"Settings"}
                size="sm"
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverBody>
                <SwitchWithLabel
                  label="Save in results?"
                  moreInfoContent="Check this option if you want to save the variable value in the typebot Results table."
                  initialValue={!variable.isSessionVariable}
                  onCheckChange={() =>
                    onChange({
                      ...variable,
                      isSessionVariable: !variable.isSessionVariable,
                    })
                  }
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}
        <IconButton
          icon={<TrashIcon />}
          onClick={onDelete}
          aria-label="Delete"
          size="sm"
        />
      </HStack>
    </HStack>
  );
};
