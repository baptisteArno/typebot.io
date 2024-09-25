import type React from "react";
import type { SVGProps } from "react";
import { SendIcon } from "./icons";

type SendButtonProps = {
  label: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  disableIcon?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const SendButton = ({
  label,
  isDisabled,
  isLoading,
  disableIcon,
  ...props
}: SendButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isDisabled || isLoading}
      {...props}
      className={
        "py-2 px-4 justify-center font-semibold rounded-md text-white focus:outline-none flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-100 transition-all filter hover:brightness-90 active:brightness-75 typebot-button " +
        props.className
      }
    >
      {isLoading && <Spinner className="text-white" />}
      <span className={"xs:flex " + (disableIcon ? "" : "hidden")}>
        {label}
      </span>
      <SendIcon
        className={"send-icon flex " + (disableIcon ? "hidden" : "xs:hidden")}
      />
    </button>
  );
};

export const Spinner = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={"animate-spin -ml-1 mr-3 h-5 w-5 " + props.className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    data-testid="loading-spinner"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
