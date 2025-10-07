import { useTranslate } from "@tolgee/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { cn } from "@typebot.io/ui/lib/cn";
import type { Variable } from "@typebot.io/variables/schemas";
import { BracesIcon } from "@/components/icons";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { useOpenControls } from "@/hooks/useOpenControls";

type Props = {
  onSelectVariable: (variable: Pick<Variable, "name" | "id">) => void;
} & ButtonProps;

export const VariablesButton = ({
  onSelectVariable,
  className,
  variant = "secondary",
  ...props
}: Props) => {
  const { t } = useTranslate();
  const controls = useOpenControls();

  return (
    <Popover.Root {...controls}>
      <Popover.Trigger>
        <Tooltip.Root>
          <Tooltip.TriggerButton
            aria-label={t("variables.button.tooltip")}
            variant={variant}
            size="icon"
            className={cn("size-10", className)}
            {...props}
          >
            <BracesIcon />
          </Tooltip.TriggerButton>
          <Tooltip.Popup>{t("variables.button.tooltip")}</Tooltip.Popup>
        </Tooltip.Root>
      </Popover.Trigger>
      <Popover.Popup className="p-0 data-[open]:duration-0">
        <VariablesCombobox
          initialVariableId={undefined}
          onSelectVariable={(variable) => {
            if (variable) {
              onSelectVariable(variable);
              controls.onClose();
            }
          }}
          defaultOpen
        />
      </Popover.Popup>
    </Popover.Root>
  );
};
