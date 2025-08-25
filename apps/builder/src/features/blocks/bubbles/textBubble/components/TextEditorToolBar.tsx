import {
  BoldIcon,
  BracesIcon,
  ItalicIcon,
  LinkIcon,
  UnderlineIcon,
} from "@/components/icons";
import { HStack, type StackProps, useColorModeValue } from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from "@udecode/plate-basic-marks";
import { getPluginType, useEditorRef } from "@udecode/plate-core";
import { LinkToolbarButton } from "./plate/LinkToolbarButton";
import { MarkToolbarButton } from "./plate/MarkToolbarButton";

type Props = {
  onVariablesButtonClick: () => void;
} & StackProps;

export const TextEditorToolBar = ({
  onVariablesButtonClick,
  ...props
}: Props) => {
  const editor = useEditorRef();

  const handleVariablesButtonMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onVariablesButtonClick();
  };
  return (
    <HStack
      bgColor={useColorModeValue("white", "gray.900")}
      borderTopRadius="md"
      p={2}
      w="full"
      boxSizing="border-box"
      borderBottomWidth={1}
      {...props}
    >
      <Button
        aria-label="Insert variable"
        size="icon"
        onMouseDown={handleVariablesButtonMouseDown}
        variant="secondary"
        data-base-ui-click-trigger
      >
        <BracesIcon />
      </Button>
      <span data-testid="bold-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_BOLD)}
          aria-label="Toggle bold"
        >
          <BoldIcon />
        </MarkToolbarButton>
      </span>
      <span data-testid="italic-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_ITALIC)}
          aria-label="Toggle italic"
        >
          <ItalicIcon />
        </MarkToolbarButton>
      </span>
      <span data-testid="underline-button">
        <MarkToolbarButton
          nodeType={getPluginType(editor, MARK_UNDERLINE)}
          aria-label="Toggle underline"
        >
          <UnderlineIcon />
        </MarkToolbarButton>
      </span>
      <span data-testid="link-button">
        <LinkToolbarButton aria-label="Add link">
          <LinkIcon />
        </LinkToolbarButton>
      </span>
    </HStack>
  );
};
