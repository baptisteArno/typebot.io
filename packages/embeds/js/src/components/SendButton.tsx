import { isMobile } from "@/utils/isMobileSignal";
import { isEmpty } from "@typebot.io/lib/utils";
import clsx from "clsx";
import { type JSX, Match, Switch, splitProps } from "solid-js";
import { Button } from "./Button";
import { SendIcon } from "./icons/SendIcon";

type SendButtonProps = {
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
  class?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const SendButton = (props: SendButtonProps) => {
  const [local, others] = splitProps(props, ["disableIcon"]);
  const showIcon =
    (isMobile() && !local.disableIcon) ||
    !props.children ||
    (typeof props.children === "string" && isEmpty(props.children));
  return (
    <Button
      type="submit"
      {...others}
      class={clsx("flex items-center", props.class)}
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
