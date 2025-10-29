import { Checkbox as CheckboxPrimitive } from "@base-ui-components/react/checkbox";
import { cn } from "../lib/cn";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "relative inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-gray-7 bg-gray-1 bg-clip-padding shadow-2xs ring-orange-8 transition-shadow outline-hidden before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(0.25rem-1px)] not-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-64 aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 dark:bg-clip-border dark:not-data-checked:bg-input/32 dark:not-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/8%)] dark:aria-invalid:ring-destructive/24 [:disabled,[data-checked],[aria-invalid]]:shadow-none",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute -inset-px flex items-center justify-center rounded-sm text-gray-1 data-checked:bg-orange-9 data-indeterminate:text-gray-12 data-unchecked:hidden"
        render={(props, state) => (
          <span {...props}>
            {state.indeterminate ? (
              <svg
                className="size-3"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.252 12h13.496" />
              </svg>
            ) : (
              <svg
                className="size-3"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
              </svg>
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
