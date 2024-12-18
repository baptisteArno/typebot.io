import { cn } from "@/lib/utils";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";
import * as React from "react";

export interface SelectProps extends Ariakit.SelectProps {
  value?: string;
  setValue?: (value: string) => void;
  defaultValue?: string;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    { children, value, setValue, defaultValue, className, ...props },
    ref,
  ) {
    const select = Ariakit.useSelectStore({ value, setValue, defaultValue });
    const portalRef = React.useRef<HTMLDivElement>(null);
    const selectValue = Ariakit.useStoreState(select, "value");

    // Only call onBlur if the focus is leaving the whole widget.
    const onBlur = (event: React.FocusEvent<HTMLElement>) => {
      const portal = portalRef.current;
      const { selectElement, popoverElement } = select.getState();
      if (portal?.contains(event.relatedTarget)) return;
      if (selectElement?.contains(event.relatedTarget)) return;
      if (popoverElement?.contains(event.relatedTarget)) return;
      props.onBlur?.(event);
    };

    return (
      <>
        <Ariakit.Select
          ref={ref}
          {...props}
          store={select}
          onBlur={onBlur}
          className={cn(className)}
        >
          {selectValue || "Select an item"}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        <Ariakit.SelectPopover
          store={select}
          modal
          sameWidth
          gutter={4}
          onBlur={onBlur}
          portalRef={portalRef}
          className="popover"
        >
          {children}
        </Ariakit.SelectPopover>
      </>
    );
  },
);

export interface SelectItemProps extends Ariakit.SelectItemProps {}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem(props, ref) {
    return (
      <Ariakit.SelectItem
        ref={ref}
        {...props}
        className={clsx("select-item", props.className)}
      />
    );
  },
);
