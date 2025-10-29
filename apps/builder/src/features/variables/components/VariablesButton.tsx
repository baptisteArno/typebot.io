import { useTranslate } from "@tolgee/react";
import type { ButtonProps } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { ThirdBracketIcon } from "@typebot.io/ui/icons/ThirdBracketIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type { Variable } from "@typebot.io/variables/schemas";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

type Props = {
  onSelectVariable: (variable: Pick<Variable, "name" | "id">) => void;
  offset?: number;
} & ButtonProps;

export const VariablesButton = ({
  onSelectVariable,
  className,
  offset,
  variant = "secondary",
  ...props
}: Props) => {
  const { t } = useTranslate();
  const controls = useOpenControls();

  return (
    <Popover.Root {...controls}>
      <Popover.Trigger
        render={(popoverProps) => (
          <Tooltip.Root>
            <Tooltip.TriggerButton
              {...popoverProps}
              aria-label={t("variables.button.tooltip")}
              variant={variant}
              size="icon"
              className={cn("size-10", className)}
              {...props}
            >
              <ThirdBracketIcon />
            </Tooltip.TriggerButton>
            <Tooltip.Popup>{t("variables.button.tooltip")}</Tooltip.Popup>
          </Tooltip.Root>
        )}
      />
      <Popover.Popup className="p-0 data-open:duration-0">
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
