import clsx from "clsx";
import { type JSX, Show, children, splitProps } from "solid-js";
import { Spinner } from "./Spinner";

export type ButtonProps = {
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
    "isDisabled",
    "isLoading",
  ]);

  return (
    <button
      {...buttonProps}
      disabled={local.isDisabled || local.isLoading}
      class={clsx(
        "py-2 px-4 font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center flex-shrink-0",
        local.variant === "secondary" ? " secondary-button" : " typebot-button",
        buttonProps.class,
      )}
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        {childrenReturn()}
      </Show>
    </button>
  );
};
