import { isMobile } from "@/utils/isMobileSignal";
import { isEmpty } from "@typebot.io/lib/utils";
import clsx from "clsx";
import { Match, Switch, splitProps } from "solid-js";
import { Button, type ButtonProps } from "./Button";
import { SendIcon } from "./icons/SendIcon";

type SendButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
} & ButtonProps;

export const SendButton = (props: SendButtonProps) => {
  const [local, buttonProps] = splitProps(props, [
    "isDisabled",
    "isLoading",
    "disableIcon",
  ]);

  const showIcon =
    (isMobile() && !local.disableIcon) ||
    !buttonProps.children ||
    (typeof buttonProps.children === "string" && isEmpty(buttonProps.children));
  return (
    <Button
      {...buttonProps}
      type="submit"
      class={clsx(buttonProps.class, "flex items-center")}
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
