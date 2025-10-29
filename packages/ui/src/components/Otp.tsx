import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";
import { MinusSignIcon } from "../icons/MinusSignIcon";
import { cn } from "../lib/cn";

function Root({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function Slot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:ring-orange-8 data-[active=true]:aria-invalid:ring-red-8 border border-gray-7 relative flex size-14 text-lg items-center justify-center border-y border-r transition-all outline-hidden first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-gray-12 h-6 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function Separator({ ...props }: React.ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useAriaPropsForRole: we don't need aria attributes for this component
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusSignIcon />
    </div>
  );
}

export const Otp = {
  Root,
  Group,
  Slot,
  Separator,
};
