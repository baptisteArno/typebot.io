import { UserIcon } from "@/components/icons";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  Flex,
  IconButton,
  type IconButtonProps,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { Variable } from "@typebot.io/variables/schemas";
import React, { useRef } from "react";

type Props = {
  onSelectVariable: (variable: Pick<Variable, "name" | "id">) => void;
} & Omit<IconButtonProps, "aria-label">;

export const VariablesButton = ({ onSelectVariable, ...props }: Props) => {
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const popoverRef = useRef<HTMLDivElement>(null);
  const { ref: parentModalRef } = useParentModal();

  useOutsideClick({
    ref: popoverRef,
    handler: onClose,
    isEnabled: isOpen,
  });

  return (
    <Popover isLazy isOpen={isOpen}>
      <PopoverAnchor>
        <Flex>
          <Tooltip label={t("variables.button.tooltip")}>
            <IconButton
              aria-label={t("variables.button.tooltip")}
              icon={<UserIcon />}
              pos="relative"
              onClick={onOpen}
              {...props}
            />
          </Tooltip>
        </Flex>
      </PopoverAnchor>
      <Portal containerRef={parentModalRef}>
        <PopoverContent w="full" ref={popoverRef}>
          <VariableSearchInput
            initialVariableId={undefined}
            onSelectVariable={(variable) => {
              onClose();
              if (variable) onSelectVariable(variable);
            }}
            placeholder={t("variables.button.searchInput.placeholder")}
            shadow="lg"
            autoFocus
          />
        </PopoverContent>
      </Portal>
    </Popover>
  );
};
