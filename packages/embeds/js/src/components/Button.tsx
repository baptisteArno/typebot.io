import { cn } from "@typebot.io/ui/lib/cn";
import { cva } from "@typebot.io/ui/lib/cva";
import { children, type JSX, Show, splitProps } from "solid-js";
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

export const buttonVariants = cva(
  "font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center flex-shrink-0 transition-[filter] duration-200",
  {
    variants: {
      variant: {
        primary:
          "typebot-button bg-button-bg text-button-text border-button-border rounded-button border-button blur-button shadow-button",
        secondary:
          "secondary-button bg-host-bubble-bg text-host-bubble-text rounded-host-bubble border-host-bubble border-host-bubble-border",
      },
      size: {
        icon: "text-sm size-6 pt-[3px]",
        sm: "py-2 px-4 text-sm",
        md: "py-2 px-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

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
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        buttonProps.class,
      )}
    >
      <Show when={!local.isLoading} fallback={<Spinner />}>
        {childrenReturn()}
      </Show>
    </button>
  );
};
