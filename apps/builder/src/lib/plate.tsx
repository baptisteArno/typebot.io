import { LinkFloatingToolbar } from "@/features/blocks/bubbles/textBubble/components/plate/LinkFloatingInput";
import {
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { createPlugins } from "@udecode/plate-core";
import { ELEMENT_LINK, createLinkPlugin } from "@udecode/plate-link";
import type React from "react";

export const editorStyle = (backgroundColor: string): React.CSSProperties => ({
  flex: 1,
  padding: "1rem",
  backgroundColor,
  borderRadius: "0.25rem",
  outline: "none",
});

// Custom leaf component that filters out Plate.js internal props
const FilteredLeaf = ({
  children,
  leafPosition,
  pressed,
  leaf,
  text,
  attributes,
  ...props
}: any) => {
  // Filter out Plate-specific props that shouldn't be passed to DOM
  const {
    // Plate internal props that should not reach the DOM
    editor,
    element,
    path,
    // Add other problematic props here if they appear in future
    ...cleanProps
  } = props;

  return <span {...cleanProps}>{children}</span>;
};

export const platePlugins = createPlugins(
  [
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createLinkPlugin({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderAfterEditable: LinkFloatingToolbar as any,
      options: {
        isUrl: (url: string) =>
          url.startsWith("http:") ||
          url.startsWith("https:") ||
          url.startsWith("mailto:") ||
          url.startsWith("tel:") ||
          url.startsWith("sms:"),
        forceSubmit: true,
      },
    }),
  ],
  {
    components: {
      [ELEMENT_LINK]: (props) => (
        <a
          href={props.element.url}
          target="_blank"
          rel="noreferrer"
          className={props.className}
        >
          {props.children}
        </a>
      ),
      // Add custom leaf component to filter out problematic props
      leaf: FilteredLeaf,
    },
  },
);
