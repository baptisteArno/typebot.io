import { type JSX, Show, children, splitProps } from "solid-js";
import { Spinner } from "./Spinner";

type Props = {
  variant?: "primary" | "secondary";
  children: JSX.Element;
  isDisabled?: boolean;
  isLoading?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: Props) => {
  const childrenReturn = children(() => props.children);
  const [local, buttonProps] = splitProps(props, ["disabled", "class"]);

  return (
    <button
      {...buttonProps}
      disabled={props.isDisabled || props.isLoading}
      class={
        "py-2 px-4 font-semibold focus:outline-none filter hover:brightness-90 active:brightness-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 flex justify-center" +
        (props.variant === "secondary"
          ? " secondary-button"
          : " typebot-button") +
        " " +
        local.class
      }
    >
      <Show when={!props.isLoading} fallback={<Spinner />}>
        {childrenReturn()}
      </Show>
    </button>
  );
};
