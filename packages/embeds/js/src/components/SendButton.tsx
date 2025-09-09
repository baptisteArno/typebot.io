import { isEmpty } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import { Match, Switch, splitProps } from "solid-js";
import { useChatContainerSize } from "@/contexts/ChatContainerSizeContext";
import { Button, type ButtonProps } from "./Button";
import { SendIcon } from "./icons/SendIcon";

type SendButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
} & ButtonProps;

export const SendButton = (props: SendButtonProps) => {
  const chatContainerSize = useChatContainerSize();
  const [local, buttonProps] = splitProps(props, [
    "isDisabled",
    "isLoading",
    "disableIcon",
  ]);

  const showIcon =
    (chatContainerSize() === "sm" && !local.disableIcon) ||
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
