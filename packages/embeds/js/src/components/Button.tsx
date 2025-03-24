import { cx } from "@typebot.io/ui/lib/cva";
import { type JSX, Show, children, splitProps } from "solid-js";
import { Spinner } from "./Spinner";

export type ButtonProps = {
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
  isDisabled?: boolean;
  isLoading?: boolean;
} & Pick<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "children" | "type" | "on:click"
>;

export const Button = (props: ButtonProps) => {
  const childrenReturn = children(() => props.children);
  const [local, buttonProps] = splitProps(props, [
    "variant",
    "size",
    "isDisabled",
    "isLoading",
  ]);

  return (
    <button
      {...buttonProps}
      disabled={local.isDisabled || local.isLoading}
      class={cx(
        "py-2 px-4 font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center flex-shrink-0 transition-[filter] duration-200",
        local.variant === "secondary"
          ? "secondary-button bg-host-bubble-bg text-host-bubble-text rounded-host-bubble border-host-bubble border-host-bubble-border"
          : "typebot-button bg-button-bg text-button-text border-button-border rounded-button border-button blur-button shadow-button",
        local.size === "sm" ? "text-sm" : "",
        buttonProps.class,
      )}
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        {childrenReturn()}
      </Show>
    </button>
  );
};
