import type { TLinkElement } from "@typebot.io/rich-text/plate/index";
import { getLinkAttributes } from "@typebot.io/rich-text/plate/link";
import {
  PlateElement,
  type PlateElementProps,
} from "@typebot.io/rich-text/plate/react";

export const LinkNode = (props: PlateElementProps<TLinkElement>) => (
  <PlateElement
    {...props}
    as="a"
    className="underline"
    attributes={{
      ...props.attributes,
      ...getLinkAttributes(props.editor, props.element),
      onMouseOver: (e) => {
        e.stopPropagation();
      },
    }}
  >
    {props.children}
  </PlateElement>
);
