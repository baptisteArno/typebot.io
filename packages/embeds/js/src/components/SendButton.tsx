import { useBotContainer } from "@/contexts/BotContainerContext";
import { getContainerSize } from "@/utils/getContainerSize";
import { isEmpty } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import { Match, Switch, splitProps } from "solid-js";
import { Button, type ButtonProps } from "./Button";
import { SendIcon } from "./icons/SendIcon";

type SendButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
} & ButtonProps;

export const SendButton = (props: SendButtonProps) => {
  const botContainer = useBotContainer();
  const [local, buttonProps] = splitProps(props, [
    "isDisabled",
    "isLoading",
    "disableIcon",
  ]);
  const botContainerSize = botContainer()
    ? getContainerSize(botContainer()!)
    : "sm";

  const showIcon =
    (botContainerSize === "sm" && !local.disableIcon) ||
    !buttonProps.children ||
    (typeof buttonProps.children === "string" && isEmpty(buttonProps.children));
  return (
    <Button
      {...buttonProps}
      type="submit"
      class={cx(buttonProps.class, "flex items-center")}
      aria-label={showIcon ? "Send" : undefined}
    >
      <Switch>
        <Match when={showIcon}>
          <SendIcon
            class={
              "send-icon flex w-6 h-6 " + (local.disableIcon ? "hidden" : "")
            }
          />
        </Match>
        <Match when={!showIcon}>{props.children}</Match>
      </Switch>
    </Button>
  );
};
