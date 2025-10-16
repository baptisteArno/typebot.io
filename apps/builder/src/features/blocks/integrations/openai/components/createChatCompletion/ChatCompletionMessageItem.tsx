import { HStack, Stack, Text } from "@chakra-ui/react";
import {
  chatCompletionMessageCustomRoles,
  chatCompletionMessageRoles,
  deprecatedRoles,
} from "@typebot.io/blocks-integrations/openai/constants";
import type { ChatCompletionOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import type { TableListItemProps } from "@/components/TableList";

type Props = TableListItemProps<
  NonNullable<ChatCompletionOpenAIOptions["messages"]>[number]
>;

const roles = [
  ...chatCompletionMessageCustomRoles,
  ...chatCompletionMessageRoles,
];

export const ChatCompletionMessageItem = ({ item, onItemChange }: Props) => {
  const changeRole = (role: (typeof roles)[number] | undefined) => {
    onItemChange({
      ...item,
      role,
      content: undefined,
    });
  };

  const changeSingleMessageContent = (content: string) => {
    if (item.role === "Messages sequence ✨" || item.role === "Dialogue")
      return;
    onItemChange({ ...item, content });
  };

  const updateDialogueVariableId = (
    variable: Pick<Variable, "id"> | undefined,
  ) => {
    if (item.role !== "Dialogue") return;
    onItemChange({ ...item, dialogueVariableId: variable?.id });
  };

  const updateStartsBy = (startsBy: "user" | "assistant") => {
    if (item.role !== "Dialogue") return;
    onItemChange({ ...item, startsBy });
  };

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <BasicSelect
        value={item.role}
        onChange={changeRole}
        items={roles.filter(
          (role) =>
            !deprecatedRoles.includes(role as (typeof deprecatedRoles)[number]),
        )}
        placeholder="Select type"
      />
      <ChatCompletionMessageItemContent
        item={item}
        onChangeSingleMessageContent={changeSingleMessageContent}
        onChangeDialogueVariableId={updateDialogueVariableId}
        onStartsByChange={updateStartsBy}
      />
    </Stack>
  );
};

const ChatCompletionMessageItemContent = ({
  onChangeSingleMessageContent,
  onChangeDialogueVariableId,
  onStartsByChange,
  item,
}: {
  onChangeSingleMessageContent: (content: string) => void;
  onChangeDialogueVariableId: (
    variable: Pick<Variable, "id"> | undefined,
  ) => void;
  onStartsByChange: (startsBy: "user" | "assistant") => void;
  item: NonNullable<ChatCompletionOpenAIOptions["messages"]>[number];
}) => {
  switch (item.role) {
    case undefined:
    case "assistant":
    case "user":
    case "system":
      return (
        <DebouncedTextareaWithVariablesButton
          defaultValue={item.content}
          onValueChange={onChangeSingleMessageContent}
          placeholder="Content"
        />
      );
    case "Dialogue":
      return (
        <Stack alignItems="flex-end">
          <VariablesCombobox
            initialVariableId={item.dialogueVariableId}
            onSelectVariable={onChangeDialogueVariableId}
            placeholder="Dialogue variable"
          />
          <HStack>
            <Text>starts by</Text>
            <BasicSelect
              value={item.startsBy ?? "user"}
              onChange={onStartsByChange}
              items={["user", "assistant"]}
            />
          </HStack>
        </Stack>
      );
    case "Messages sequence ✨":
      return null;
  }
};
